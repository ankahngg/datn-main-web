import { Page } from "@/service/api";
import { ApplicationStatusResponse, LoanStatusResponse, PayActionResponse } from "./enum";


export interface LoanFilter {
  borrower  ?: string;
  lender ?: string;
  loanAmount ?: bigint;
  interestRate ?: bigint;
  duration ?: bigint;
  loanStatus ?: LoanStatusResponse;
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
}

export interface UserLoanResponse {
  id: number;
  loanId: bigint;
  applicationId: bigint;
  offerId: bigint;
  borrower: string;
  lender: string;
  loanAmount: bigint;
  interestRate: bigint;
  duration: bigint;
  totalAmountHaveToPay: bigint;
  amountPaid: bigint;
  loanStatus: LoanStatusResponse;
  timePaid?: string;
  timeAuction?: string;
  timeLiquidated?: string;
  timeCreated: string;
  createdAt: string;
}

export interface UserLoan {
    id: number;
  loanId: bigint;
  applicationId: bigint;
  offerId: bigint;
  borrower: string;
  lender: string;
  loanAmount: bigint;
  interestRate: bigint;
  duration: bigint;
  totalAmountHaveToPay: bigint;
  amountPaid: bigint;
  loanStatus: LoanStatusResponse;
  timePaid?: string;
  timeAuction?: string;
  timeLiquidated?: string;
  timeCreated: string;
  createdAt: string;
  remainingAmount: bigint; // totalAmountHaveToPay - amountPaid
}

export const UserLoanStatusVariantMap: Record<LoanStatusResponse, "default" | "success" | "warning" | "danger"> = {
  PENDING_CREATED: "warning",
    CREATED: "default",
    PENDING_PAID: "warning",
    PAID: "success",
    PENDING_AUCTION: "warning",
    AUCTION: "danger",
    PENDING_LIQUIDATION: "warning",
    LIQUIDATED: "danger",
};

export const UserLoanStatusLabelMap: Record<LoanStatusResponse, string> = {
  PENDING_CREATED: "Đang tạo",
    CREATED: "Đã tạo",
    PENDING_PAID: "Đang thanh toán",
    PAID: "Đã thanh toán",
    PENDING_AUCTION: "Đang đấu giá",
    AUCTION: "Đang bị đấu giá",
    PENDING_LIQUIDATION: "Đang thanh lý",
    LIQUIDATED: "Đã bị thanh lý",
};

export const payActionLabelMap: Record<PayActionResponse, string> = {
  PAY: "Trả vay",
  END: "Hoàn tất vay",
};

export const payActionVariantMap: Record<PayActionResponse, "success" | "secondary"> = {
  PAY: "secondary",
  END: "success",
};

export const mockLoans: Page<UserLoanResponse> = {
  content: [
    {
      id: 1,
      loanId: BigInt("3001"),
      applicationId: BigInt("1001"),
      offerId: BigInt("2001"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      lender: "0x8a12b4c6d8e0f1234567890abcdef1234567890",
      loanAmount: BigInt("500000000"), // 500 USDC (6 decimals)
      interestRate: BigInt("8"), // 8%
      duration: BigInt("6"),
      totalAmountHaveToPay: BigInt("540000000"),
      amountPaid: BigInt("200000000"),
      loanStatus: "PENDING_PAID",
      timePaid: "2026-04-05T11:00:00Z",
      timeCreated: "2026-03-20T10:30:00Z",
      createdAt: "2026-03-20T10:30:00Z",
    },
    {
      id: 2,
      loanId: BigInt("3002"),
      applicationId: BigInt("1002"),
      offerId: BigInt("2002"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      lender: "0x2f9e4c6b8d0a1234567890abcdef1234567890ab",
      loanAmount: BigInt("1200000000"), // 1200 USDC (6 decimals)
      interestRate: BigInt("15"), // 15%
      duration: BigInt("12"),
      totalAmountHaveToPay: BigInt("1380000000"),
      amountPaid: BigInt("1380000000"),
      loanStatus: "PAID",
      timePaid: "2026-03-01T15:20:00Z",
      timeCreated: "2026-02-12T08:00:00Z",
      createdAt: "2026-02-12T08:00:00Z",
    },
    {
      id: 3,
      loanId: BigInt("3003"),
      applicationId: BigInt("1003"),
      offerId: BigInt("2003"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      lender: "0x7c1d4e9a0b2f1234567890abcdef1234567890cd",
      loanAmount: BigInt("800000000"), // 800 USDC (6 decimals)
      interestRate: BigInt("10"), // 10%
      duration: BigInt("9"),
      totalAmountHaveToPay: BigInt("880000000"),
      amountPaid: BigInt("300000000"),
      loanStatus: "CREATED",
      timePaid: "2026-04-10T11:15:00Z",
      timeCreated: "2026-04-01T14:10:00Z",
      createdAt: "2026-04-01T14:10:00Z",
    },
    {
      id: 4,
      loanId: BigInt("3004"),
      applicationId: BigInt("1004"),
      offerId: BigInt("2004"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      lender: "0x6b2e4f8a1c3d1234567890abcdef1234567890ef",
      loanAmount: BigInt("950000000"), // 950 USDC (6 decimals)
      interestRate: BigInt("12"), // 12%
      duration: BigInt("8"),
      totalAmountHaveToPay: BigInt("1064000000"),
      amountPaid: BigInt("0"),
      loanStatus: "PENDING_CREATED",
      timeCreated: "2026-04-18T09:45:00Z",
      createdAt: "2026-04-18T09:45:00Z",
    },
    {
      id: 5,
      loanId: BigInt("3005"),
      applicationId: BigInt("1005"),
      offerId: BigInt("2005"),
      borrower: "0x1a12b4c6d8e0f12da345890abcdef12345421312",
      lender : "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("600000000"), // 600 USDC (6 decimals)
      interestRate: BigInt("9"), // 9%
      duration: BigInt("5"),
      totalAmountHaveToPay: BigInt("654000000"),
      amountPaid: BigInt("600000000"),
      loanStatus: "PENDING_AUCTION",
      timeAuction: "2026-04-20T10:00:00Z",
      timeCreated: "2026-04-10T12:00:00Z",
      createdAt: "2026-04-10T12:00:00Z",
    },
    {
      id: 6,
      loanId: BigInt("3006"),
      applicationId: BigInt("1006"),
      offerId: BigInt("2006"),
      borrower: "0x1a12bdadda321312312341aa312343312310",
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("700000000"), // 700 USDC (6 decimals)
      interestRate: BigInt("11"), // 11%
      duration: BigInt("7"),
      totalAmountHaveToPay: BigInt("777000000"),
      amountPaid: BigInt("0"),
      loanStatus: "AUCTION",
      timeAuction: "2026-04-22T14:30:00Z",
      timeCreated: "2026-04-12T16:20:00Z",
      createdAt: "2026-04-12T16:20:00Z",
    }
  ],
  totalElements: 4,
  totalPages: 1,
  size: 10,
  number: 0,
};