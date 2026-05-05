# DeFi Lending Platform - Architecture Documentation

## 1. Project Overview

### System Purpose
This is a **decentralized finance (DeFi) lending platform** built on Ethereum that enables peer-to-peer loan creation, borrowing, and lending with NFT or ETH collateral. The system facilitates:

- **Borrowers** create loan applications with ETH or NFT collateral
- **Lenders** submit offers on applications with custom terms (amount, interest rate, duration)
- **Smart contracts** manage loan lifecycle: creation, payment, auction, and liquidation
- **NFT collateralization** for borrowers wanting to pledge digital assets
- **USDC stablecoin** as the loan currency for stable value

### Core Domain
The system operates across three main domains:

1. **Loan Applications** - Borrower requests with collateral
2. **Loan Offers** - Lender proposals with terms
3. **Active Loans** - Accepted offers with payment schedules and collateral management

### Main Actors
- **Borrower** - Creates loan applications, deposits collateral, accepts offers, repays loans
- **Lender** - Submits offers on applications, receives repayment with interest
- **Smart Contract** - Holds collateral, executes offers, manages liquidation auctions
- **Oracle/Price Feed** - Provides real-time collateral valuation (integrated via constructor)

---

## 2. Tech Stack

### Frontend Framework
- **Next.js 16.2.3** - React framework with file-based routing, server-side rendering
- **React 19.2.4** - UI component library
- **TypeScript 5.x** - Type-safe development

### Web3 Integration
- **Wagmi 2.19.5** - Ethereum client library for contract interactions and wallet connections
- **Viem 2.47.12** - Low-level Ethereum library for contract ABI encoding/decoding
- **RainbowKit 2.2.10** - Wallet connection UI with multi-wallet support (MetaMask, Injected connectors)

### State Management & Data Fetching
- **TanStack React Query 5.99.0** - Server state management with automatic caching, refetching, pagination
- **React Hook Form 7.72.1** - Form state management with minimal re-renders
- **Zod 4.3.6** - Schema validation for form inputs

### UI Components
- **Radix UI 1.4.3** - Unstyled, accessible component primitives
- **Shadcn/ui components** - Pre-built Radix-based components
- **Lucide React 1.8.0** - Icon library
- **TailwindCSS 4** - Utility-first CSS framework

### Build & Dev Tools
- **Tailwind PostCSS** - CSS processing
- **ESLint 9** - Code linting
- **Class Variance Authority 0.7.1** - Component variant management

---

## 3. Project Structure

```
defi-app/
├── app/                          # Next.js App Router pages
│   ├── borrowing/               # Borrower loan applications
│   ├── lending/                 # Lender marketplace and offers
│   ├── auction/                 # Liquidation auction display
│   ├── payment/                 # Loan repayment interface
│   ├── transfer/                # Loan transfer functionality
│   ├── assets/                  # User NFT and balance management
│   ├── dashboard/               # Overview dashboard
│   ├── activity/                # Transaction history
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
│
├── components/                   # Reusable React components
│   ├── ui/                      # Base UI components
│   ├── shared/                  # Shared business components
│   └── wallet-required.tsx      # Wallet connection guard
│
├── hooks/                        # React hooks for data fetching
│   ├── use-user-loan.ts         # Loan application and offer queries
│   ├── use-user-asset.ts        # User balance and NFT queries
│   └── ...
│
├── service/                      # API client layer
│   ├── api.ts                   # HTTP request abstraction
│   └── modules/                 # API endpoint handlers
│
├── model/                        # TypeScript types and enums
│   ├── enum.ts                  # Status enums
│   ├── LoanApplication.ts       # Loan types
│   └── ...
│
├── view/                         # Feature-specific components
│   ├── Borrowing/
│   ├── Lending/
│   ├── Repayment/
│   └── ...
│
├── provider/                     # React providers
│   └── Providers.tsx             # Wagmi, RainbowKit, React Query
│
├── config/                       # Configuration
│   ├── config.ts                # Wagmi/RainbowKit setup
│   └── app.config.ts            # Contract addresses, RPC
│
├── abi.json                      # Smart contract ABI
└── utils.ts                      # Helper functions
```

