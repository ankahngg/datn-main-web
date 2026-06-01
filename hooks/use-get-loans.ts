"use client";

import { useQuery } from "@tanstack/react-query";
import type { Page } from "@/service/api";
import { LoanFilter, UserLoan, UserLoanResponse } from "@/model/Loan";
import { getLoanById, getLoans, LoanParams } from "@/service/modules/loan";



export function useGetLoans(options: LoanParams) {
  const { filter, pageable } = options;
 
  return useQuery<Page<UserLoanResponse>, Error>({
    queryKey: ["useGetLoan", filter, pageable],
    queryFn: async () => {
      const data = await getLoans({
        filter: { ...filter },
        pageable: { ...pageable },
      });

      return data;
    }
  });
}

export function useGetLoans2(options: LoanParams) {
  const { filter, pageable } = options;
 
  return useQuery<UserLoan[], Error>({
    queryKey: ["useGetLoan", filter, pageable],
    queryFn: async () => {
      const data = await getLoans({
        filter: { ...filter },
        pageable: { ...pageable },
      });

        const res: UserLoan[] = data.content.map((item) => ({
          id: item.id,
          loanId: item.loanId,
          applicationId: item.applicationId,
          offerId: item.offerId,
          borrower: item.borrower,
          lender: item.lender,
          loanAmount: item.loanAmount,
          interestRate: item.interestRate,
          duration: item.duration,
          totalAmountHaveToPay: item.totalAmountHaveToPay,
          amountPaid: item.amountPaid,
          status: item.status,
          timePaid: item.timePaid,
          timeAuction: item.timeAuction,
          timeLiquidated: item.timeLiquidated,
          timeCreated: item.timeCreated,
          createdAt: item.createdAt,
          remainingAmount: item.totalAmountHaveToPay - item.amountPaid,
        }));

      return res;
    }
  });
}

export function useGetLoanById(loanId: bigint | undefined) {
  return useQuery<UserLoanResponse, Error>({
    queryKey: ["useGetLoanById", loanId?.toString()],
    queryFn: async () => {
      if (!loanId) {
        throw new Error("Loan ID is required");
      }
      const data = await getLoanById(loanId);
      return data;
    },
    enabled: Boolean(loanId),
  });
}

export function useGetLoanById2(loanId: bigint | undefined) {
  return useQuery<UserLoan, Error>({
    queryKey: ["useGetLoanById", loanId?.toString()],
    queryFn: async () => {
      if (!loanId) {
        throw new Error("Loan ID is required");
      }
      const data = await getLoanById(loanId);
      const res: UserLoan = {
        id: data.id,
        loanId: data.loanId,
        applicationId: data.applicationId,
        offerId: data.offerId,
        borrower: data.borrower,
        lender: data.lender,
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        duration: data.duration,
        totalAmountHaveToPay: data.totalAmountHaveToPay,
        amountPaid: data.amountPaid,
        status: data.status,
        timePaid: data.timePaid,
        timeAuction: data.timeAuction,
        timeLiquidated: data.timeLiquidated,
        timeCreated: data.timeCreated,
        createdAt: data.createdAt,
        remainingAmount: data.totalAmountHaveToPay - data.amountPaid,
      };
      return res;
    }
  });
}

      