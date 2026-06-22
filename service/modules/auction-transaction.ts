import {
  AuctionTransactionFilter,
  AuctionTransactionResponse,
  mockAuctionTransactionsResponse,
} from "@/model/AuctionTransaction";
import { Page, Pageable, request } from "../api";
import { useMockData } from "@/config/app.config";

export interface AuctionTransactionParams {
  filter: AuctionTransactionFilter;
  pageable?: Pageable;
}

/**
 * Get auction transaction history with optional filtering and pagination
 */
export async function getAuctionTransactions({
  filter,
  pageable,
}: AuctionTransactionParams): Promise<Page<AuctionTransactionResponse>> {
  if (useMockData) {
    console.log(
      "Returning mock auction transactions with filter:",
      filter,
      "and pageable:",
      pageable,
    );
    return mockAuctionTransactionsResponse;
  }

  const data = await request<Page<AuctionTransactionResponse>>({
    path: `/api/v1/auctions/transactions`,
    method: "GET",
    query: {
      ...filter,
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "eventTimestamp,DESC",
    },
  });

  return data;
}

/**
 * Get auction transaction history by auction ID
 */
export async function getAuctionTransactionsByAuctionId(auctionId: bigint): Promise<AuctionTransactionResponse> {
  if (useMockData) {
    console.log("Returning mock auction transactions for auctionId:", auctionId);
    const val = mockAuctionTransactionsResponse.content.find(
      (tx) => tx.auctionId === auctionId,
    ) ?? null;
    if (!val) throw new Error(`Mock auction transaction with auctionId ${auctionId} not found`);
    return val;

  }

  const data = await request<AuctionTransactionResponse>({
    path: `/api/v1/auctions/${auctionId}/transactions`,
    method: "GET",
  });

  return data;
}

