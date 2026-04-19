import { Page } from "@/service/api";
import { UserNftResponse } from "@/service/modules/asset";
import { BankTransactionResponse } from "@/service/modules/bank-transaction";

export const mockNfts: Page<UserNftResponse> = {
  content: [
    {
      userAddress: "0x1234...abcd",
      id: 1,
      nftId: BigInt("1001"),
      user: "0x1234...abcd",
      nftAddress: "0xNFT...001",
      tokenId: BigInt("5001"),
      timeCreated: "2024-01-01T12:00:00Z",
      createdAt: "2024-01-01T12:00:00Z",
    },
    {
      userAddress: "0x1234...abcd",
      id: 2,
      nftId: BigInt("1002"),
      user: "0x1234...abcd",
      nftAddress: "0xNFT...002",
      tokenId: BigInt("5002"),
      timeCreated: "2024-02-01T12:00:00Z",
      createdAt: "2024-02-01T12:00:00Z",
      isWithdrawn: true,
      withdrawnAt: "1700000005000",
    },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0,
};

export const mockBankTransactions: Page<BankTransactionResponse> = {
  content: [
    {
      id: 1,
      user: "0x1234...abcd",
      amount: BigInt("1000000000000000000"), // 1 ETH
      bankAsset: "ETH",
      bankAction: "DEPOSIT",
      txHash: "0xabc123...def456",
      blockNumber: "12345678",
      logIndex: 0,
      eventTimestamp: "1700000000000", // example epoch millis
    },
    {
      id: 2,
      user: "0x1234...abcd",
      amount: BigInt("500000000000000000"), // 0.5 ETH
      bankAsset: "ETH",
      bankAction: "WITHDRAW",
      txHash: "0xdef456...abc123",
      blockNumber: "12345679",
      logIndex: 1,
      eventTimestamp: "1700000005000", // example epoch millis
    },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0,
};