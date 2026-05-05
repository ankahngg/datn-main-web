import { Page } from "@/service/api";

export type AuctionStatusResponse = 
    | "PENDING_CREATED"
    | "CREATED"
     | "PENDING_FINALIZED"
      | "FINALIZED"

export type AuctionResponse = {
     id: number;
    auctionId : bigint;
    loanId : bigint;
    startPrice : bigint;
    timeStart : string;
    timeEnd : string;
    timeFinalized ?: string;
    highestBid : bigint;
    highestBidder : string;
    auctionStatus : AuctionStatusResponse;
    timeCreated : string;
    createdAt : string;
}

export type Auction = {
    id: number;
    auctionId : bigint;
    loanId : bigint;
    startPrice : bigint;
    timeStart : string;
    timeEnd : string;
    timeFinalized ?: string;
    highestBid : bigint;
    highestBidder : string;
    auctionStatus : AuctionStatusResponse;
    timeCreated : string;
    createdAt : string;
}

export type AuctionFilter = {
    startPrice ?: bigint;
    highestBid ?: bigint;
    highestBidder ?: string;
    auctionStatus ?: AuctionStatusResponse;
    fromTimeCreated?: string; // local date-time string
    toTimeCreated?: string;   // local date-time string
}

export const AuctionStatusVariantMap: Record<AuctionStatusResponse, "default" | "success" | "warning" | "danger"> = {
    PENDING_CREATED: "warning",
    CREATED: "default",
    PENDING_FINALIZED: "warning",
    FINALIZED: "success",
};

export const AuctionStatusLabelMap: Record<AuctionStatusResponse, string> = {
    PENDING_CREATED: "Đang chờ tạo",
    CREATED: "Đã tạo",
    PENDING_FINALIZED: "Đang chờ kết thúc",
    FINALIZED: "Đã kết thúc",
};

export const mockAuctionsResponse: Page<AuctionResponse> = {
    content: [
        {
            id: 1,
            auctionId: BigInt(3001),
            loanId: BigInt(2001),
            startPrice: BigInt(500),
            timeStart: "2024-06-10T10:00:00Z",
            timeEnd: "2024-06-15T10:00:00Z",
            highestBid: BigInt(700),
            highestBidder: "0xBidderAddress1",
            auctionStatus: "PENDING_CREATED",
            timeCreated: "2024-06-01T10:00:00Z",
            createdAt: "2024-06-01T10:00:00Z",
        },
        {
            id: 2,
            auctionId: BigInt(3002),
            loanId: BigInt(2002),   
            startPrice: BigInt(1000),
            timeStart: "2024-06-11T10:00:00Z",
            timeEnd: "2024-06-16T10:00:00Z",
            highestBid: BigInt(1200),
            highestBidder: "0xBidderAddress2",
            auctionStatus: "CREATED",
            timeCreated: "2024-06-02T11:00:00Z",
            createdAt: "2024-06-02T11:00:00Z",
        },
        {
            id: 3,
            auctionId: BigInt(3003),
            loanId: BigInt(2003),   
            startPrice: BigInt(1500),
            timeStart: "2024-06-12T10:00:00Z",
            timeEnd: "2024-06-17T10:00:00Z",
            highestBid: BigInt(1700),
            highestBidder: "0xBidderAddress3",
            auctionStatus: "PENDING_FINALIZED",
            timeCreated: "2024-06-03T12:00:00Z",
            createdAt: "2024-06-03T12:00:00Z",
        },
        {
            id: 4,
            auctionId: BigInt(3004),
            loanId: BigInt(2004),   
            startPrice: BigInt(2000),
            timeStart: "2024-06-13T10:00:00Z",
            timeEnd: "2024-06-18T10:00:00Z",    
            highestBid: BigInt(2200),
            highestBidder: "0xBidderAddress4",
            auctionStatus: "FINALIZED",
            timeCreated: "2024-06-04T13:00:00Z",
            createdAt: "2024-06-04T13:00:00Z",
            timeFinalized: "2024-06-19T10:00:00Z",
        },
    ],
    totalElements: 4,
    totalPages: 1,
    size: 10,
    number: 0,
}
