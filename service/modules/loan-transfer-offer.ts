import { LoanTransferOfferFilter, mockLoanTransferOffersResponse, UserLoanTransferOfferResponse } from "@/model/LoanTransferOffer";
import { Page, Pageable, request } from "../api";
import { useMockData } from "@/config/app.config";

export interface LoanTransferOfferParams {
  filter: LoanTransferOfferFilter;
  pageable?: Pageable;
}

// Get loan transfer offers for a user with optional filtering and pagination
export async function getUserTransferOffer({
  filter,
  pageable, 
}: LoanTransferOfferParams) {
    if (useMockData) {
        console.log("Returning mock loan transfer offer with filter:", filter, "and pageable:", pageable);
        return mockLoanTransferOffersResponse;
    }
    const data = await request<Page<UserLoanTransferOfferResponse>>({
        path: "/api/v1/loan-transfers/offers",
        method: "GET",
        query: {
            ...filter,
            page: pageable?.page ?? 0,
            size: pageable?.size ?? 10,
            sort: pageable?.sort ?? "createdAt,DESC",
        },
    });

    return data;
}

// Get details of a specific loan transfer offer by its ID
export async function getUserLoanTransferOfferById(offerId: bigint) {
  if (useMockData) {
    console.log("Returning mock loan transfer offer for offerId:", offerId);
    const val = mockLoanTransferOffersResponse.content.find(offer => offer.offerId === offerId) ?? null;
    if (!val) throw new Error(`Mock loan transfer offer with offerId ${offerId} not found`);
    return val;
  }
    const data = await request<UserLoanTransferOfferResponse>({
        path : `/api/v1/loan-transfers/offers/${offerId}`,
        method: "GET",
    });
    return data;
}

// Get Offers for a specific loan transfer application by the transfer's ID
export async function getLoanTransferOffersByTransferId(transferId: bigint) : Promise<Page<UserLoanTransferOfferResponse>> {
    if (useMockData) {
        console.log("Returning mock loan transfer offers for transferId:", transferId);
        const filteredContent = mockLoanTransferOffersResponse.content.filter(offer => offer.applicationId === transferId);
        return {
            content: filteredContent,
            totalElements: filteredContent.length,
            totalPages: 1,
            size: filteredContent.length,
            number: 0,
        };
    }

    const data = await request<Page<UserLoanTransferOfferResponse>>({
        path : `/api/v1/loan-transfers/${transferId}/offers`,
        method: "GET",
    });
    return data;
}