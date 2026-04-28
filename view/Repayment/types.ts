export type LoanStatus =
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_PAID"
  | "PAID"
  | "PENDING_AUCTION"
  | "AUCTION"
  | "PENDING_LIQUIDATION"
  | "LIQUIDATED";

export type LoanForRepayment = {
  id: number;
  loanId: bigint;
  applicationId: bigint;
  offerId: bigint;
  borrower: string;
  lender: string;
  loanAmount: string;
  interestRate: string;
  duration: string;
  totalAmountHaveToPay: string;
  amountPaid: string;
  loanStatus: LoanStatus;
  timePaid?: string;
  timeAuction?: string;
  timeLiquidated?: string;
  timeCreated: string;
  createdAt: string;
};

export const loanStatusVariantMap: Record<LoanStatus, "warning" | "secondary" | "success" | "danger"> = {
  PENDING_CREATED: "warning",
  CREATED: "secondary",
  PENDING_PAID: "warning",
  PAID: "success",
  PENDING_AUCTION: "warning",
  AUCTION: "danger",
  PENDING_LIQUIDATION: "danger",
  LIQUIDATED: "danger",
};

export const loanStatusLabelMap: Record<LoanStatus, string> = {
  PENDING_CREATED: "Đang tạo",
  CREATED: "Đã tạo",
  PENDING_PAID: "Đang thanh toán",
  PAID: "Đã thanh toán",
  PENDING_AUCTION: "Đang đấu giá",
  AUCTION: "Đang bán đấu giá",
  PENDING_LIQUIDATION: "Đang thanh lý",
  LIQUIDATED: "Đã thanh lý",
};

export type RepaymentActionType = "VIEW_DETAILS" | "VIEW_HISTORY" | "REPAY" | "END_LOAN";

export type PayAction = "PAY" | "END";

export const payActionLabelMap: Record<PayAction, string> = {
  PAY: "Thanh toán",
  END: "Kết thúc",
};

export const payActionVariantMap: Record<PayAction, "success" | "secondary"> = {
  PAY: "success",
  END: "secondary",
};
  

