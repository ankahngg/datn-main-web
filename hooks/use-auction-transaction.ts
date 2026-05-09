"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AuctionTransactionFilter,
  AuctionTransactionResponse,
  AuctionTransaction,
} from "@/model/AuctionTransaction";
import { Page, Pageable } from "@/service/api";
import {
  getAuctionTransactions,
  getAuctionTransactionsByAuctionId,

} from "@/service/modules/auction-transaction";

const AUCTION_TRANSACTION_KEY = "auctionTransaction";
const AUCTION_TRANSACTIONS_KEY = "auctionTransactions";

export interface AuctionTransactionParams {
  filter: AuctionTransactionFilter;
  pageable?: Pageable;
}


/**
 * Get auction transactions with filtering and pagination - returns raw API response
 */
export function useAuctionTransactions(options: AuctionTransactionParams) {
  const { filter, pageable } = options;


  const query = useQuery<Page<AuctionTransactionResponse>, Error>({
    queryKey: [
      AUCTION_TRANSACTIONS_KEY,
      filter,
      pageable,
    ],
    queryFn: () => {
      return getAuctionTransactions({
        filter,
        pageable: { ...pageable },
      });
    },
  });

  return query;
}

/**
 * Get auction transactions with filtering and pagination - returns formatted AuctionTransaction[] array
 */
export function useAuctionTransactions2(options: AuctionTransactionParams) {
  const { filter, pageable } = options;

  const query = useQuery<AuctionTransaction[], Error>({
    queryKey: [
      AUCTION_TRANSACTIONS_KEY,
      filter,
      pageable,
    ],
    queryFn: async () => {
      const data = await getAuctionTransactions({
        filter,
        pageable: { ...pageable },
      });

      const res: AuctionTransaction[] = data.content.map((item) => ({
        id: item.id,
        auctionId: item.auctionId,
        auctionAction: item.auctionAction,
        bidder: item.bidder,
        bidAmount: item.bidAmount,
        endTime: item.endTime,
        txHash: item.txHash,
        logIndex: item.logIndex,
        blockNumber: item.blockNumber,
        eventTimestamp: item.eventTimestamp,
        createdAt: item.createdAt,
        status: item.status,
      }));

      return res;
    },
  });

  return query;
}

/**
 * Get auction transactions by auction ID
 */
export function useAuctionTransactionsByAuctionId(
  auctionId: bigint | undefined,
) {
  const enabled = Boolean(auctionId);

  return useQuery<AuctionTransactionResponse, Error>({
    queryKey: [
      AUCTION_TRANSACTIONS_KEY,
      "byAuctionId",
      auctionId?.toString(),
      
    ],
    queryFn: async () => {
      if (!auctionId) {
        throw new Error("Auction ID is required");
      }
      const data = await getAuctionTransactionsByAuctionId(auctionId);
      return data;
    },
    enabled,
  });
}



