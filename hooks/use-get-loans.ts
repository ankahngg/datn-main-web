"use client";

import { useQuery } from "@tanstack/react-query";
import type { Page } from "@/service/api";
import { LoanFilter, UserLoanResponse } from "@/model/Loan";
import { getLoans } from "@/service/modules/loan";

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