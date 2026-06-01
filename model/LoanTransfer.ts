import { Page } from "@/service/api";
import { ApplicationStatusResponse } from "./enum";

export type UserLoanTransferResponse = {
  id: number;
  transferId: bigint;
  loanId: bigint;
  seller: string;
  buyer?: string;
  price: bigint;
    acceptedOfferId?: bigint;
  status: ApplicationStatusResponse;
  timeCreated: string;
  timeCancelled?: string;
  timeAccepted?: string;
  acceptedPrice?: bigint;
};

export type UserLoanTransfer = {
  id: number;
  transferId: bigint;
    loanId: bigint;
    seller: string; 
    buyer?: string;
    price: bigint;
    acceptedOfferId?: bigint;
    status: ApplicationStatusResponse;
    timeCreated: string;
    timeCancelled?: string;
    timeAccepted?: string;
    acceptedPrice?: bigint;
};

export type LoanTransferFilter = {
  seller ?: string;
  buyer ?: string;
  price ?: bigint;
  status ?: ApplicationStatusResponse;
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
};

export const LOAN_TRANSFER_ACTIONS = [
  "VIEW_DETAILS",
  "CANCEL_TRANSFER",
  "UPDATE_PRICE",
] as const;

export type LoanTransferAction = typeof LOAN_TRANSFER_ACTIONS[number];

export const LoanTransferActionLabelMap: Record<LoanTransferAction, string> = {
  VIEW_DETAILS: "Xem chi tiết",
  CANCEL_TRANSFER: "Hủy chuyển nhượng",
  UPDATE_PRICE: "Cập nhật giá",
};

export type CreateLoanTransferApplicationSubmit = {
  seller: string;
  price: bigint;
  loanId: bigint;
}

export type CreateLoanTransferApplicationSubmit2 = {
  seller: string;
  price: bigint;
  loanId: bigint;
}

export const mockLoanTransfersResponse: Page<UserLoanTransferResponse> = {

  content: [
  {
    id: 1,
    transferId: BigInt(1001),
    loanId: BigInt(2001),
    seller: "0xSellerAddress1",
    buyer: "0xBuyerAddress1",
    price: BigInt(5000000000), // 5000 USDC with 6 decimals
    status: "PENDING_CREATED",
    timeCreated: "2024-06-01T10:00:00Z",
  },
  {
    id: 2,
    transferId: BigInt(1002),
    loanId: BigInt(2002),
    seller: "0xSellerAddress2",
    buyer: "0xBuyerAddress2",
    price: BigInt(1000000000), // 1000 USDC with 6 decimals
    status: "ACCEPTED",
    timeCreated: "2024-06-02T11:00:00Z",
    timeAccepted: "2024-06-03T12:00:00Z",
    acceptedPrice: BigInt(950000000), // Accepted at 950 USDC
  },
  {
    id: 3,
    transferId: BigInt(1003),
    loanId: BigInt(2003),
    seller: "0xSellerAddress3",
    buyer: "0xBuyerAddress3",
    price: BigInt(7500000000), // 7500 USDC with 6 decimals
    status: "CANCELED",
    timeCreated: "2024-06-04T09:00:00Z",
    timeCancelled: "2024-06-05T10:00:00Z",
  },
  {
    id: 4,
    transferId: BigInt(1004),
    loanId: BigInt(2004),
    seller: "0xSellerAddress4",
    price: BigInt(2000000000), // 2000 USDC with 6 decimals
    status: "CREATED",
    timeCreated: "2024-06-05T14:00:00Z",
    
  }
],
  totalElements: 4,
  totalPages: 1,
  size: 10,
  number: 0,

}