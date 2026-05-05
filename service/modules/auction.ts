import { AuctionFilter, AuctionResponse, mockAuctionsResponse } from "@/model/Auction";
import { Page, Pageable, request } from "../api";

export interface AuctionParams {
  filter: AuctionFilter;
  pageable?: Pageable;
}

/**
 * Get auctions with optional filtering and pagination
 */
export async function getAuctions({
  filter,
  pageable,
}: AuctionParams): Promise<Page<AuctionResponse>> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock auctions with filter:", filter, "and pageable:", pageable);
    return mockAuctionsResponse;
  }

  const data = await request<Page<AuctionResponse>>({
    path: "/api/v1/auctions",
    method: "GET",
    query: {
      ...filter,
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "timeCreated,DESC",
    },
  });

  return data;
}

/**
 * Get a specific auction by ID
 */
export async function getAuctionById(auctionId: bigint): Promise<AuctionResponse> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock auction for auctionId:", auctionId);
    const val = mockAuctionsResponse.content.find(auction => auction.auctionId === auctionId) ?? null;
    if (!val) throw new Error(`Mock auction with auctionId ${auctionId} not found`);
    return val;
  }

  const data = await request<AuctionResponse>({
    path: `/api/v1/auctions/${auctionId}`,
    method: "GET",
  });

  return data;
}

