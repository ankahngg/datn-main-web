"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BankTransactionFilter,
  BankTransactionHistoryParams,
  BankTransactionResponse,
  getBankTransactions,
} from "@/service/modules/bank-transaction";
import { Page } from "@/service/api";

const BANK_TRANSACTION_HISTORY_KEY = "bankTransactionHistory";

export interface UseBankTransactionsOptions {
  filter: BankTransactionFilter;
  page?: number;
  size?: number;
  sort?: string; // e.g. "createdAt,DESC"
}

export function useBankTransactions(options: UseBankTransactionsOptions) {
  const { filter, page = 0, size = 10, sort = "createdAt,DESC" } = options;

  const enabled = Boolean(filter?.user);

  const query = useQuery<Page<BankTransactionResponse>, Error>({
    queryKey: [
      BANK_TRANSACTION_HISTORY_KEY,
      filter.user,
      filter.fromTime,
      filter.toTime,
      filter.assetTypes,
      filter.actions,
      page,
      size,
      sort,
    ],
    queryFn: () => {
      if (!filter.user) {
        throw new Error("User address is required");
      }

      const params: BankTransactionHistoryParams = {
        filter,
        pageable: { page, size, sort },
      };

      return getBankTransactions(params);
    },
    enabled,
  });

  return query;
}
