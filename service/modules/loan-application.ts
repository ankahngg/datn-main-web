import { mockLoanApplications, mockLoanOffers } from "@/view/Borrowing/mock-data";
import { Page, Pageable, request } from "../api";
import { UserNftResponse } from "./asset";

export type LoanApplicationStatusResponse =
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_ACCEPTED"
  | "ACCEPTED"
  | "PENDING_CANCELED"
  | "CANCELED";

  export type LoanOfferStatus =
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_CANCELED"
  | "CANCELED";

export type LoanTransferApplicationStatusResponse =  
  | "PENDING_CREATED"
  | "CREATED"
  | "PENDING_ACCEPTED"
  | "ACCEPTED"
  | "PENDING_CANCELED"
  | "CANCELED";
export type CollateralType = "ETHER" | "NFT";

export enum LoanStatusResponse {
    ACTIVE = "ACTIVE",
    PAID = "PAID",
    AUCTION = "AUCTION",
    LIQUIDATED = "LIQUIDATED",
}

export interface UserLoanApplicationResponse {
  id: number;
  applicationId: bigint;
  borrower: string;
  collateralType: CollateralType;
  collateralAmount: bigint;
  nft?: UserNftResponse;
  status: LoanApplicationStatusResponse;
  timeAccepted?: string;
  timeCancelled?: string;
  timeCreated?: string;
  createdAt: string;
  offerId?: bigint;
  offerCount?: bigint; // Số lượng offer đã được tạo cho đơn vay này
}

export interface UserLoanOfferResponse {
  id: number;
  offerId: bigint;
  applicationId: bigint;
  lender: string;
  loanAmount: bigint;
  interestRate: bigint;
  duration: bigint;
  status: LoanOfferStatus;
  timeCreated?: string;  // LocalDateTime -> ISO string
  timeCancelled?: string;  // LocalDateTime -> ISO string
  createdAt: string;
}

export interface LoanFilter {
  user1?: string; // normalized to lowercase
  user2?: string; // normalized to lowercase

  fromTimeCreated?: string; // LocalDateTime -> ISO string
  toTimeCreated?: string;

  loanStatus?: LoanStatusResponse;
  applicationStatus?: LoanApplicationStatusResponse;
  offerStatus?: LoanOfferStatus;
  transferStatus?: LoanTransferApplicationStatusResponse;
}

export interface LoanHistoryParams {
  filter: LoanFilter;
  pageable?: Pageable;
}

export async function getUserLoanApplications({
  filter,
  pageable, 
}: LoanHistoryParams) {

  if (process.env.NEXT_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan applications with filter:", filter, "and pageable:", pageable);
    return mockLoanApplications;
  }
    const { user1, user2, fromTimeCreated, toTimeCreated, loanStatus, offerStatus, applicationStatus, transferStatus } = filter;

    const data = await request<Page<UserLoanApplicationResponse>>({
        path: "/api/v1/loans/user-loan-applications",
        method: "GET",
        query: {
            user1,
            user2,
            fromTimeCreated,
            toTimeCreated,
            loanStatus,
            applicationStatus,
            offerStatus,
            transferStatus,
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 10,
            sort: pageable?.sort ?? "createdAt,DESC",
        },
    });

    return data;
}

export async function getUserLoanOffers({
  filter,
  pageable, 
}: LoanHistoryParams) {

    if (process.env.NEXT_USE_MOCK_DATA === "true") {
      console.log("Returning mock loan offers with filter:", filter, "and pageable:", pageable);
      return mockLoanOffers;
    }

  const { user1, user2, fromTimeCreated, toTimeCreated, loanStatus, applicationStatus, offerStatus, transferStatus } = filter;

    const data = await request<Page<UserLoanOfferResponse>>({
        path: "/api/v1/loans/user-loan-offers",
        method: "GET",
        query: {
            user1,
            user2,
            fromTimeCreated,
            toTimeCreated,
            loanStatus,
            applicationStatus,
            offerStatus,
            transferStatus,
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 10,
            sort: pageable?.sort ?? "createdAt,DESC",
        },
    });
    
    return data;
}

export async function getUserLoanApplicationById(applicationId: bigint) {
  if (process.env.NEXT_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan application for applicationId:", applicationId);
    const val = mockLoanApplications.content.find(app => app.applicationId === applicationId) ?? null;
    if (!val) throw new Error(`Mock loan application with applicationId ${applicationId} not found`);
    return val;
  }
    const data = await request<UserLoanApplicationResponse>({
        path : `/api/v1/loans/user-loan-applications/${applicationId}`,
        method: "GET",
    });
    return data;
}

export async function getUserLoanOfferById(offerId: bigint) {
  if (process.env.NEXT_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan offer for offerId:", offerId);
    const val = mockLoanOffers.content.find(offer => offer.offerId === offerId) ?? null;
    if (!val) throw new Error(`Mock loan offer with offerId ${offerId} not found`);
    return val;
  }
    const data = await request<UserLoanOfferResponse>({
        path : `/api/v1/loans/user-loan-offers/${offerId}`,
        method: "GET",
    });
    return data;
}

export async function getLoanOffersByApplicationId(applicationId: bigint) : Promise<Page<UserLoanOfferResponse>> {
    if (process.env.NEXT_USE_MOCK_DATA === "true") {
        console.log("Returning mock loan offers for applicationId:", applicationId);
        return {
            content: mockLoanOffers.content.filter(offer => offer.applicationId === applicationId),
            totalElements: mockLoanOffers.content.filter(offer => offer.applicationId === applicationId).length,
            totalPages: 1,
            size: mockLoanOffers.content.filter(offer => offer.applicationId === applicationId).length,
            number: 0,
        };
    }
    const data = await request<Page<UserLoanOfferResponse>>({
        path : `/api/v1/loans/user-loan-applications/${applicationId}/offers`,
        method: "GET",
    });
    return data;
}



    