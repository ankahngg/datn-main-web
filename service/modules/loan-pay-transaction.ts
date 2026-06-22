import {
  LoanPayTransactionFilter,
  LoanPayTransactionResponse,
  mockLoanPayTransactionResponse,
} from "@/model/LoanPayTransaction";
import { Page, Pageable, request } from "../api";
import { useMockData } from "@/config/app.config";

/**
 * Get loan payment history
 */
export interface LoanPayTransactionParams {
  filter: LoanPayTransactionFilter;
  pageable?: Pageable;
}

export async function getLoanPaymentHistory({
  filter,
  pageable,
}: LoanPayTransactionParams): Promise<Page<LoanPayTransactionResponse>> {
  if (useMockData) {
    console.log(
      "Returning mock loan payment history with filter:",
      filter,
      "and pageable:",
      pageable,
    );
    return mockLoanPayTransactionResponse;
  }

  const data = await request<Page<LoanPayTransactionResponse>>({
    path: `/api/v1/loans/loan-pay-transactions`,
    method: "GET",
    query: {
      ...filter,
      payActions: filter.payActions?.join(","),
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "timeCreated,DESC",
    },
  });

  return data;
}
