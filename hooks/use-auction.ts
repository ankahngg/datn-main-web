"use client";

import { useQuery } from "@tanstack/react-query";
import type { Page } from "@/service/api";
import { AuctionFilter, AuctionResponse, Auction } from "@/model/Auction";
import {
  getAuctions,
  getAuctionById,
  AuctionParams,
} from "@/service/modules/auction";

const AUCTION_KEY = "auction";
const AUCTIONS_KEY = "auctions";

/**
 * Get auctions with filtering and pagination - returns raw API response
 */
export function useAuctions(options: AuctionParams) {
  const { filter, pageable } = options;

  return useQuery<Page<AuctionResponse>, Error>({
    queryKey: [AUCTIONS_KEY, filter, pageable],
    queryFn: async () => {
      const data = await getAuctions({
        filter: { ...filter },
        pageable: { ...pageable },
      });
      return data;
    },
  });
}

/**
 * Get auctions with filtering and pagination - returns formatted Auction[] array
 */
export function useAuctions2(options: AuctionParams) {
  const { filter, pageable } = options;

  return useQuery<Auction[], Error>({
    queryKey: [AUCTIONS_KEY, filter, pageable],
    queryFn: async () => {
      const data = await getAuctions({
        filter: { ...filter },
        pageable: { ...pageable },
      });

      const res: Auction[] = data.content.map((item) => ({
        id: item.id,
        auctionId: item.auctionId,
        loanId: item.loanId,
        startPrice: item.startPrice,
        timeStart: item.timeStart,
        timeEnd: item.timeEnd,
        timeFinalized: item.timeFinalized,
        highestBid: item.highestBid,
        highestBidder: item.highestBidder,
        status: item.status,
        timeCreated: item.timeCreated,
        createdAt: item.createdAt,
      }));

      return res;
    },
  });
}

/**
 * Get a single auction by ID - returns raw API response
 */
export function useAuctionById(auctionId: bigint | undefined) {
  const enabled = Boolean(auctionId);

  return useQuery<AuctionResponse, Error>({
    queryKey: [AUCTION_KEY, auctionId?.toString()],
    queryFn: async () => {
      if (!auctionId) {
        throw new Error("Auction ID is required");
      }
      const data = await getAuctionById(auctionId);
      return data;
    },
    enabled,
  });
}

/**
 * Get a single auction by ID - returns formatted Auction object
 */
export function useAuctionById2(auctionId: bigint | undefined) {
  const enabled = Boolean(auctionId);

  return useQuery<Auction, Error>({
    queryKey: [AUCTION_KEY, auctionId?.toString()],
    queryFn: async () => {
      if (!auctionId) {
        throw new Error("Auction ID is required");
      }
      const data = await getAuctionById(auctionId);
      const res: Auction = {
        id: data.id,
        auctionId: data.auctionId,
        loanId: data.loanId,
        startPrice: data.startPrice,
        timeStart: data.timeStart,
        timeEnd: data.timeEnd,
        timeFinalized: data.timeFinalized,
        highestBid: data.highestBid,
        highestBidder: data.highestBidder,
        status: data.status,
        timeCreated: data.timeCreated,
        createdAt: data.createdAt,
      };
      return res;
    },
    enabled,
  });
}
