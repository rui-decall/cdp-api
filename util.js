
// import { createPublicClient, createWalletClient, http, parseEther } from "viem";
// import { base } from "viem/chains";
// import { privateKeyToAccount } from "viem/accounts";
// import coinbaseAbi from "./abi/coinbase.json";

import {  Coinbase, Wallet } from "@coinbase/coinbase-sdk";


// export async function gaslessBroadcast() {

// const RPC_URL = 'https://api.developer.coinbase.com/rpc/v1/base/Fk58oFWjRRHBBKU4SJHzbr8U4YMrgARY'

// const client = createPublicClient({
//   chain: base,
//   transport: http(RPC_URL),
// })

// const account = toCoinbaseSmartAccount({
//   client,
//   owners: [wallet]
// });

// const bundlerClient = createBundlerClient({
//   account,
//   client,
//   transport: http(RPC_URL),
//   chain: base,
// });

// account.userOperation = {
//     estimateGas: async (userOperation) => {
//       const estimate = await bundlerClient.estimateUserOperationGas(
//         userOperation
//       );
//       estimate.preVerificationGas = estimate.preVerificationGas * 2n;
//       return estimate;
//     },
//   };
  
//   try {
//     const userOpHash = await bundlerClient.sendUserOperation({
//       account,
//       calls: [
//         {
//           abi: abi,
//           functionName: "swapAndTransferUniswapV3Native",
//           to: hydrate.data.web3_data.transfer_intent.metadata.contract_address,
//           value: parseEther((hydrate.data.pricing.local.amount * 1.5).toString()),
//           args: [{
//             recipientAmount: BigInt(call_data.recipient_amount),
//             deadline: BigInt(
//               Math.floor(new Date(call_data.deadline).getTime() / 1000),
//           ),
//           recipient: call_data.recipient,
//           recipientCurrency: call_data.recipient_currency,
//           refundDestination: call_data.refund_destination,
//           feeAmount: BigInt(call_data.fee_amount),
//           id: call_data.id,
//           operator: call_data.operator,
//           signature: call_data.signature,
//           prefix: call_data.prefix,
//           }, poolFeesTier],
//           // args: [account.address, 1],
//         },
//       ],
//       paymaster: true,
//     });
  
//     const receipt = await bundlerClient.waitForUserOperationReceipt({
//       hash: userOpHash,
//     });
  
//     console.log("✅ Transaction successfully sponsored!");
//     console.log(
//       `⛽ View sponsored UserOperation on blockscout: https://base-sepolia.blockscout.com/op/${receipt.userOpHash}`
//     );
//     console.log(
//       `🔍 View NFT mint on basescan: https://sepolia.basescan.org/address/${account.address}`
//     );
//     process.exit();
//   } catch (error) {
//     console.log("Error sending trasnaction: ", error);
//     process.exit(1);
//   }
// }

export async function createWallet() {
    const wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet})
    return wallet
    // console.log(wallet.getId())
    // const wallet = await Wallet.createWithSeed({ networkId: Coinbase.networks.BaseMainnet})
    // console.log(wallet)

    // const walletData = wallet.export()
    // console.log(JSON.stringify(walletData, null, 2))
    // Coinbase.useServerSigner = true;
    // let serverSigner = await ServerSigner.getDefault();
    // console.log(serverSigner)
    
    // const wallet = await Wallet.fetch("f8b2c6a9-39aa-442e-974b-c0f7cbfed044")
    // console.log(wallet)
    // let serverSigner = await ServerSigner.getDefault();  
    // let wallet = await Wallet.create({ networkId: Coinbase.networks.BaseMainnet})
    // console.log(await wallet.listBalances())
    // const transfer = await wallet.createTransfer({
    //     amount: 0.00001,
    //     assetId: "Eth",
    //     destination: "0x19950317f772DA1652B02fe4AA11f89824fa2dE7",
    //     // networkId: Coinbase.networks.BaseMainnet,
    //     // gasless: true,
    // })
    // console.log(transfer)
    // let transfer = Transfer.fromModel({
    //     transfer_id: "f8eee190-9f28-4743-b117-1cc350ebddc0",
    //     wallet_id: "f8b2c6a9-39aa-442e-974b-c0f7cbfed044",
    //     address_id: '0x23b13069BDf2814BBAB268719601CC0a4C1f7c65',
    //     gasless: true,
    // })

    // await transfer.reload()
    // console.log(transfer)
    // await transfer.wait({ timeoutSeconds: 60 })
    //     .then(res => console.log(res))
    // await transfer.reload()
    // transfer.getTransaction()
    // console.log(transfer.getTransaction())
