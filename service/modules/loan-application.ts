
import { useMockData } from "@/config/app.config";
import { Page, Pageable, request } from "../api";
import { LoanFilter } from "@/model/Loan";
import { LoanApplicationFilter, mockLoanApplications, UserLoanApplicationResponse } from "@/model/LoanApplication";

export interface LoanApplicationParams {
  filter: LoanApplicationFilter;
  pageable?: Pageable;
}

// Get loan applications for a user with optional filtering and pagination
export async function getUserLoanApplications({
  filter,
  pageable, 
}: LoanApplicationParams) {

  if (useMockData) {
    console.log("Returning mock loan applications with filter:", filter, "and pageable:", pageable);
    
    const filteredContent = mockLoanApplications.content.filter(app => {
      if (filter.borrower && app.borrower.toLowerCase() !== filter.borrower.toLowerCase()) {
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
        path: "/api/v1/loan-applications",
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
  if (useMockData) {
    console.log("Returning mock loan application for applicationId:", applicationId);
    const val = mockLoanApplications.content.find(app => app.applicationId === applicationId) ?? null;
    if (!val) throw new Error(`Mock loan application with applicationId ${applicationId} not found`);
    return val;
  }
    const data = await request<UserLoanApplicationResponse>({
        path : `/api/v1/loan-applications/${applicationId}`,
        method: "GET",
    });
    return data;
}





    