import { Page } from "@/service/api";
import { UserNftResponse } from "./User";
import { CollateralType, ApplicationStatusResponse } from "./enum";

export interface UserLoanApplicationResponse {
  id: number;
  applicationId: bigint;
  borrower: string;
  collateralType: CollateralType;
  collateralAmount: bigint;
  nftId?: bigint;
  timeAccepted?: string;
  timeCancelled?: string;
  timeCreated: string;
  createdAt: string;
  acceptedOfferId?: bigint;
  offerCount?: number; // Số lượng offer đã được tạo cho đơn vay này
  status: ApplicationStatusResponse;
}

export const mockLoanApplications: Page<UserLoanApplicationResponse> = {
  content: [
    {
      id: 1,
      applicationId: BigInt("1001"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7098",
      collateralType: "ETHER",
      collateralAmount: BigInt("50000000000000000"), // 0.05 ETH
      status: "CREATED",
      timeCreated: "2024-04-01T12:00:00Z",
      createdAt: "2024-04-01T12:00:00Z",
      offerCount: 2,
    },
    {
      id: 2,
      applicationId: BigInt("1002"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      collateralType: "NFT",
      collateralAmount: BigInt("1"), // 1 NFT
      nftId: BigInt("1001"),
      status: "ACCEPTED",
      timeAccepted: "2024-03-05T12:00:00Z",
      timeCreated: "2024-03-01T12:00:00Z",
      createdAt: "2024-03-01T12:00:00Z",
      acceptedOfferId: BigInt("2001"),
      offerCount: 1,
    },
    {
      id: 3,
      applicationId: BigInt("1003"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      collateralType: "ETHER",
      collateralAmount: BigInt("100000000000000000"), // 0.1 ETH
      status: "CANCELED",
      timeCancelled: "2024-02-10T12:00:00Z",
      timeCreated: "2024-02-01T12:00:00Z",
      createdAt: "2024-02-01T12:00:00Z",
      offerCount: 0,
    },
    {
      id: 4,
      applicationId: BigInt("1004"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      collateralType: "NFT",
      collateralAmount: BigInt("1"), // 1 NFT
        nftId: BigInt("1002"),
      status: "PENDING_ACCEPTED",
      timeCreated: "2024-04-10T12:00:00Z",
      createdAt: "2024-04-10T12:00:00Z",
      offerCount: 1,
    },
    {
      id: 5,
      applicationId: BigInt("1005"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      collateralType: "ETHER",
      collateralAmount: BigInt("75000000000000000"), // 0.075 ETH
      status: "CREATED",
      timeCreated: "2024-04-12T09:30:00Z",
      createdAt: "2024-04-12T09:30:00Z",
      offerCount: 1,
    },
    {
      id: 6,
      applicationId: BigInt("1006"),
      borrower: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
      collateralType: "NFT",
      collateralAmount: BigInt("1"),
        nftId: BigInt("1003"),
      status: "PENDING_CANCELED",
      timeCreated: "2024-04-15T11:45:00Z",
      createdAt: "2024-04-15T11:45:00Z",
      offerCount: 1,
    },
  ],
  totalElements: 6,
  totalPages: 1,
  size: 10,
  number: 0,
};


export const applicationStatusVariantMap: Record<ApplicationStatusResponse, "warning" | "secondary" | "success" | "danger"> = {
  PENDING_CREATED: "warning",
  CREATED: "secondary",
  PENDING_ACCEPTED: "warning",
  ACCEPTED: "success",
  PENDING_CANCELED: "warning",
  CANCELED: "danger",
};

export const applicationStatusLabelMap: Record<ApplicationStatusResponse, string> = {
  PENDING_CREATED: "Đang tạo",
  CREATED: "Đã tạo",
  PENDING_CANCELED: "Đang hủy",
  CANCELED: "Đã hủy",
  PENDING_ACCEPTED: "Đang chấp nhận",
  ACCEPTED: "Đã chấp nhận",
};

export type LoanApplication = {
  id: number;
  applicationId: bigint;
  borrower: string;
  collateralType: CollateralType;
  collateralAmount: bigint;
  nftId?: bigint;
  acceptedOfferId?: bigint;
  timeCancelled ?: string;
  timeAccepted  ?: string;
  timeCreated : string;
  offerCount: number; // Số lượng offer đã nhận được
  status: ApplicationStatusResponse;

  // NFT Fields
  nftAddress?: string;
  tokenId?: bigint;
  nftName?: string;
  nftDescription?: string;
  nftCollectionName?: string;
  nftImageUrl?: string;
  assetName?: string;
};

export type LoanApplicationFilter = {
  borrower?: string;
  collateralType?: CollateralType;
  collateralAmount ?: bigint;
  nftId ?: bigint;
  status ?: ApplicationStatusResponse;
  fromTimeCreated?: string; // local date-time string
  toTimeCreated?: string;   // local date-time string
};

export type LoanApplicationSubmitValues = {
  collateralAsset: "ETH" | "NFT";
  collateralAmount: number;
  selectedNftId?: number;
  selectedNftAddress?: string;
  selectedNftTokenId?: string;
  selectedNftName?: string;
  loanAmountUsdc: number;
  monthlyInterestRate: number;
  loanTermMonths: number;
  totalRepayment: number;
};