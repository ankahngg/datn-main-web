import { useQuery } from "@tanstack/react-query";
import {
  getLoansForRepayment,
  type RepaymentFilter,
  type RepaymentResponse,
} from "@/service/modules/repayment";
import type { Page } from "@/service/api";

const USER_REPAYMENT_LOANS_KEY = "userRepaymentLoans";

export interface UseRepaymentLoansOptions {
  filter: RepaymentFilter;
  page?: number;
  size?: number;
  sort?: string;
}

export function useRepaymentLoans(options: UseRepaymentLoansOptions) {
  const { filter, page = 0, size = 10, sort = "timeCreated,DESC" } = options;
  const enabled = Boolean(filter?.borrower);

  const query = useQuery<Page<RepaymentResponse>, Error>({
    queryKey: [
      USER_REPAYMENT_LOANS_KEY,
      filter.borrower,
      filter.loanStatus,
      filter.fromTimeCreated,
      filter.toTimeCreated,
      page,
      size,
      sort,
    ],
    queryFn: () =>
      getLoansForRepayment({
        filter: { ...filter },
        pageable: { page, size, sort },
      }),
    enabled,
  });

  return query;
}
