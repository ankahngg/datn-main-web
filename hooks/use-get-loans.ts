"use client";

import { useQuery } from "@tanstack/react-query";
import type { Page } from "@/service/api";
import { LoanFilter, UserLoan, UserLoanResponse } from "@/model/Loan";
import { getLoanById, getLoans } from "@/service/modules/loan";

export interface UseGetLoansOptions {
  filter: LoanFilter;
  page?: number;
  size?: number;
  sort?: string;
}

export function useGetLoans(options: UseGetLoansOptions) {
  const { filter, page = 0, size = 1000, sort = "timeCreated,DESC" } = options;
 
  return useQuery<Page<UserLoanResponse>, Error>({
    queryKey: ["useGetLoan", filter, page, size, sort],
    queryFn: async () => {
      const data = await getLoans({
        filter: { ...filter },
        pageable: { page, size, sort },
      });

      return data;
    }
  });
}

export function useGetLoans2(options: UseGetLoansOptions) {
  const { filter, page = 0, size = 1000, sort = "timeCreated,DESC" } = options;
 
  return useQuery<UserLoan[], Error>({
    queryKey: ["useGetLoan", page, size, sort],
    queryFn: async () => {
      const data = await getLoans({
        filter: { ...filter },
        pageable: { page, size, sort },
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
          loanStatus: item.loanStatus,
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
    queryKey: ["useGetLoanById", loanId],
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
    queryKey: ["useGetLoanById", loanId],
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
        loanStatus: data.loanStatus,
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

      