---

## 4. Architecture Overview

### System Design

```
React Next.js Frontend
    ↓
    ├─→ React Query (Server State)
    ├─→ Wagmi/Viem (Web3 Client)
    └─→ HTTP Client (Backend API)
        ↓
        ├─→ Backend API (REST/JSON)
        ├─→ Smart Contract (Ethereum)
        └─→ ERC-20 Token Management
```

### Data Flow

1. **Frontend** → React component triggers data fetch
2. **React Query** → Checks cache, calls service function
3. **Service Layer** → Makes HTTP request or contract call
4. **Backend/Blockchain** → Returns data
5. **React Query** → Caches result, triggers re-render
6. **UI** → Displays formatted data

---

## 5. Core Flows

### Loan Creation Flow

1. User clicks "Create Loan Application"
2. Form opens with fields:
   - Collateral type (ETH or NFT)
   - Collateral amount
   - Desired loan amount (USDC)
   - Interest rate (monthly %)
   - Loan term (months)
3. Form validation via Zod
4. User signs transaction via Wagmi
5. Smart contract creates application, locks collateral
6. Backend listens to event, saves to database
7. React Query auto-refetch updates UI

**Key Components:**
- `app/borrowing/page.tsx` - Page
- `view/Borrowing/LoanApplicationDialog.tsx` - Form
- `hooks/use-user-loan.ts` - Data fetching
- `abi.json` - Contract ABI

---

### Loan Offers Flow

1. Application appears in lending marketplace
2. Lender submits offer with:
   - Loan amount
   - Interest rate
   - Duration
3. Smart contract creates offer record
4. Borrower sees offers in application details
5. Borrower accepts offer
6. Smart contract creates loan, transfers collateral
7. Active loan appears in repayment page

**Key Hook:**
```typescript
useLoanOffersByApplicationId(applicationId)
// Returns paginated list of offers on application
```

---

### Loan Repayment Flow

1. User sees active loans in Repayment page
2. Display shows:
   - Loan amount
   - Interest owed
   - Total repayment
   - Amount already paid
   - Remaining amount
3. User submits payment
4. Smart contract transfers USDC, updates loan status
5. If fully paid, collateral released
6. UI shows payment history

---

## 6. Critical Hooks

### useUserLoanApplicationById
- **Purpose:** Fetch single application
- **Data:** `/api/v1/loans/user-loan-applications/{id}`
- **Returns:** `UserLoanApplicationResponse`

### useLoanOffersByApplicationId
- **Purpose:** Fetch offers on application
- **Data:** `/api/v1/loans/user-loan-applications/{id}/offers`
- **Returns:** `Page<UserLoanOfferResponse>`
- **⚠️ Issue:** No pagination params - always fetches first page only

### useUserNFTById
- **Purpose:** Fetch single NFT
- **Data:** `/api/v1/user-assets/nfts/{id}`
- **Returns:** `UserNftResponse`

### useUserBalance
- **Purpose:** Fetch user balance (ETH + USDC)
- **Data:** `/api/v1/user-assets/balance/{address}`
- **Returns:** `UserBalanceResponse`

---

## 7. Web3 Integration

### Smart Contract Interaction Points

1. **Create Application** → `createApplication()`
2. **Submit Offer** → `submitOffer()`
3. **Accept Offer** → `acceptOffer()` (creates loan)
4. **Repay Loan** → `payLoan()`
5. **Liquidation** → `placeBid()` on auction

### BigInt Handling

All blockchain amounts use `bigint`:
```typescript
collateralAmount: bigint  // Wei (18 decimals for ETH)
loanAmount: bigint        // USDC (6 decimals)
```

