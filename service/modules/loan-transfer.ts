
import { Page, Pageable, request } from "../api";
import { LoanFilter } from "@/model/Loan";
import { mockLoanApplications, UserLoanApplicationResponse } from "@/model/LoanApplication";
import { LoanTransferFilter, mockLoanTransfersResponse, UserLoanTransferResponse } from "@/model/LoanTransfer";
import { mockLoanTransferOffersResponse, UserLoanTransferOfferResponse } from "@/model/LoanTransferOffer";

export interface LoanTransferParams {
  filter: LoanTransferFilter;
  pageable?: Pageable;
}

// Get loan transfer applications for a user with optional filtering and pagination
export async function getUserLoanTransfers({
  filter,
  pageable, 
}: LoanTransferParams) {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
        console.log("Returning mock loan transfer applications with filter:", filter, "and pageable:", pageable);
        return mockLoanTransfersResponse;
    }
    const data = await request<Page<UserLoanTransferResponse>>({
        path: "/api/v1/loan-transfers",
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
 
// Get details of a specific loan transfer application by its ID
export async function getUserLoanTransferById(transferId: bigint) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan transfer application for transferId:", transferId);
    const val = mockLoanTransfersResponse.content.find(transfer => transfer.transferId === transferId) ?? null;
    if (!val) throw new Error(`Mock loan transfer application with transferId ${transferId} not found`);
    return val;
  }
    const data = await request<UserLoanTransferResponse>({
        path : `/api/v1/loan-transfers/${transferId}`,
        method: "GET",
    });
    return data;
}


        