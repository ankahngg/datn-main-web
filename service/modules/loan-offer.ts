import { mockLoanOffers, UserLoanOfferResponse } from "@/model/LoanOffer";
import { Page, Pageable, request } from "../api";
import { LoanFilter } from "@/model/Loan";

export interface LoanOfferParams {
  filter: LoanFilter;
  pageable?: Pageable;
}

// Get loan offers for a user with optional filtering and pagination
export async function getUserLoanOffers({
  filter,
  pageable, 
}: LoanOfferParams) {

    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
      console.log("Returning mock loan offers with filter:", filter, "and pageable:", pageable);
      return mockLoanOffers;
    }

    const data = await request<Page<UserLoanOfferResponse>>({
        path: "/api/v1/loans/user-loan-offers",
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

// Get details of a specific loan offer by its ID
export async function getUserLoanOfferById(offerId: bigint) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
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

// Get loan offers for a specific loan application by the application's ID
export async function getLoanOffersByApplicationId(applicationId: bigint) : Promise<Page<UserLoanOfferResponse>> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
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