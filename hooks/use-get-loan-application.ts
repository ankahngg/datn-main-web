"use client";
import { LoanFilter } from "@/model/Loan";
import {
  LoanApplication,
  UserLoanApplicationResponse,
} from "@/model/LoanApplication";
import { LoanOffer, UserLoanOfferResponse } from "@/model/LoanOffer";
import { Page } from "@/service/api";
import {
  getUserLoanApplications,
  getUserLoanApplicationById,
  LoanApplicationParams,
} from "@/service/modules/loan-application";
import {
  getUserLoanOffers,
  getUserLoanOfferById,
  getLoanOffersByApplicationId,
} from "@/service/modules/loan-offer";
import { formatDate } from "@/utils";
import { useQuery } from "@tanstack/react-query";

const USER_LOAN_APPLICATIONS_KEY = "userLoanApplications";
const USER_LOAN_OFFERS_KEY = "userLoanOffers";

export function useUserLoanApplications(options: LoanApplicationParams) {
  const { filter, pageable } = options;
  const enabled = Boolean(filter);

  const query = useQuery<Page<UserLoanApplicationResponse>, Error>({
    queryKey: [USER_LOAN_APPLICATIONS_KEY, filter, pageable],
    queryFn: () => {
      const params = {
        filter: filter ?? {},
        pageable: pageable,
      };
      return getUserLoanApplications(params);
    },
    enabled,
  });

  return query;
}

export function useUserLoanApplications2(options: LoanApplicationParams) {
  const { filter, pageable } = options;
  const enabled = Boolean(filter);

  const query = useQuery<LoanApplication[], Error>({
    queryKey: [USER_LOAN_APPLICATIONS_KEY, filter, pageable],
    queryFn: async () => {
      const params = {
        filter: filter ?? {},
        pageable: pageable,
      };
      const response = await getUserLoanApplications(params);
      return response.content.map((application) => ({
        id: application.id,
        applicationId: application.applicationId,
        borrower: application.borrower,
        collateralType: application.collateralType,
        collateralAmount: application.collateralAmount,
        status: application.status,
        timeCreated: formatDate(application.timeCreated),
        offerCount: application.offerCount ?? 0,
        // NFT fields
        nftId: application.nftId,
        acceptedOfferId: application.acceptedOfferId,
        acceptedLoanId: application.acceptedLoanId,
        timeAccepted: application.timeAccepted,
        assetName: application.collateralType,
      }));
    },
    enabled,
  });

  return query;
}

export function useUserLoanOffers(options: LoanApplicationParams) {
  const { filter, pageable } = options;
  const query = useQuery<Page<UserLoanOfferResponse>, Error>({
    queryKey: [USER_LOAN_OFFERS_KEY, filter, pageable],
    queryFn: () => {
      
      const params = {
        filter,
        pageable: pageable,
      };
      return getUserLoanOffers(params);
    },
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

export function useUserLoanApplicationById2(applicationId: bigint) {
  const enabled = Boolean(applicationId);
  const query = useQuery<LoanApplication, Error>({
    queryKey: ["userLoanApplicationById", applicationId.toString()],
    queryFn: async () => {
      if (!applicationId) {
        throw new Error("Application ID is required");
      }
      const data = await getUserLoanApplicationById(applicationId);
      return {
        id: data.id,
        applicationId: data.applicationId,
        borrower: data.borrower,
        collateralType: data.collateralType,
        collateralAmount: data.collateralAmount,
        status: data.status,
        timeCreated: formatDate(data.timeCreated),
        offerCount: data.offerCount ?? 0,
        // NFT fields
        nftId: data.nftId,
        acceptedOfferId: data.acceptedOfferId,
        acceptedLoanId: data.acceptedLoanId,
        timeAccepted: data.timeAccepted,
        assetName: data.collateralType,
      };
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

export function useUserLoanOfferById2(offerId: bigint) {
  const enabled = Boolean(offerId);
  const query = useQuery<LoanOffer, Error>({
    queryKey: ["userLoanOfferById", offerId.toString()],
    queryFn: async () => {
      if (!offerId) {
        throw new Error("Offer ID is required");
      }
      const data = await getUserLoanOfferById(offerId);
      return {
        id: data.id,
        offerId: data.offerId,
        loanApplicationId: data.applicationId,
        requester: data.requester,
        loanAmount: data.loanAmount,
        interestRate: data.interestRate,
        duration: data.duration,
        status: data.status,
        timeCreated: data.timeCreated,
        timeCancelled: data.timeCancelled,
        timeAccepted: data.timeAccepted,
        createdAt: data.createdAt,
      };
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

export function useLoanOffersByApplicationId2(applicationId: bigint) {
  const enabled = Boolean(applicationId);
  const query = useQuery<LoanOffer[], Error>({
    queryKey: ["loanOffersByApplicationId", applicationId.toString()],
    queryFn: async () => {
      if (!applicationId) {
        throw new Error("Application ID is required");
      }
      const data = await getLoanOffersByApplicationId(applicationId);
      const res: LoanOffer[] = data.content.map((item) => ({
        id: item.id,
        offerId: item.offerId,
        loanApplicationId: item.applicationId,
        requester: item.requester,
        loanAmount: item.loanAmount,
        interestRate: item.interestRate,
        duration: item.duration,
        status: item.status,
        timeCreated: item.timeCreated,
        timeCancelled: item.timeCancelled,
        timeAccepted: item.timeAccepted,
        createdAt: item.createdAt,
      }));
      return res;
    },
    enabled,
  });
  return query;
}
