import { Page } from "@/service/api";
import { TransactionStatus } from "./enum";

export interface LoanPayTransactionResponse {
  id: number;
  loanId: bigint;
  borrower: string;
  lender: string;
  action: PayActionResponse;
  amount: bigint;
  amountPaid: bigint;
  totalAmountHaveToPay: bigint;
  blockNumber: number;
  txHash: string;
  logIndex: number;
  timeCreated: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface LoanPayTransaction {
  id: number;
  loanId: bigint;
  borrower: string;
  lender: string;
  action: PayActionResponse;
  amount: bigint;
  amountPaid: bigint;
  totalAmountHaveToPay: bigint;
  blockNumber: number;
  txHash: string;
  logIndex: number;
  timeCreated: string;
  status: TransactionStatus;
  createdAt: string;
  remainingAmount: bigint; 
}

export interface LoanPayTransactionFilter {
  loanId ?: bigint;
  borrower ?: string; // borrower
  lender ?: string; // lender
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
  action ?: PayActionResponse;
  amount ?: bigint;
  status ?: TransactionStatus;
}

export interface LoanPayTransactionFilter {
  loanId ?: bigint;
  user1 ?: string; // borrower
  user2 ?: string; // lender
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
  payActions?: PayActionResponse[];
}

export type PayActionResponse = "PAY" | "END";

export const mockLoanPayTransactionResponse: Page<LoanPayTransactionResponse> = {
  content: [
    {
      id: 1,
      loanId: BigInt("3001"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x8a12b4c6d8e0f1234567890abcdef1234567890",
      action: "PAY",
      amount: BigInt("100000000"),
      amountPaid: BigInt("100000000"),
      totalAmountHaveToPay: BigInt("540000000"),
      blockNumber: 22334455,
      txHash: "0xmocktx_3001_1",
      logIndex: 1,
      status: "DONE",
      timeCreated: "2026-03-28T11:00:00Z",
      createdAt: "2026-03-28T11:00:00Z",
    },
    {
      id: 2,
      loanId: BigInt("3001"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x8a12b4c6d8e0f1234567890abcdef1234567890",
      action: "PAY",
      amount: BigInt("100000000"),
      amountPaid: BigInt("200000000"),
      totalAmountHaveToPay: BigInt("540000000"),
      blockNumber: 22349901,
      txHash: "0xmocktx_3001_2",
      logIndex: 2,
      status: "DONE",
      timeCreated: "2026-04-05T11:00:00Z",
      createdAt: "2026-04-05T11:00:00Z",
    },
    {
      id: 3,
      loanId: BigInt("3002"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x2f9e4c6b8d0a1234567890abcdef1234567890ab",
      action: "END",
      amount: BigInt("1380000000"),
      amountPaid: BigInt("1380000000"),
      totalAmountHaveToPay: BigInt("1380000000"),
      blockNumber: 22110022,
      txHash: "0xmocktx_3002_1",
      logIndex: 0,
      status: "DONE",
      timeCreated: "2026-03-01T15:20:00Z",
      createdAt: "2026-03-01T15:20:00Z",
    },
    {
      id: 4,
      loanId: BigInt("3005"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x7c1d4e9a0b2f1234567890abcdef1234567890cd",
      action: "PAY",
      amount: BigInt("300000000"),
      amountPaid: BigInt("300000000"),
      totalAmountHaveToPay: BigInt("880000000"),
      blockNumber: 22445566,
      txHash: "0xmocktx_3003_1",
      logIndex: 0,
      status: "PROCESSING",
      timeCreated: "2026-04-10T11:15:00Z",
      createdAt: "2026-04-10T11:15:00Z",
    }
    , {
      id: 5,
      loanId: BigInt("3005"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x7c1d4e9a0b2f1234567890abcdef1234567890cd",
      action: "PAY",
      amount: BigInt("300000000"),
      amountPaid: BigInt("600000000"),
      totalAmountHaveToPay: BigInt("880000000"),
      blockNumber: 22445567,
      txHash: "0xmocktx_3003_2",
      logIndex: 1,
      status: "FAILED",
      timeCreated: "2026-04-15T10:00:00Z",
      createdAt: "2026-04-15T10:00:00Z",
    }
  ],
  totalElements: 3,
  totalPages: 1,
  size: 10,
  number: 0,
};
