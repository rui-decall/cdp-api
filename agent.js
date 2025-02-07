import 'dotenv/config'
import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
// Coinbase.configure({ apiKeyName: process.env.CB_API_KEY_NAME, privateKey: process.env.CB_PRIVATE_KEY, useServerSigner: true })

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
//f8b2c6a9-39aa-442e-974b-c0f7cbfed044
export async function initializeAgent(wallet_id) {
  try {
    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
    })

    const wallet = await Wallet.fetch(wallet_id)
    // console.log(wallet)
    // Configure CDP Wallet Provider
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyName: process.env.CB_API_KEY_NAME,
      apiKeyPrivateKey: process.env.CB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      wallet: wallet,
      networkId: Coinbase.networks.BaseMainnet
      // cdpWalletData: JSON.stringify(wallet.model.default_address) || undefined,
      // networkId: process.env.NETWORK_ID
    });

    // Initialize AgentKit
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        // wethActionProvider(),
        // pythActionProvider(),
        walletActionProvider(),
        erc20ActionProvider(),
        // cdpApiActionProvider({
        //   apiKeyName: process.env.CDP_API_KEY_NAME,
        //   apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        // }),
        // cdpWalletActionProvider({
        //   apiKeyName: process.env.CDP_API_KEY_NAME,
        //   apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        // }),
      ],
    });

    const tools = await getLangChainTools(agentkit);

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };

    // Create React Agent using the LLM and CDP AgentKit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
          You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
          faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
          funds from the user. Before executing your first action, get the wallet details to see what network 
          you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
          asks you to do something you can't do with your currently available tools, you must say so, and 
          encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
          docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
          restating your tools' descriptions unless it is explicitly requested.
          `,
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error; // Re-throw to be handled by caller
  }
}

// async function main() {
//   const { agent, config } = await initializeAgent();
//   const userInput = "What is the balance of my wallet?"
//   const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

//   for await (const chunk of stream) {
//     if ("agent" in chunk) {
//       console.log(chunk.agent.messages[0].content);
//     } else if ("tools" in chunk) {
//       console.log(chunk.tools.messages[0].content);
//     }
//     console.log("-------------------");
//   }

// }

// main();
