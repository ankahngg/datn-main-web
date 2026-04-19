export type LoanApplicationStatus = "Chờ xử lý" | "Đợi chấp nhận" | "Đã chấp nhận" | "Đã hủy";
export type LoanOfferStatus = "Chờ xử lý" | "Thất bại" | "Tạo thành công" | "Đã hủy";
export type LoanOfferType = "Offer của người tạo đơn" | "Offer của người cho vay";

export const loanStatusVariantMap: Record<LoanApplicationStatus, "warning" | "secondary" | "success" | "danger"> = {
  "Chờ xử lý": "warning",
  "Đợi chấp nhận": "secondary",
  "Đã chấp nhận": "success",
    "Đã hủy": "danger",
};

export const loanRequestStatusVariantMap: Record<LoanOfferStatus, "warning" | "default" | "success" | "danger"> = {
  "Chờ xử lý": "warning",
  "Tạo thành công": "success",
  "Thất bại": "danger",
    "Đã hủy": "default",
};

export type LoanApplication = {
  id: number;
  borrower: string;
  collateralAsset: string;
  collateralAmount: string;
  loanAmountUsdc?: string;
  monthlyInterestRate?: string;
  loanTermMonths?: string;
  totalRepayment?: string;
  // NFT Fields
  nftAddress?: string;
  tokenId?: number;
  nftId?: number;
  nftName?: string;
  nftDescription?: string;
  nftCollectionName?: string;
  nftImageUrl?: string;
  status: LoanApplicationStatus;
  createdAt: string;
  offerId?: number; // ID của offer đã chấp nhận, nếu có
  timeStartActive ?: string; // Thời điểm bắt đầu tính lãi, nếu đã có offer được chấp nhận
};

export type LoanOffer = {
  id: number;
  loanApplicationId: number;
  offerType: LoanOfferType;
  requester: string;
  loanAmount: string;
  interestRate: string;
  duration: string;
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
