# Auction Service & Hook Usage Guide

## Files Created

### Service Layer
1. **`service/modules/auction.ts`** - Auction API client
2. **`service/modules/auction-transaction.ts`** - Auction transaction API client

### Hooks Layer
3. **`hooks/use-auction.ts`** - Auction React hooks
4. **`hooks/use-auction-transaction.ts`** - Auction transaction React hooks

---

## Service Functions

### Auction Service (`service/modules/auction.ts`)

#### `getAuctions(params: AuctionParams)`
Fetch auctions with filtering and pagination
```typescript
const data = await getAuctions({
  filter: { auctionStatus: "CREATED" },
  pageable: { page: 0, size: 10, sort: "timeCreated,DESC" }
});
// Returns: Page<AuctionResponse>
```

#### `getAuctionById(auctionId: bigint)`
Fetch a single auction by ID
```typescript
const auction = await getAuctionById(BigInt(3001));
// Returns: AuctionResponse
```

#### `getAuctionsByLoanId(loanId: bigint)`
Fetch all auctions for a specific loan
```typescript
const auctions = await getAuctionsByLoanId(BigInt(2001));
// Returns: Page<AuctionResponse>
```

---

### Auction Transaction Service (`service/modules/auction-transaction.ts`)

#### `getAuctionTransactions(params: AuctionTransactionParams)`
Fetch auction transactions (bids and finalizations)
```typescript
const data = await getAuctionTransactions({
  filter: { auctionAction: "BID" },
  pageable: { page: 0, size: 10, sort: "eventTimestamp,DESC" }
});
// Returns: Page<AuctionTransactionResponse>
```

#### `getAuctionTransactionsByAuctionId(auctionId: bigint, pageable?)`
Fetch all transactions for a specific auction
```typescript
const transactions = await getAuctionTransactionsByAuctionId(
  BigInt(3001),
  { page: 0, size: 10 }
);
// Returns: Page<AuctionTransactionResponse>
```

#### `getAuctionTransactionsByBidder(bidder: string, pageable?)`
Fetch all auction transactions for a specific bidder
```typescript
const userBids = await getAuctionTransactionsByBidder(
  "0xBidderAddress1",
  { page: 0, size: 10 }
);
// Returns: Page<AuctionTransactionResponse>
```

---

## React Hooks

### Auction Hooks (`hooks/use-auction.ts`)

#### `useAuctions(options)` - Raw API Response
```typescript
"use client";
import { useAuctions } from "@/hooks/use-auction";

export default function AuctionList() {
  const { data, isLoading, error } = useAuctions({
    filter: { auctionStatus: "CREATED" },
    page: 0,
    size: 10,
    sort: "timeCreated,DESC"
  });

  return (
    <>
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {data?.content.map((auction) => (
        <div key={auction.auctionId.toString()}>
          {auction.auctionStatus} - {auction.highestBid}
        </div>
      ))}
    </>
  );
}
```

#### `useAuctions2(options)` - Formatted Array
```typescript
const { data: auctions } = useAuctions2({
  filter: { auctionStatus: "CREATED" },
  page: 0,
  size: 10,
});
// data is Auction[] array, easier for mapping
```

#### `useAuctionById(auctionId)`
```typescript
const { data: auction } = useAuctionById(BigInt(3001));
// Returns: AuctionResponse or undefined
```

#### `useAuctionById2(auctionId)`
```typescript
const { data: auction } = useAuctionById2(BigInt(3001));
// Returns: Auction or undefined (formatted)
```

#### `useAuctionsByLoanId(loanId)`
```typescript
const { data: auctions } = useAuctionsByLoanId(BigInt(2001));
// Returns: Page<AuctionResponse> of auctions for this loan
```

---

### Auction Transaction Hooks (`hooks/use-auction-transaction.ts`)

#### `useAuctionTransactions(options)` - Raw API Response
```typescript
"use client";
import { useAuctionTransactions } from "@/hooks/use-auction-transaction";

export default function BidHistory() {
  const { data } = useAuctionTransactions({
    filter: { auctionAction: "BID" },
    page: 0,
    size: 10,
    sort: "eventTimestamp,DESC"
  });

  return (
    <>
      {data?.content.map((tx) => (
        <div key={tx.txHash}>
          {tx.bidder} bid {tx.bidAmount}
        </div>
      ))}
    </>
  );
}
```

#### `useAuctionTransactions2(options)` - Formatted Array
```typescript
const { data: bids } = useAuctionTransactions2({
  filter: { auctionAction: "BID" },
  page: 0,
  size: 10,
});
// data is AuctionTransaction[] array
```

#### `useAuctionTransactionsByAuctionId(auctionId, pageable?)`
```typescript
const { data: auctionBids } = useAuctionTransactionsByAuctionId(
  BigInt(3001),
  { page: 0, size: 10 }
);
// Returns: Page<AuctionTransactionResponse> for this auction
```

