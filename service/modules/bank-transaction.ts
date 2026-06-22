
import { useMockData } from "@/config/app.config";
import { Page, Pageable, request } from "../api";
import { BankTransactionFilter, BankTransactionResponse, mockBankTransactions } from "@/model/BankTransaction";


export interface BankTransactionHistoryParams {
  filter: BankTransactionFilter;
  pageable?: Pageable;
}

// Get bank transactions for a user with optional filtering and pagination
export async function getBankTransactions({
  filter,
  pageable,
}: BankTransactionHistoryParams) {

  if (useMockData) {
    console.log("Returning mock bank transactions with filter:", filter, "and pageable:", pageable);
    return mockBankTransactions;
  }

  const data = await request<Page<BankTransactionResponse>>({
    path: "/api/v1/bank-transaction/history",
    method: "GET",
    query: {
      ...filter,
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "createdAt,DESC",
    },
  });
  return data;
}
