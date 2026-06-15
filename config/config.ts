import { createConfig, http, injected } from 'wagmi'
import { localhost, mainnet, sepolia } from 'wagmi/chains'
import { devMode, sepoliaHttp } from './app.config'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// export const config = devMode ? createConfig({
//   chains: [localhost],
//   connectors: [
//     injected()
//   ],
//   transports: {
//     [localhost.id]: http("http://127.0.0.1:8545"), // your local RPC
//   },
// }) :
// createConfig({
//   // 1. Thêm sepolia vào danh sách chains
//   chains: [sepolia], 
  
//   connectors: [
//     injected(),
//   ],

//   // 2. Cấu hình transport cho từng mạng
//   transports: {
//     [sepolia.id]: http(sepoliaHttp), // Sử dụng public RPC mặc định của Wagmi cho Sepolia
//     // [mainnet.id]: http(),
//     // [localhost.id]: http("http://127.0.0.1:8545"),
//   },
// })

import { defineChain } from "viem";

export const localChain = defineChain({
  id: 31337, // Hardhat/Anvil default
  name: "Localhost",
  network: "localhost",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
});

export const rainbowKitConfig = getDefaultConfig({
  appName: "Lending App",
  projectId: "1a51d0dcc438d1e19cc10d20a781088b", // Thay bằng WalletConnect Project ID của bạn
  chains: devMode ? [localChain] : [sepolia], // Chỉ hỗ trợ Sepolia và Mainnet khi ở production
  wallets: undefined, // Sử dụng danh sách ví mặc định của RainbowKit
  // transports: {
  //   [sepolia.id]: http(sepoliaHttp), // Sử dụng biến môi trường nếu có, nếu không dùng giá trị mặc định
  // },
})

// export const wagmiConfig = getDefaultConfig({
//    appName: "Lending App",
//     projectId: "1a51d0dcc438d1e19cc10d20a781088b",
//     chains: [localChain], // 👈 dùng local
//     transports: {
//       [localChain.id]: http("http://127.0.0.1:8545"),
//     },
//   });