#### `useAuctionTransactionsByBidder(bidder, pageable?)`
```typescript
const { data: userBidHistory } = useAuctionTransactionsByBidder(
  "0xUserAddress",
  { page: 0, size: 20 }
);
// Returns: Page<AuctionTransactionResponse> of user's bids
```

---

## Model Types

### Auction Types
```typescript
type AuctionStatusResponse = 
  | "PENDING_CREATED"   // Awaiting creation
  | "CREATED"           // Active auction
  | "PENDING_FINALIZED" // Awaiting finalization
  | "FINALIZED";        // Auction ended

interface AuctionResponse {
  id: number;
  auctionId: bigint;
  loanId: bigint;
  startPrice: bigint;
  timeStart: string;
  timeEnd: string;
  timeFinalized?: string;
  highestBid: bigint;
  highestBidder: string;
  auctionStatus: AuctionStatusResponse;
  timeCreated: string;
  createdAt: string;
}

type AuctionFilter = {
  startPrice?: bigint;
  highestBid?: bigint;
  highestBidder?: string;
  auctionStatus?: AuctionStatusResponse;
  fromTimeCreated?: string;
  toTimeCreated?: string;
};
```

### Auction Transaction Types
```typescript
type AuctionActionResponse = "BID" | "FINALIZE";

interface AuctionTransactionResponse {
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
  status: TransactionStatus;
}

type AuctionTransactionFilter = {
  auctionId?: bigint;
  auctionAction?: AuctionActionResponse;
  bidder?: string;
  bidAmount?: bigint;
  fromTimeCreated?: string;
  toTimeCreated?: string;
  status?: TransactionStatus;
};
```

---

## API Endpoints

### Backend Auction Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auctions` | GET | List auctions |
| `/api/v1/auctions/{auctionId}` | GET | Get single auction |
| `/api/v1/auctions/loan/{loanId}` | GET | Get auctions by loan |

### Backend Auction Transaction Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auctions/transactions` | GET | List auction transactions |
| `/api/v1/auctions/{auctionId}/transactions` | GET | Get transactions for auction |
| `/api/v1/auctions/transactions/bidder/{bidder}` | GET | Get transactions by bidder |

---

## Complete Example: Auction Page

```typescript
"use client";

import { useState } from "react";
import { useAuctions, useAuctionTransactionsByAuctionId } from "@/hooks/use-auction";
import { useAuctionTransactionsByBidder } from "@/hooks/use-auction-transaction";
import { useAccount } from "wagmi";

export default function AuctionPage() {
  const { address } = useAccount();
  const [selectedAuctionId, setSelectedAuctionId] = useState<bigint | null>(null);

  // Fetch all active auctions
  const { data: auctions, isLoading } = useAuctions({
    filter: { auctionStatus: "CREATED" },
    page: 0,
    size: 10,
  });

  // Fetch bids on selected auction
  const { data: auctionBids } = useAuctionTransactionsByAuctionId(
    selectedAuctionId || undefined
  );

  // Fetch user's bid history
  const { data: userBids } = useAuctionTransactionsByBidder(address);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Active Auctions</h1>
      
      {isLoading && <p>Loading auctions...</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auctions List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Auctions</h2>
          {auctions?.content.map((auction) => (
            <div
              key={auction.auctionId.toString()}
              className="border p-4 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => setSelectedAuctionId(auction.auctionId)}
            >
              <p>Auction #{auction.auctionId.toString()}</p>
              <p className="text-sm">Status: {auction.auctionStatus}</p>
              <p className="text-sm">Highest Bid: {auction.highestBid.toString()}</p>
            </div>
          ))}
        </div>

        {/* Auction Details */}
        {selectedAuctionId && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Bid History</h2>
            {auctionBids?.content.map((bid) => (
              <div key={bid.txHash} className="border p-4 rounded mb-2">
                <p className="text-sm">Bidder: {bid.bidder}</p>
                <p className="text-sm">Amount: {bid.bidAmount.toString()}</p>
                <p className="text-xs text-gray-500">{bid.eventTimestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User's Bid History */}
      {address && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">My Bids</h2>
          {userBids?.content.map((bid) => (
            <div key={bid.txHash} className="border p-4 rounded mb-2">
              <p className="text-sm">Auction #{bid.auctionId.toString()}</p>
              <p className="text-sm">Amount: {bid.bidAmount.toString()}</p>
              <p className="text-xs text-gray-500">{bid.eventTimestamp}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Mock Data

The services support mock data via environment variable:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Mock auctions are defined in `model/Auction.ts` with the `mockAuctionsResponse` export.

For auction transactions, the mock implementation returns empty arrays (no mock data defined yet - add to model if needed).

---

## Notes

- ✅ All services follow the same pattern as existing loan/payment services
- ✅ Hooks have "1" (raw) and "2" (formatted) variants for flexibility
- ✅ Pagination is supported on all list endpoints
- ✅ Filtering by status, address, action type is supported
- ⚠️ Mock data for `AuctionTransactionResponse` is empty - add mock data in `model/AuctionTransaction.ts` if needed
- ⚠️ Bigint amounts are used throughout (Wei/token units) - format them for display
