import { Page } from "@/service/api";
import { TransactionStatus, BankAsset, BankAction } from "./enum";


export interface TransactionEventBaseResponse {
  txHash: string;
  blockNumber: bigint; // BigInteger as string
  logIndex: number;
  eventTimestamp: string;
  createdAt: string;
  status : TransactionStatus;
}

export interface BankTransactionResponse extends TransactionEventBaseResponse {
  id: number;
  user: string;
  amount: bigint; // BigInteger as string
  bankAsset: BankAsset;
  bankAction: BankAction;
  nftAddress?: string;
  tokenId?: string// BigInteger as string
}

export interface BankTransactionFilter {
  user?: string;
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
  bankAsset?: BankAsset;
  bankAction?: BankAction;
  status?: TransactionStatus;
  amount ? : bigint;
  nftAddress ? : string;
  tokenId ? : string;
}

export const bankActionLabelMap: Record<BankAction, string> = {
  DEPOSIT: "Gửi",
  WITHDRAW: "Rút",
};

export const transactionStatusVariantMap: Record<TransactionStatus, "warning" | "success" | "danger"> = {
  PROCESSING: "warning",
  DONE: "success",
  FAILED: "danger",
};

export const transactionStatusLabelMap: Record<TransactionStatus, string> = {
  PROCESSING: "Đang xử lý",
  DONE: "Thành công",
  FAILED: "Thất bại",
};

export interface BankTransaction extends TransactionEventBaseResponse {
  id: number;
  type: BankAction;
  asset: BankAsset;
  amount: bigint;
  time: string;
  status: TransactionStatus;
};

export const mockBankTransactions: Page<BankTransactionResponse> = {
  content: [
    {
      id: 1,
      user: "0x1234...abcd",
      amount: BigInt("1000000000000000000"), // 1 ETH
      bankAsset: "ETHER",
      bankAction: "DEPOSIT",
      txHash: "0xabc123...def456",
      blockNumber: BigInt(12345678),
      logIndex: 0,
      eventTimestamp: "2024-02-01T12:00:00Z",
      createdAt: "",
      status: "PROCESSING"
    },
    {
      id: 2,
      user: "0x1234...abcd",
      amount: BigInt("500000000000000000"), // 0.5 ETH
      bankAsset: "ETHER",
      bankAction: "WITHDRAW",
      txHash: "0xdef456...abc123",
      blockNumber: BigInt(12345678),
      logIndex: 1,
      eventTimestamp: "2024-02-02T12:00:00Z",
      createdAt: "",
      status: "DONE"
    },
    {
      id: 3,
      user: "0x1234...abcd",
      amount: BigInt("1000000"), // 1 USDC with 6 decimals
      bankAsset: "USDC",
      bankAction: "DEPOSIT",
      txHash: "0xghi789...jkl012",
      blockNumber: BigInt(12345679),
      logIndex: 0,
      eventTimestamp: "2024-02-03T12:00:00Z",
      createdAt: "",
      status: "FAILED"
    },
   {
      id: 4,
      user: "0x1234...abcd",
      amount: BigInt("1"), // 1 NFT
      bankAsset: "NFT",
      bankAction: "DEPOSIT",
      nftAddress: "0xNFT...001",
      tokenId: "5001",
      txHash: "0xjkl012...ghi789",
      blockNumber: BigInt(12345680),
      logIndex: 0,
      eventTimestamp: "2024-02-04T12:00:00Z",
      createdAt: "",
      status: "DONE"
    }
  ],
  totalElements: 2,
  totalPages: 1,
  size: 10,
  number: 0,
};