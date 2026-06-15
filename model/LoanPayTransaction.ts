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
  blockNumber: bigint;
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
  blockNumber: bigint;
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
      totalAmountHaveToPay: BigInt("880000000"),
      blockNumber: BigInt(22334455),
      txHash: "0xfdb389a014553d6db11faf5fff3f4184793578bfb2af04eb10ba5bc7950ec805",
      logIndex: 1,
      status: "DONE",
      timeCreated: "2026-06-03T11:00:00Z",
      createdAt: "2026-06-03T11:00:00Z",
    },
    {
      id: 2,
      loanId: BigInt("3001"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x8a12b4c6d8e0f1234567890abcdef1234567890",
      action: "PAY",
      amount: BigInt("200000000"),
      amountPaid: BigInt("300000000"),
      totalAmountHaveToPay: BigInt("880000000"),
      blockNumber: BigInt(22334456),
      txHash: "0xfdb389a014553d6db11faf5fff3f4184793578bfb2af04eb10ba5bc7950ec858",
      logIndex: 2,
      status: "DONE",
      timeCreated: "2026-07-03T11:00:00Z",
      createdAt: "2026-07-03T11:00:00Z",
    },
    {
      id: 3,
      loanId: BigInt("3001"),
      borrower: "0x1a12b4c6d8e0f1234567890abcdef1234567890",
      lender: "0x8a12b4c6d8e0f1234567890abcdef1234567890",
      action: "PAY",
      amount: BigInt("100000000"),
      amountPaid: BigInt("400000000"),
      totalAmountHaveToPay: BigInt("880000000"),
      blockNumber: BigInt(22334457),
      txHash: "0xfdb389a014553d6db11faf5fff3f4184793578bfb2af04eb10ba5bc7950ec888",
      logIndex: 3,
      status: "PROCESSING",
      timeCreated: "2026-08-03T11:00:00Z",
      createdAt: "2026-08-03T11:00:00Z",
    },
  ],
  totalElements: 3,
  totalPages: 1,
  size: 10,
  number: 0,
};
