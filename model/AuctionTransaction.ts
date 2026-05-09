import { Page } from "@/service/api";
import { TransactionStatus } from "./enum";

export type AuctionActionResponse = "BID" | "FINALIZE";

export const auctionActionLabelMap: Record<AuctionActionResponse, string> = {
  BID: "Đấu giá",
  FINALIZE: "Kết thúc đấu giá",
};

export type AuctionTransactionResponse = {
  id: number;
  auctionId: bigint;
  auctionAction: AuctionActionResponse;
  bidder: string;
  bidAmount: bigint;
  endTime: string;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  eventTimestamp: string;
  createdAt: string;
   status : TransactionStatus;
};

export type AuctionTransaction = {
    id: number;
  auctionId: bigint;
  auctionAction: AuctionActionResponse;
  bidder: string;
  bidAmount: bigint;
  endTime: string;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  eventTimestamp: string;
  createdAt: string;
   status : TransactionStatus;
};

export type AuctionTransactionFilter = {
    auctionId ?: number;
    auctionAction ?: AuctionActionResponse;
    bidder ?: string;
    bidAmount ?: bigint;
    fromTimeCreated?: string; // local date-time string
    toTimeCreated?: string;   // local date-time string
    status ?: TransactionStatus;
}

export const AUCTION_TRANSACTIONS_ACTION = [
    "VIEW_DETAILS",
]

export type AuctionTransactionAction = typeof AUCTION_TRANSACTIONS_ACTION[number];

export type AuctionTransactionActionLabelMap = {
    VIEW_DETAILS: "Xem chi tiết",
}

export type AuctionBidSubmit = {
    auctionId: bigint;
    bidAmount: bigint;
    bidder: string;
}

export type AuctionFinalizeSubmit = {
    auctionId: bigint;
   
}

export const mockAuctionTransactionsResponse: Page<AuctionTransactionResponse> = {
    content: [
        {   
            id: 1,
            auctionId: BigInt(1001),
            auctionAction: "BID",
            bidder: "0xBidderAddress1",
            bidAmount: BigInt(500000000), // 500 USDC
            endTime: "2024-06-01T12:00:00Z",
            txHash: "0xabc123...def456",
            logIndex: 0,
            blockNumber: 12345678,
            eventTimestamp: "2024-06-01T12:00:00Z",
            createdAt: "2024-06-01T12:00:00Z",
            status: "DONE",
        },
        {
            id: 2,
            auctionId: BigInt(1001),
            auctionAction: "FINALIZE",
            bidder: "0xBidderAddress1",
            bidAmount: BigInt(600000000), // 600 USDC
            endTime: "2024-06-01T12:00:00Z",
            txHash: "0xdef456...abc123",
            logIndex: 1,
            blockNumber: 12345679,
            eventTimestamp: "2024-06-01T12:05:00Z",
            createdAt: "2024-06-01T12:05:00Z",
            status: "DONE",
        },
    ],
    totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
};
