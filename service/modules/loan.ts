import { LoanFilter, mockLoans, UserLoanResponse } from "@/model/Loan";

import { Page, Pageable, request } from "../api";
import { LoanPayTransactionResponse, mockLoanPayTransactionResponse } from "@/model/LoanPayTransaction";
import { useMockData } from "@/config/app.config";



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
  if (useMockData) {
    console.log("Returning mock loans with filter:", filter, "and pageable:", pageable);
    return mockLoans;
  }

  const data = await request<Page<UserLoanResponse>>({
    path: "/api/v1/loans",
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

export async function getLoanById(loanId: bigint): Promise<UserLoanResponse> {
  if (useMockData) {
    console.log("Returning mock loan for loanId:", loanId);
    const val = mockLoans.content.find(loan => loan.loanId === loanId) ?? null;
    if (!val) throw new Error(`Mock loan with loanId ${loanId} not found`);
    return val;
  }
  const data = await request<UserLoanResponse>({
      path : `/api/v1/loans/${loanId}`,
      method: "GET",
  });
  return data;
}


