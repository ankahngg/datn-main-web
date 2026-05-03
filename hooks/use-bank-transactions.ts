"use client";

import { useQuery } from "@tanstack/react-query";
import {
  
  BankTransactionHistoryParams,
 
  getBankTransactions,
} from "@/service/modules/bank-transaction";
import { Page } from "@/service/api";
import { BankTransactionFilter, BankTransactionResponse } from "@/model/BankTransaction";

const BANK_TRANSACTION_HISTORY_KEY = "bankTransactionHistory";

export interface UseBankTransactionsOptions {
  filter: BankTransactionFilter;
  page?: number;
  size?: number;
  sort?: string; // e.g. "createdAt,DESC"
}

export function useBankTransactions(options: UseBankTransactionsOptions) {
  const { filter, page = 0, size = 10, sort = "createdAt,DESC" } = options;

  const query = useQuery<Page<BankTransactionResponse>, Error>({
    queryKey: [
      BANK_TRANSACTION_HISTORY_KEY,
      filter,
      page,
      size,
      sort,
    ],
    queryFn: () => {
      const params: BankTransactionHistoryParams = {
        filter,
        pageable: { page, size, sort },
      };

      return getBankTransactions(params);
    },
  });

  return query;
}
