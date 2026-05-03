
import { Page, Pageable, request } from "../api";
import { LoanFilter } from "@/model/Loan";
import { mockLoanApplications, UserLoanApplicationResponse } from "@/model/LoanApplication";

export interface LoanApplicationParams {
  filter: LoanFilter;
  pageable?: Pageable;
}

// Get loan applications for a user with optional filtering and pagination
export async function getUserLoanApplications({
  filter,
  pageable, 
}: LoanApplicationParams) {

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock loan applications with filter:", filter, "and pageable:", pageable);
    
    const filteredContent = mockLoanApplications.content.filter(app => {
      if (filter.user1 && app.borrower.toLowerCase() !== filter.user1.toLowerCase()) {
        return false;
      }
      return true;
    });
    console.log("Filtered mock loan applications:", filteredContent);

    return {
      content: filteredContent,
      totalElements: filteredContent.length,
      totalPages: 1,
      size: filteredContent.length,
      number: 0,
    };
  }

    const data = await request<Page<UserLoanApplicationResponse>>({
        path: "/api/v1/loans/user-loan-applications",
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

// Get details of a specific loan application by its ID
export async function getUserLoanApplicationById(applicationId: bigint) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
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





    