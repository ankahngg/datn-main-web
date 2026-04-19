import { mockBankTransactions } from "@/view/Asset/mock-data";
import { Page, request } from "../api";

export type BankAsset = "ETH" | "USDC" | "NFT" | string;
export type BankAction = "DEPOSIT" | "WITHDRAW" | "BORROW" | "REPAY" | string;

export interface EventBaseResponse {
  txHash: string;
  blockNumber: string; // BigInteger as string
  logIndex: number;
  eventTimestamp: string; // BigInteger as string (epoch seconds/millis)
}

export interface BankTransactionResponse extends EventBaseResponse {
  id: number;
  user: string;
  amount: bigint; // BigInteger as string
  bankAsset: BankAsset;
  bankAction: BankAction;
  nftAddress?: string | null;
  tokenId?: string | null; // BigInteger as string
}

export interface BankTransactionFilter {
  user?: string;
  fromTime?: number; // epoch millis
  toTime?: number;   // epoch millis
  assetTypes?: BankAsset[];
  actions?: BankAction[];
}

export interface Pageable {
  page?: number; // zero-based index as in Spring Pageable
  size?: number;
  sort?: string; // e.g. "createdAt,DESC"
}

export interface BankTransactionHistoryParams {
  filter: BankTransactionFilter;
  pageable?: Pageable;
}

export async function getBankTransactions({
  filter,
  pageable,
}: BankTransactionHistoryParams) {

  if (process.env.NEXT_PUBLIC_DEV === "true") {
    console.log("Returning mock bank transactions with filter:", filter, "and pageable:", pageable);
    return mockBankTransactions;
  }
  const { user, fromTime, toTime, assetTypes, actions } = filter;

  const data = await request<Page<BankTransactionResponse>>({
    path: "/api/v1/bank-transaction/history",
    method: "GET",
    query: {
      user,
      fromTime,
      toTime,
      // Spring kiểu "assetTypes=ETH&assetTypes=USDC"; ở đây gửi dạng comma-separated nếu backend chấp nhận.
      assetTypes: assetTypes && assetTypes.length > 0 ? assetTypes.join(",") : undefined,
      actions: actions && actions.length > 0 ? actions.join(",") : undefined,
      page: pageable?.page ?? 0,
      size: pageable?.size ?? 10,
      sort: pageable?.sort ?? "createdAt,DESC",
    },
  });

  
  return data;
}
