"use client";
import { useQuery } from "@tanstack/react-query";
import { getLoanOffersByApplicationId, getUserLoanApplicationById, getUserLoanApplications, getUserLoanOfferById, getUserLoanOffers, LoanFilter, UserLoanApplicationResponse, UserLoanOfferResponse } from "@/service/modules/loan-application";
import { Page } from "@/service/api";

const USER_LOAN_APPLICATIONS_KEY = "userLoanApplications";
const USER_LOAN_OFFERS_KEY = "userLoanOffers";

export interface UseUserLoanHistoryOptions {
  filter: LoanFilter; // Define a proper type for the filter based on your API requirements
  page?: number;
  size?: number;
  sort?: string; // e.g. "createdAt,DESC"
}

export function useUserLoanApplications(options: UseUserLoanHistoryOptions) {
    const { filter, page = 0, size = 10, sort = "createdAt,DESC" } = options;
    const enabled = Boolean(filter?.user1 || filter?.user2);

    const query = useQuery<Page<UserLoanApplicationResponse>, Error>({
        queryKey: [
            USER_LOAN_APPLICATIONS_KEY, 
            filter.user1,
            filter.user2,
            filter.fromTimeCreated,
            filter.toTimeCreated,
            filter.loanStatus,
            filter.applicationStatus,
            filter.offerStatus,
            filter.transferStatus,
            page,
            size,
            sort
        ],
        queryFn: () => {
            if (!filter.user1 && !filter.user2) {
                throw new Error("At least one user address (user1 or user2) is required");
            }
            const params = {
                filter,
                pageable: { page, size, sort },
            };
            return getUserLoanApplications(params);
        }
        ,
        enabled,
    });

    return query;
}

export function useUserLoanOffers(options: UseUserLoanHistoryOptions) {
    const { filter, page = 0, size = 10, sort = "createdAt,DESC" } = options;
    const enabled = Boolean(filter?.user1 || filter?.user2);

    const query = useQuery<Page<UserLoanOfferResponse>, Error>({
        queryKey: [
            USER_LOAN_OFFERS_KEY,
            filter.user1,
            filter.user2,
            filter.fromTimeCreated,
            filter.toTimeCreated,
            filter.loanStatus,
            filter.applicationStatus,
            filter.offerStatus,
            filter.transferStatus,
            page,
            size,
            sort
        ],
        queryFn: () => {
            if (!filter.user1 && !filter.user2) {
                throw new Error("At least one user address (user1 or user2) is required");
            }
            const params = {
                filter,
                pageable: { page, size, sort },
            };
            return getUserLoanOffers(params);
        }
        ,
        enabled,
    });

    return query;
}

export function useUserLoanApplicationById(applicationId: bigint) {
    const enabled = Boolean(applicationId);
    const query = useQuery<UserLoanApplicationResponse, Error>({
        queryKey: ["userLoanApplicationById", applicationId.toString()],
        queryFn: () => {
            if (!applicationId) {
                throw new Error("Application ID is required");
            }
            return getUserLoanApplicationById(applicationId);
        },
        enabled,
    });
    return query;
}

export function useUserLoanOfferById(offerId: bigint) {
    const enabled = Boolean(offerId);
    const query = useQuery<UserLoanOfferResponse, Error>({
        queryKey: ["userLoanOfferById", offerId.toString()],
        queryFn: () => {
            if (!offerId) {
                throw new Error("Offer ID is required");
            }
            return getUserLoanOfferById(offerId);
        },
        enabled,
    });
    return query;
}

export function useLoanOffersByApplicationId(applicationId: bigint) {
    const enabled = Boolean(applicationId);
    const query = useQuery<Page<UserLoanOfferResponse>, Error>({
        queryKey: ["loanOffersByApplicationId", applicationId.toString()],
        queryFn: () => {
            if (!applicationId) {
                throw new Error("Application ID is required");
            }
            return getLoanOffersByApplicationId(applicationId);
        },
        enabled,
    });
    return query;
}




    
