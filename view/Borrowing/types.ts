import type {
  LoanApplicationStatusResponse,
  LoanOfferStatus as LoanOfferStatusResponse,
} from "@/service/modules/loan-application";

export type LoanApplicationStatus = LoanApplicationStatusResponse;
export type LoanOfferStatus = LoanOfferStatusResponse;
export type LoanOfferType = "Offer của người tạo đơn" | "Offer của người cho vay";

export const loanStatusVariantMap: Record<LoanApplicationStatus, "warning" | "secondary" | "success" | "danger"> = {
  PENDING_CREATED: "warning",
  CREATED: "secondary",
  PENDING_ACCEPTED: "warning",
  ACCEPTED: "success",
  PENDING_CANCELED: "warning",
  CANCELED: "danger",
};

export const loanRequestStatusVariantMap: Record<LoanOfferStatus, "warning" | "secondary" | "danger"> = {
  PENDING_CREATED: "warning",
  CREATED: "secondary",
  PENDING_CANCELED: "warning",
  CANCELED: "danger",
};

export const loanApplicationStatusLabelMap: Record<LoanApplicationStatus, string> = {
  PENDING_CREATED: "Đang tạo đơn",
  CREATED: "Đã tạo đơn",
  PENDING_ACCEPTED: "Đang chấp nhận",
  ACCEPTED: "Đã chấp nhận",
  PENDING_CANCELED: "Đang hủy",
  CANCELED: "Đã hủy",
};

export const loanOfferStatusLabelMap: Record<LoanOfferStatus, string> = {
  PENDING_CREATED: "Đang tạo offer",
  CREATED: "Đã tạo offer",
  PENDING_CANCELED: "Đang hủy offer",
  CANCELED: "Đã hủy offer",
};

export type LoanApplication = {
  id: number;
  applicationId: bigint;
  borrower: string;
  collateralAsset: string;
  collateralAmount: string;
  loanAmountUsdc?: string;
  monthlyInterestRate?: string;
  loanTermMonths?: string;
  totalRepayment?: string;
  // NFT Fields
  nftAddress?: string;
  tokenId?: bigint;
  nftId?: bigint;
  nftName?: string;
  nftDescription?: string;
  nftCollectionName?: string;
  nftImageUrl?: string;
  status: LoanApplicationStatus;
  createdAt: string;
  offerId?: bigint; // ID của offer đã chấp nhận, nếu có
  timeAccepted?: string; // Thời điểm bắt đầu tính lãi, nếu đã có offer được chấp nhận
  offerCount: bigint; // Số lượng offer đã nhận được
};

export type LoanOffer = {
  id: number;
  offerId: bigint;
  loanApplicationId: bigint;
  requester: string;
  loanAmount: string;
  interestRate: bigint;
  duration: bigint;
  status: LoanOfferStatus;
  createdAt: string;
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

export type LoanOfferSubmitValues = {
  loanId: number;
  offerType: LoanOfferType;
  loanAmount: number;
  interestRate: number;
  loanTerm: string;
};

export type TransactionResult = {
  status: "success" | "error";
  message: string;
}