"use client";

import { useQuery } from "@tanstack/react-query";
import {
  
  BankTransactionHistoryParams,
 
  getBankTransactions,
} from "@/service/modules/bank-transaction";
import { Page } from "@/service/api";
import { BankTransactionFilter, BankTransactionResponse, BankTransaction } from "@/model/BankTransaction";

const BANK_TRANSACTION_HISTORY_KEY = "bankTransactionHistory";


export function useBankTransactions(options: BankTransactionHistoryParams) {
  const { filter, pageable } = options;

  const query = useQuery<Page<BankTransactionResponse>, Error>({
    queryKey: [
      BANK_TRANSACTION_HISTORY_KEY,
      filter,
      pageable,
    ],
    queryFn: () => {
      const params: BankTransactionHistoryParams = {
        filter,
        pageable
      };

      return getBankTransactions(params);
    },
  });

  return query;
}

export function useBankTransactions2(options: BankTransactionHistoryParams) {
  const { filter, pageable } = options;

  const query = useQuery<BankTransaction[], Error>({
    queryKey: [
      BANK_TRANSACTION_HISTORY_KEY,
      filter,
      pageable,
    ],
    queryFn: async () => {
      const params: BankTransactionHistoryParams = {
        filter,
        pageable
      };

      const data = await getBankTransactions(params);
      return data.content.map((tx) => ({
        id: tx.id,
        type: tx.bankAction,
        asset: tx.bankAsset,
        amount: tx.amount,
        time: tx.createdAt,
        status: tx.status,
        txHash: tx.txHash,
        blockNumber: tx.blockNumber,
        logIndex: tx.logIndex,
        eventTimestamp: tx.eventTimestamp,
        createdAt: tx.createdAt,
      }));
    }
        
  });

  return query;
}