//     let address = await wallet.getDefaultAddress();
// console.log(`Address: ${address}`);

//     console.log(JSON.stringify(wallet.export(), null, 2))
    // return serverSigner
  
}

// export async function createAndPayCharge(
//     booking_id,
//     booking_name,
//     booking_description,
//     amount,
//     rpc_url,
//     chain_id,
//     fromWallet
// ) {

//     const publicClient = createPublicClient({
//         chain: base,
//         transport: http(rpc_url),
//     })

//     const balance = await publicClient.getBalance({
//         address: fromWallet.wallet_address as `0x${string}`
//     })

//     console.log('balance', balance)

//     if (balance < parseEther(amount.toString())) {
//         throw new Error("Insufficient balance")
//     }

//     const response = await fetch("https://api.commerce.coinbase.com/charges", {
//         method: "POST",
//         headers: {
//             "X-CC-Api-Key": "1befce4f-0aec-475a-ac07-c37e962e4d46",
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             "name": booking_name,
//             "description": booking_description,
//             "pricing_type": "fixed_price",
//             "local_price": {
//                 "amount": amount.toString(),
//                 "currency": "ETH"
//             },
//             "metadata": {
//                 "booking_id": booking_id
//             }
//         })
//     })
//         .then(res => res.json())
//     console.log("response", JSON.stringify(response, null, 2))

//     const hydrate: any = await fetch(`https://api.commerce.coinbase.com/charges/${response.data.id}/hydrate`, {
//         method: "PUT",
//         headers: {
//             "content-type": "application/json",
//         },
//         body: JSON.stringify({
//             "chain_id": chain_id,
//             "sender": fromWallet.wallet_address
//         })
//     })
//         .then((response) => response.json())

//     console.log("hydrate", JSON.stringify(hydrate, null, 2))


//     const call_data = hydrate.data.web3_data.transfer_intent.call_data


//     const account = privateKeyToAccount(fromWallet.private_key as `0x${string}`)

//     if (account.address !== hydrate.data.web3_data.transfer_intent.metadata.sender) {
//         throw new Error("Account does not match sender")
//     }

//     const poolFeesTier = 500;
//     const estimate = await publicClient.simulateContract({
//         abi: coinbaseAbi,
//         account,
//         address: hydrate.data.web3_data.transfer_intent.metadata.contract_address as `0x${string}`,
//         functionName: "swapAndTransferUniswapV3Native",
//         args: [{
//             recipientAmount: BigInt(call_data.recipient_amount),
//             deadline: BigInt(
//                 Math.floor(new Date(call_data.deadline).getTime() / 1000),
//             ),
//             recipient: call_data.recipient,
//             recipientCurrency: call_data.recipient_currency,
//             refundDestination: call_data.refund_destination,
//             feeAmount: BigInt(call_data.fee_amount),
//             id: call_data.id,
//             operator: call_data.operator,
//             signature: call_data.signature,
//             prefix: call_data.prefix,
//         }, poolFeesTier],
//         value: parseEther((hydrate.data.pricing.local.amount * 1.5).toString())
//     })

//     const walletClient = createWalletClient({
//         chain: base,
//         transport: http(rpc_url),
//         account,
//     })

//     console.log('executing transaction')
//     const hash = await walletClient.writeContract(estimate.request)

//     console.log(hash)
//     return hash

// }