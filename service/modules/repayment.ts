import { mockLoanPaymentHistory, mockRepaymentLoans } from "../../view/Repayment/mock-data";
import { Page, Pageable, request } from "../api";

export type RepaymentLoanStatusResponse =
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_PAID"
  | "PAID"
  | "PENDING_AUCTION"
  | "AUCTION"
  | "PENDING_LIQUIDATION"
  | "LIQUIDATED";

export type PayActionResponse =
  | "PAY"
  | "END";

export interface UserRepaymentLoanResponse {
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
  loanStatus: RepaymentLoanStatusResponse;
  timePaid?: string;
  timeAuction?: string;
  timeLiquidated?: string;
  timeCreated: string;
  createdAt: string;
}

export type RepaymentResponse = UserRepaymentLoanResponse;

export interface RepaymentFilter {
  borrower?: string;
  loanStatus?: RepaymentLoanStatusResponse;
  fromTimeCreated?: string;
  toTimeCreated?: string;
}

export interface RepaymentHistoryParams {
  filter: RepaymentFilter;
  pageable?: Pageable;
}

export interface LoanPaymentHistoryResponse {
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
  createdAt: string;
}

/**
 * Get loans requiring repayment for a borrower
 */
export async function getLoansForRepayment(
  {
    filter,
    pageable,
  }: RepaymentHistoryParams,
): Promise<Page<UserRepaymentLoanResponse>> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock repayment loans with filter:", filter, "and pageable:", pageable);
    return mockRepaymentLoans;
  }

  const { borrower, loanStatus, fromTimeCreated, toTimeCreated } = filter;

  const data = await request<Page<UserRepaymentLoanResponse>>({
    path: "/api/v1/loans/repayment",
    method: "GET",
    query: {
      borrower,
      loanStatus,
      fromTimeCreated,
      toTimeCreated,
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "timeCreated,DESC",
    },
  });

  return data;
}


/**
 * End a loan (mark as complete)
 */
export async function endLoan(
  loanId: string
): Promise<{ success: boolean; txHash?: string; message: string }> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return {
      success: true,
      txHash: `0xmock_end_${loanId}`,
      message: "Kết thúc khoản vay thành công (mock)",
    };
  }

  const data = await request<{ success: boolean; txHash?: string; message: string }>({
    path: `/api/v1/loans/${loanId}/end`,
    method: "POST",
  });

  return data;
}

/**
 * Get loan payment history
 */
export async function getLoanPaymentHistory(
  loanId: bigint,
  pageable?: Pageable,
): Promise<Page<LoanPaymentHistoryResponse>> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan payment history for loanId:", loanId);
    const content = mockLoanPaymentHistory.content.filter((item) => item.loanId === loanId);
    return {
      content,
      totalElements: content.length,
      totalPages: 1,
      size: pageable?.size ?? 10,
      number: pageable?.page ?? 0,
    };
  }

  const data = await request<Page<LoanPaymentHistoryResponse>>({
    path: `/api/v1/loans/${loanId}/payment-history`,
    method: "GET",
    query: {
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "timeCreated,DESC",
    },
  });

  return data;
}
