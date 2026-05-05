import { Page } from "@/service/api";
import { ApplicationStatusResponse } from "./enum";


export interface UserLoanOfferResponse {
  id: number;
  offerId: bigint;
  applicationId: bigint;
  lender: string;
  loanAmount: bigint;
  interestRate: bigint;
  duration: bigint;
  status: ApplicationStatusResponse;
  timeCreated: string;  // LocalDateTime -> ISO string
  timeCancelled?: string;  // LocalDateTime -> ISO string
  timeAccepted?: string;  // LocalDateTime -> ISO string
  createdAt: string;
}

export const mockLoanOffers: Page<UserLoanOfferResponse> = {
  content: [
    {
      id: 1,
      offerId: BigInt("2001"),
      applicationId: BigInt("1002"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("2000000000"), // 2000 USDC with 6 decimals
      interestRate: BigInt("5"), // 5% monthly
      duration: BigInt("12"), // 12 months
      status: "ACCEPTED",
      timeCreated: "2024-03-02T12:00:00Z",
      createdAt: "2024-03-02T12:00:00Z",
    },
    {
      id: 2,
      offerId: BigInt("2002"),
      applicationId: BigInt("1001"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7098",
      loanAmount: BigInt("1000000000"), // 1000 USDC with 6 decimals
      interestRate: BigInt("3"), // 3% monthly
      duration: BigInt("6"), // 6 months
      status: "CREATED",
      timeCreated: "2024-04-02T12:00:00Z",
      timeCancelled: "2024-04-04T14:20:00Z",
      createdAt: "2024-04-02T12:00:00Z",
    },
    {
      id: 3,
      offerId: BigInt("2003"),
      applicationId: BigInt("1004"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("1500000000"), // 1500 USDC with 6 decimals
      interestRate: BigInt("4"), // 4% monthly
      duration: BigInt("9"), // 9 months
      status: "PENDING_CREATED",
      timeCreated: "2024-04-11T12:00:00Z",
      createdAt: "2024-04-11T12:00:00Z",
    },
    {
      id: 4,
      offerId: BigInt("2004"),
      applicationId: BigInt("1006"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("2200000000"), // 2200 USDC with 6 decimals
      interestRate: BigInt("6"), // 6% monthly
      duration: BigInt("10"), // 10 months
      status: "PENDING_CANCELED",
      timeCreated: "2024-04-16T08:15:00Z",
      createdAt: "2024-04-16T08:15:00Z",
    },
    {
      id: 5,
      offerId: BigInt("2005"),
      applicationId: BigInt("1005"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7098",
      loanAmount: BigInt("3000000000"), // 3000 USDC with 6 decimals
      interestRate: BigInt("7"), // 7% monthly
      duration: BigInt("15"), // 15 months
      status: "CREATED",
      timeCreated: "2024-04-20T10:00:00Z",
      createdAt: "2024-04-20T10:00:00Z",
    },
    {
      id: 6,
      offerId: BigInt("2006"),
      applicationId: BigInt("1005"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("2000000000"), // 2000 USDC with 6 decimals
      interestRate: BigInt("7"), // 7% monthly
      duration: BigInt("15"), // 15 months
      status: "CREATED",
      timeCreated: "2024-04-20T10:00:00Z",
      createdAt: "2024-04-20T10:00:00Z",
    },
    {
      id: 7,
      offerId: BigInt("2007"),
      applicationId: BigInt("1001"),
      lender: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      loanAmount: BigInt("2000000000"), // 2000 USDC with 6 decimals
      interestRate: BigInt("7"), // 7% monthly
      duration: BigInt("15"), // 15 months
      status: "CREATED",
      timeCreated: "2024-04-20T10:00:00Z",
      createdAt: "2024-04-20T10:00:00Z",
    }
  ],
  totalElements: 4,
  totalPages: 1,
  size: 10,
  number: 0,
};

export type LoanOffer = {
  id: number;
  offerId: bigint;
  loanApplicationId: bigint;
  requester: string;
  loanAmount: bigint;
  interestRate: bigint;
  duration: bigint;
  status: ApplicationStatusResponse;
  timeCreated: string;
  timeCancelled?: string;
  timeAccepted?: string;
  createdAt: string;
};

export type LoanOfferFilter = {
  requester?: string;
  loanAmount?: bigint;
  interestRate?: bigint;
  duration?: bigint;
  status?: ApplicationStatusResponse;
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
};

export type LoanOfferSubmitValues = {
  loanId: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: string;
};