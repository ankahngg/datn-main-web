# 🎯 Quick Reference: Auction Services & Hooks

## 📦 What You Got

### Service Functions (API Clients)
```typescript
// service/modules/auction.ts
import { getAuctions, getAuctionById, getAuctionsByLoanId } from "@/service/modules/auction";

// service/modules/auction-transaction.ts
import { 
  getAuctionTransactions, 
  getAuctionTransactionsByAuctionId,
  getAuctionTransactionsByBidder 
} from "@/service/modules/auction-transaction";
```

### React Hooks
```typescript
// hooks/use-auction.ts
import { useAuctions, useAuctions2, useAuctionById, useAuctionById2, useAuctionsByLoanId } 
  from "@/hooks/use-auction";

// hooks/use-auction-transaction.ts
import { 
  useAuctionTransactions, 
  useAuctionTransactions2,
  useAuctionTransactionsByAuctionId,
  useAuctionTransactionsByBidder 
} from "@/hooks/use-auction-transaction";
```

---

## 🚀 Quick Start

### Display Auctions
```typescript
import { useAuctions } from "@/hooks/use-auction";

const { data, isLoading, error } = useAuctions({
  filter: { auctionStatus: "CREATED" },
  page: 0,
  size: 10,
  sort: "timeCreated,DESC"
});

// data.content = AuctionResponse[]
// data.totalElements, data.totalPages available
```

### Display User Bids
```typescript
import { useAuctionTransactionsByBidder } from "@/hooks/use-auction-transaction";
import { useAccount } from "wagmi";

const { address } = useAccount();
const { data: bids } = useAuctionTransactionsByBidder(address);

// bids.content = AuctionTransactionResponse[]
```

### Display Bids on Auction
```typescript
import { useAuctionTransactionsByAuctionId } from "@/hooks/use-auction-transaction";

const { data: auctionBids } = useAuctionTransactionsByAuctionId(BigInt(3001));

// auctionBids.content = all bids on this auction
```

---

## 📊 Function Reference

### Auction Services

| Function | Params | Returns |
|----------|--------|---------|
| `getAuctions()` | `{ filter, pageable }` | `Page<AuctionResponse>` |
| `getAuctionById()` | `auctionId: bigint` | `AuctionResponse` |
| `getAuctionsByLoanId()` | `loanId: bigint` | `Page<AuctionResponse>` |

### Auction Transaction Services

| Function | Params | Returns |
|----------|--------|---------|
| `getAuctionTransactions()` | `{ filter, pageable }` | `Page<AuctionTransactionResponse>` |
| `getAuctionTransactionsByAuctionId()` | `auctionId, pageable?` | `Page<AuctionTransactionResponse>` |
| `getAuctionTransactionsByBidder()` | `bidder, pageable?` | `Page<AuctionTransactionResponse>` |

### Auction Hooks

| Hook | Input | Returns | Purpose |
|------|-------|---------|---------|
| `useAuctions()` | `options` | `Page<AuctionResponse>` | Raw pagination data |
| `useAuctions2()` | `options` | `Auction[]` | Formatted array |
| `useAuctionById()` | `auctionId?` | `AuctionResponse` | Single auction raw |
| `useAuctionById2()` | `auctionId?` | `Auction` | Single auction formatted |
| `useAuctionsByLoanId()` | `loanId?` | `Page<AuctionResponse>` | Auctions by loan |

### Auction Transaction Hooks

| Hook | Input | Returns | Purpose |
|------|-------|---------|---------|
| `useAuctionTransactions()` | `options` | `Page<AuctionTransactionResponse>` | Raw pagination |
| `useAuctionTransactions2()` | `options` | `AuctionTransaction[]` | Formatted array |
| `useAuctionTransactionsByAuctionId()` | `auctionId?, pageable?` | `Page<AuctionTransactionResponse>` | Auction bids |
| `useAuctionTransactionsByBidder()` | `bidder?, pageable?` | `Page<AuctionTransactionResponse>` | User bids |

---

## 🔌 API Endpoints

```
Auction Service:
  GET /api/v1/auctions
  GET /api/v1/auctions/{id}
  GET /api/v1/auctions/loan/{loanId}

Auction Transaction Service:
  GET /api/v1/auctions/transactions
  GET /api/v1/auctions/{id}/transactions
  GET /api/v1/auctions/transactions/bidder/{address}
```

---

## 💻 Common Patterns

