import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import serverless from "serverless-http";
import express from "express";
import cors from 'cors'
import { createWallet } from "./util.js";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
// must put before agent init
 Coinbase.configure({ apiKeyName: process.env.CB_API_KEY_NAME, privateKey: process.env.CB_PRIVATE_KEY, useServerSigner: true })

import { parseEther } from "viem";
import fs from 'fs'
import { initializeAgent } from "./agent.js";
import { HumanMessage } from "@langchain/core/messages";
import postgres from "postgres"
import { expressjwt } from "express-jwt";


const sql = postgres(process.env.POSTGRES_URL)

const abi = JSON.parse(fs.readFileSync('./abi.json', 'utf8'))
// import abi from './abi.json' with {type: 'json'}  
const app = express();
const sqs = new SQSClient();
const chain_id = 8453
app.use(cors())
app.use(express.json())

app.post('/transfer', async (req, res) => {
  const { to, amount, wallet_id } = req.body
  const wallet = await Wallet.fetch(wallet_id)
  // const balance = await wallet.getBalance(Coinbase.assets.Eth)
  // console.log("balance", balance)
  let transfer = await wallet.createTransfer({
    amount: amount,
    assetId: Coinbase.assets.Eth,
    destination: to
  })
  transfer = await transfer.wait({ timeoutSeconds: 30, intervalSeconds: 1 })
    .catch(e => {
      console.error(e)
      return null
    })
  res.json({ transfer })
})

// app.post('/messages', expressjwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }), async (req, res) => {
app.post('/messages', async (req, res) => {
  try {

    // console.log(req.auth)
    const { message } = req.body
    const { wallet_id } = await sql`SELECT wallet_id FROM users WHERE phone_number = '60175909500'`.then(o => o[0])
    console.log("wallet_id", wallet_id)
    const { agent, config } = await initializeAgent(wallet_id)
    config.configurable.thread_id = wallet_id
    const stream = await agent.stream({ messages: [new HumanMessage(message)] }, config);

    let agent_message = ""
    let tools_message = ""
    for await (const chunk of stream) {
      if ("agent" in chunk) {
        agent_message += chunk.agent.messages[0].content
      } else if ("tools" in chunk) {
        tools_message += chunk.tools.messages[0].content
      }
    }
    res.json({ agent_message, tools_message })
  } catch (err) {
    console.error(err)
    res.json({ error: err.message })
  }

})

app.post('/producer', async (req, res) => {

  // const reqbody = JSON.parse(req.body)
  const response = await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: req.body.toString(),
  }));

  res.json({ id: response.MessageId })
})

app.get('/wallets', async (req, res) => {
  const wallet = await createWallet()
  res.json({ wallet })
})

app.post('/charges', async (req, res) => {

  console.log('charges')
  const {
    booking_name,
    booking_description,
    amount,
    booking_id
  } = req.body

  console.log('charges', booking_name, booking_description, amount, booking_id)

  const response = await fetch("https://api.commerce.coinbase.com/charges", {
    method: "POST",
    headers: {
      "X-CC-Api-Key": process.env.CB_COMMERCE_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "name": booking_name,
      "description": booking_description,
      "pricing_type": "fixed_price",
      "local_price": {
        "amount": amount.toString(),
        "currency": "ETH"
      },
      "metadata": {
        "booking_id": booking_id
      }
    })
  })
    .then(o => o.json())

  res.json({ charge_id: response.data.id })
})

app.post('/refund', async (req, res) => {
  const { from_wallet_id, to_wallet_id,amount } = req.body
  const wallet = await Wallet.fetch(from_wallet_id)
  const trade = await wallet.createTrade({
    fromAssetId: "usdc",
    toAssetId: "eth",
    amount: amount,
  })

  const transfer = await wallet.createTransfer({
    amount: amount,
    assetId: Coinbase.assets.Eth,
    destination: to_wallet_id
  })


  res.json({ trade, transfer })
})

app.post('/charges/:charge_id/pay', async (req, res) => {

  const { wallet_id } = req.body
  if (!wallet_id) {
    return res.status(400).json({ error: "wallet_id is required" })
  }
  console.log("wallet_id", wallet_id)
  console.log("charge_id", req.params.charge_id)

  const wallet = await Wallet.fetch(wallet_id)
  const hydrate = await fetch(`https://api.commerce.coinbase.com/charges/${req.params.charge_id}/hydrate`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      "chain_id": chain_id,
      "sender": wallet.model.default_address.address_id
    })
  })
    .then((response) => response.json())

  console.log("hydrate", JSON.stringify(hydrate))

  if (hydrate.error) {
    console.error("hydrate error", hydrate.error)
    return res.json({ error: hydrate.error.message })
  }

  const balance = await wallet.getBalance(Coinbase.assets.Eth)
  if (balance < hydrate.data.pricing.local.amount * 1.05) {
    return res.json({ error: "Insufficient balance" })
    throw new Error("Insufficient balance")
  }

  const call_data = hydrate.data.web3_data.transfer_intent.call_data

  const poolFeesTier = 500;

  const invoke = await wallet.invokeContract({
    abi,
    contractAddress: hydrate.data.web3_data.transfer_intent.metadata.contract_address,
    assetId: Coinbase.assets.Wei,
    method: "swapAndTransferUniswapV3Native",
    args: {
      _intent: [
        BigInt(call_data.recipient_amount).toString(),
        BigInt(Math.floor(new Date(call_data.deadline).getTime() / 1000)).toString(),
        call_data.recipient,
        call_data.recipient_currency,
        call_data.refund_destination,
        BigInt(call_data.fee_amount).toString(),
        call_data.id,
        call_data.operator,
        call_data.signature,
        call_data.prefix,
      ],
      poolFeesTier: poolFeesTier.toString()
    },
    amount: parseEther((hydrate.data.pricing.local.amount * 1.05).toString())

  })

  console.log("invoke", JSON.stringify(invoke))
  // const invoke = ContractInvocation.fromModel({
  //   "contract_invocation_id": "34d63729-ebd9-4ecc-b97d-8de8af2e366e",
  //   "wallet_id": "f8b2c6a9-39aa-442e-974b-c0f7cbfed044r",
  //   "address_id": "0x23b13069BDf2814BBAB268719601CC0a4C1f7c65"
  // })

  const result = await invoke.wait({ timeoutSeconds: 30000 })
  console.log("result", JSON.stringify(result))

  return res.json({ tx: result.getTransactionHash(), result })
})

const consumer = async (event) => {
  try {
    console.log(JSON.stringify(event))

  } catch (err) {
    console.error(err)
  }
};

const api = serverless(app)

export {
  app,
  api,
  consumer,
};
