# ✅ Auction Services & Hooks Created Successfully

## Summary

Tôi đã tạo các file service và hook tương tự cho Auction và AuctionTransaction.

---

## 📁 Files Created

### 1. Service Layer (2 files)

#### `service/modules/auction.ts` 
Xử lý API calls cho Auction
- `getAuctions()` - Lấy danh sách auction với filter & pagination
- `getAuctionById()` - Lấy chi tiết 1 auction
- `getAuctionsByLoanId()` - Lấy tất cả auction của 1 khoản vay

#### `service/modules/auction-transaction.ts`
Xử lý API calls cho Auction Transaction (lịch sử đấu giá)
- `getAuctionTransactions()` - Lấy danh sách giao dịch đấu giá
- `getAuctionTransactionsByAuctionId()` - Lấy tất cả bid của 1 auction
- `getAuctionTransactionsByBidder()` - Lấy tất cả bid của 1 user

### 2. Hooks Layer (2 files)

#### `hooks/use-auction.ts`
React hooks cho Auction data
- `useAuctions()` - Raw API response `Page<AuctionResponse>`
- `useAuctions2()` - Formatted array `Auction[]`
- `useAuctionById()` - Single auction raw response
- `useAuctionById2()` - Single auction formatted
- `useAuctionsByLoanId()` - Auctions for specific loan

#### `hooks/use-auction-transaction.ts`
React hooks cho Auction Transaction data
- `useAuctionTransactions()` - Raw API response
- `useAuctionTransactions2()` - Formatted array
- `useAuctionTransactionsByAuctionId()` - Bids for specific auction
- `useAuctionTransactionsByBidder()` - Bids by user address

### 3. Documentation

#### `AUCTION_USAGE_GUIDE.md`
Hướng dẫn đầy đủ cách sử dụng:
- Service functions examples
- React hooks usage
- API endpoints
- Complete page example
- Model types

---

## 🏗️ Architecture Pattern

Tất cả file mới tuân theo cùng pattern như các module khác:

```
Model (LoanApplication.ts)
    ↓
Service (service/modules/loan-application.ts)
    ↓
Hook (hooks/use-user-loan.ts)
    ↓
Component (view/Borrowing/LoanApplicationTable.tsx)
```

### Key Features

✅ **Pagination Support** - Tất cả list endpoints hỗ trợ page, size, sort
✅ **Filtering** - Filter objects cho mỗi entity
✅ **Mock Data** - Dùng mock khi `NEXT_PUBLIC_USE_MOCK_DATA=true`
✅ **Two Hook Variants** - "1" (raw) và "2" (formatted) options
✅ **TypeScript** - Fully typed với bigint support
✅ **Error Handling** - Try/catch cho API failures

---

## 🔌 Integration Points

### Backend API Endpoints Expected

```
GET /api/v1/auctions                              # List
GET /api/v1/auctions/{auctionId}                  # Detail
GET /api/v1/auctions/loan/{loanId}                # By Loan

GET /api/v1/auctions/transactions                 # List
GET /api/v1/auctions/{auctionId}/transactions     # By Auction
GET /api/v1/auctions/transactions/bidder/{addr}   # By Bidder
```

---

## 💡 Usage Examples

### Fetch Auctions
```typescript
import { useAuctions } from "@/hooks/use-auction";

export default function AuctionsList() {
  const { data, isLoading } = useAuctions({
    filter: { auctionStatus: "CREATED" },
    page: 0,
    size: 10,
  });

  return (
    <>
      {data?.content.map(auction => (
        <div key={auction.auctionId.toString()}>
          {auction.auctionStatus}
        </div>
      ))}
    </>
  );
}
```

### Fetch User Bids
```typescript
import { useAuctionTransactionsByBidder } from "@/hooks/use-auction-transaction";
import { useAccount } from "wagmi";

export default function MyBids() {
  const { address } = useAccount();
  const { data: bids } = useAuctionTransactionsByBidder(address);

  return (
    <>
      {bids?.content.map(bid => (
        <div key={bid.txHash}>
          Bid: {bid.bidAmount.toString()}
        </div>
      ))}
    </>
  );
}
```

---

## 📋 File Comparison

### Service Module Pattern

| File | Functions | API Endpoint |
|------|-----------|--------------|
| `auction.ts` | 3 functions | `/api/v1/auctions*` |
| `auction-transaction.ts` | 3 functions | `/api/v1/auctions/transactions*` |
| `loan.ts` | 2 functions | `/api/v1/user-loans*` |
| `loan-pay-transaction.ts` | 1 function | `/api/v1/loans/loan-pay-transactions` |

### Hook Pattern

| File | Hooks | Return Types |
|------|-------|--------------|
| `use-auction.ts` | 5 hooks | Raw & Formatted |
| `use-auction-transaction.ts` | 4 hooks | Raw & Formatted |
| `use-get-loans.ts` | 4 hooks | Raw & Formatted |
| `use-bank-transactions.ts` | 1 hook | Page<Response> |

---

## ⚙️ Configuration

### Environment Variables
```bash
# Use mock data (for development/testing)
NEXT_PUBLIC_USE_MOCK_DATA=true

# API URL (production)
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### Mock Data
Mock data defined in models:
- ✅ `model/Auction.ts` - mockAuctionsResponse available
- ⚠️ `model/AuctionTransaction.ts` - Add mock data if needed

---

## 🔍 Type Definitions

### Auction Types
```typescript
type AuctionStatusResponse = 
  | "PENDING_CREATED" | "CREATED" | "PENDING_FINALIZED" | "FINALIZED";

interface AuctionResponse {
  auctionId: bigint;
  loanId: bigint;
  startPrice: bigint;
  timeStart: string;
  timeEnd: string;
  highestBid: bigint;
  highestBidder: string;
  auctionStatus: AuctionStatusResponse;
  // ...
}
```

### Auction Transaction Types
```typescript
type AuctionActionResponse = "BID" | "FINALIZE";

interface AuctionTransactionResponse {
  auctionId: bigint;
  auctionAction: AuctionActionResponse;
  bidder: string;
  bidAmount: bigint;
  txHash: string;
  eventTimestamp: string;
  status: TransactionStatus;
  // ...
}
```

---

## 📚 Related Documentation

- **Architecture**: `architecture.md` - System overview
- **Usage Guide**: `AUCTION_USAGE_GUIDE.md` - Complete examples
- **Models**: `model/Auction.ts`, `model/AuctionTransaction.ts`
- **Existing Services**: `service/modules/loan*.ts` - Reference pattern
- **Existing Hooks**: `hooks/use-*.ts` - Reference pattern

---

## ✨ Next Steps

1. **Mock Data** - Add mock data for AuctionTransaction if needed in tests
2. **Backend API** - Implement endpoints on backend following the routes
3. **Components** - Create UI components using hooks (e.g., AuctionList, BidHistory)
4. **Testing** - Add unit tests for service functions and hooks
5. **Integration** - Connect to contract calls via Wagmi for bidding

---

## 📝 Notes

- Tất cả files follow TypeScript strict mode
- Bigint used for all amounts (Wei/token units)
- Pagination defaults: `page=0, size=10`
- Sorting defaults: `timeCreated,DESC` or `eventTimestamp,DESC`
- Mock data returns on `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Full error handling with try/catch blocks

---

**Status**: ✅ Ready to use
**Pattern**: ✅ Follows existing conventions
**Documentation**: ✅ Complete
**Type Safety**: ✅ Full TypeScript support
