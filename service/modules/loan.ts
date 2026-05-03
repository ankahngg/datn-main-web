import { LoanFilter, mockLoans, UserLoanResponse } from "@/model/Loan";

import { Page, Pageable, request } from "../api";
import { LoanPayTransactionResponse, mockLoanPaymentHistory } from "@/model/LoanPayTransaction";



export interface LoanParams {
  filter: LoanFilter;
  pageable?: Pageable;
}

/**
 * Get loans requiring repayment for a borrower
 */
export async function getLoans({
  filter,
  pageable,
}: LoanParams): Promise<Page<UserLoanResponse>> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock loans with filter:", filter, "and pageable:", pageable);
    return mockLoans;
  }

  const data = await request<Page<UserLoanResponse>>({
    path: "/api/v1//user-loans",
    method: "GET",
    query: {
      ...filter,
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "timeCreated,DESC",
    },
  });

  return data;
}

/**
 * Get loan payment history
 */
export async function getLoanPaymentHistory(
  loanId: bigint,
  pageable?: Pageable,
): Promise<Page<LoanPayTransactionResponse>> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan payment history for loanId:", loanId);
    const content = mockLoanPaymentHistory.content.filter(
      (item) => item.loanId === loanId,
    );
    return {
      content,
      totalElements: content.length,
      totalPages: 1,
      size: pageable?.size ?? 10,
      number: pageable?.page ?? 0,
    };
  }

  const data = await request<Page<LoanPayTransactionResponse>>({
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