### Load Data on Component Mount
```typescript
const { data: auctions } = useAuctions({
  filter: {},
  page: 0,
  size: 20,
});
```

### Handle Loading & Error
```typescript
const { data, isLoading, error } = useAuctions({ filter: {} });

if (isLoading) return <Spinner />;
if (error) return <ErrorAlert error={error} />;
return <AuctionList auctions={data?.content} />;
```

### Pagination
```typescript
const [page, setPage] = useState(0);
const { data } = useAuctions({ filter: {}, page, size: 10 });

<Pagination 
  current={page}
  total={data?.totalPages}
  onChange={setPage}
/>
```

### Filtering
```typescript
const [status, setStatus] = useState<AuctionStatusResponse>("CREATED");
const { data } = useAuctions({
  filter: { auctionStatus: status },
});
```

---

## 🎨 Filter Objects

### AuctionFilter
```typescript
{
  startPrice?: bigint;           // Minimum start price
  highestBid?: bigint;           // Highest bid so far
  highestBidder?: string;        // Wallet address
  auctionStatus?: "CREATED" | "FINALIZED" | ...;
  fromTimeCreated?: string;      // ISO date
  toTimeCreated?: string;        // ISO date
}
```

### AuctionTransactionFilter
```typescript
{
  auctionId?: bigint;                     // Specific auction
  auctionAction?: "BID" | "FINALIZE";
  bidder?: string;                        // Wallet address
  bidAmount?: bigint;
  fromTimeCreated?: string;               // ISO date
  toTimeCreated?: string;                 // ISO date
  status?: "PROCESSING" | "DONE" | "FAILED";
}
```

---

## 📝 Type Examples

### AuctionResponse
```typescript
{
  auctionId: BigInt(3001),
  loanId: BigInt(2001),
  startPrice: BigInt(500),
  highestBid: BigInt(700),
  highestBidder: "0x1234...",
  auctionStatus: "CREATED",
  timeStart: "2024-06-10T10:00:00Z",
  timeEnd: "2024-06-15T10:00:00Z",
}
```

### AuctionTransactionResponse
```typescript
{
  auctionId: BigInt(3001),
  auctionAction: "BID",
  bidder: "0x5678...",
  bidAmount: BigInt(700),
  txHash: "0xabc...",
  eventTimestamp: "2024-06-12T15:30:00Z",
  status: "DONE",
}
```

---

## ⚙️ Configuration

### Enable Mock Data
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### API Base URL
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## 📄 Files & Locations

```
defi-app/
├── service/modules/
│   ├── auction.ts                  ← Service functions
│   └── auction-transaction.ts      ← Service functions
├── hooks/
│   ├── use-auction.ts              ← React hooks
│   └── use-auction-transaction.ts  ← React hooks
└── model/
    ├── Auction.ts                  ← Types & mock data
    └── AuctionTransaction.ts       ← Types
```

---

## ✅ Feature Checklist

- ✅ List auctions (with pagination & filtering)
- ✅ Get single auction
- ✅ Get auctions by loan
- ✅ List bid history (all, by auction, by bidder)
- ✅ Formatted and raw response variants
- ✅ Mock data support
- ✅ Full TypeScript support
- ✅ React Query integration
- ✅ Error handling
- ⏳ Component UI layer (create in `view/Auction/`)

---

## 🎯 Common Tasks

### Task 1: Show All Active Auctions
```typescript
const { data } = useAuctions({ filter: { auctionStatus: "CREATED" } });
```

### Task 2: Show Auction Details + Bids
```typescript
const { data: auction } = useAuctionById(auctionId);
const { data: bids } = useAuctionTransactionsByAuctionId(auctionId);
```

### Task 3: Show User's Bid History
```typescript
const { address } = useAccount();
const { data: bids } = useAuctionTransactionsByBidder(address);
```

### Task 4: Pagination
```typescript
const [page, setPage] = useState(0);
const { data } = useAuctions({ filter: {}, page });
// data.totalPages available for pagination controls
```

---

## 📚 Documentation

- **AUCTION_USAGE_GUIDE.md** - Complete examples with full components
- **AUCTION_SERVICES_CREATED.md** - Detailed explanation of what was created
- **FINAL_SUMMARY.md** - Overview and next steps

---

## 🚀 Ready to Go!

All files are created and ready to use. Just:
1. Implement backend API endpoints
2. Create UI components in `view/Auction/`
3. Integrate with contract calls (Wagmi)
4. Start building! 🎉
