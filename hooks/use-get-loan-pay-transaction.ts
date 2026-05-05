"use client";

import { useQuery } from "@tanstack/react-query";
import {
  
  BankTransactionHistoryParams,
 
  getBankTransactions,
} from "@/service/modules/bank-transaction";

import { LoanPayTransaction, LoanPayTransactionFilter, LoanPayTransactionResponse } from "@/model/LoanPayTransaction";
import { getLoanPaymentHistory, LoanPayTransactionParams } from "@/service/modules/loan-pay-transaction";

const BANK_TRANSACTION_HISTORY_KEY = "bankTransactionHistory";

export function useLoanPayTransactions(options: LoanPayTransactionParams) {
    const { filter, pageable } = options;

  const query = useQuery<LoanPayTransaction[], Error>({
    queryKey: [
      BANK_TRANSACTION_HISTORY_KEY,
    //   filter,
      pageable
     
    ],
    queryFn: async () => {
      const params: BankTransactionHistoryParams = {
        filter,
        pageable
      };

      const val = await getLoanPaymentHistory(params);
      const res: LoanPayTransaction[] = val.content.map((item) => ({
        id: item.id,
        loanId: item.loanId,
        borrower: item.borrower,
        lender: item.lender,
        action: item.action,
        amount: item.amount,
        amountPaid: item.amountPaid,
        totalAmountHaveToPay: item.totalAmountHaveToPay,
        status: item.status,
        blockNumber: item.blockNumber,
        txHash: item.txHash,
        logIndex: item.logIndex,
        timeCreated: item.timeCreated,
        createdAt: item.createdAt,
        remainingAmount: item.totalAmountHaveToPay - item.amountPaid,
      }));

      return res;
    },
  });

  return query;
}