Display formatting:
```typescript
formatEther(amount)  // Wei → Display
formatUsdc(amount)   // USDC → Display
```

### Status Enums

**ApplicationStatusResponse:**
- PENDING_CREATED, CREATED, PENDING_ACCEPTED, ACCEPTED, PENDING_CANCELED, CANCELED

**LoanStatusResponse:**
- PENDING_CREATED, CREATED, PENDING_PAID, PAID, PENDING_AUCTION, AUCTION, PENDING_LIQUIDATION, LIQUIDATED

**UserNFTResponseStatus:**
- DEPOSITED, WITHDRAWN, PENDING_DEPOSIT, PENDING_WITHDRAW, COLLATERALIZED

---

## 8. Issues Found

### 🔴 Critical

1. **Duplicate Hooks** - `useUserLoanApplications()` and `useUserLoanApplications2()` do similar work
2. **No Pagination** - `useLoanOffersByApplicationId()` always fetches first page only
3. **Mock Data Toggle** - Environment variable not production-ready
4. **BigInt Serialization** - Manual `.toString()` in query keys error-prone
5. **Type Mismatch** - Offers use `ApplicationStatusResponse` instead of `OfferStatusResponse`
6. **Missing Wallet Guard** - Components don't check if wallet connected

### 🟡 Medium

7. **Stale Data** - No auto-refetch on blockchain state changes
8. **No Error Boundaries** - React Query errors not caught
9. **Inconsistent Error Handling** - Generic ApiError for all errors

### 🔵 Minor

10. **NFT Metadata Missing** - No image or description storage
11. **No Loading Skeletons** - Basic spinners instead of skeleton UI
12. **Form Loading States** - No submit button disabled state

---

## 9. Key Recommendations

### High Priority
1. **Consolidate duplicate hooks** - Merge `useUserLoanApplications` variants
2. **Implement pagination** - Add page/size to all list hooks
3. **React Query invalidation** - Auto-refetch after contract calls
4. **Block-based refetch** - Sync data when blockchain updates

### Medium Priority
5. **Refactor types** - Separate API DTOs from domain models
6. **Contract hooks** - Wrap Wagmi calls in reusable hooks
7. **Error handling** - Add error boundaries and better error UI
8. **Standardize BigInt** - Create utility for query key serialization

### Low Priority
9. **Loading skeletons** - Replace spinners with skeleton screens
10. **Environment config** - Move hardcoded values to .env

---

## 10. API Endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| `/api/v1/loans/user-loan-applications` | GET | `Page<UserLoanApplicationResponse>` |
| `/api/v1/loans/user-loan-applications/{id}` | GET | `UserLoanApplicationResponse` |
| `/api/v1/loans/user-loan-offers` | GET | `Page<UserLoanOfferResponse>` |
| `/api/v1/loans/user-loan-offers/{id}` | GET | `UserLoanOfferResponse` |
| `/api/v1/loans/user-loan-applications/{id}/offers` | GET | `Page<UserLoanOfferResponse>` |
| `/api/v1/user-assets/balance/{address}` | GET | `UserBalanceResponse` |
| `/api/v1/user-assets/nfts` | GET | `Page<UserNftResponse>` |
| `/api/v1/user-assets/nfts/{id}` | GET | `UserNftResponse` |

---

## 11. Setup Instructions

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# Start dev server
npm run dev
```

### Blockchain

```bash
# Start Hardhat node
cd backend && npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.ts --network localhost
```

---

## Summary

**Strengths:**
✅ Type-safe TypeScript throughout
✅ Clean separation of concerns
✅ React Query for smart caching
✅ Wagmi abstracts Web3 complexity

**Weaknesses:**
❌ Pagination not implemented
❌ Duplicate hooks
❌ No auto-refetch on blockchain changes
❌ BigInt handling manual

**Next Steps:** Address critical issues (pagination, hook consolidation, query invalidation) to improve code quality and maintainability.
