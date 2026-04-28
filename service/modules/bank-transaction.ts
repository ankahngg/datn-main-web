import { mockBankTransactions } from "@/view/Asset/mock-data";
import { Page, Pageable, request } from "../api";

export type BankAsset = "ETHER" | "USDC" | "NFT";
export type BankAction = "DEPOSIT" | "WITHDRAW";

export type TransactionStatus = "PROCESSING" | "DONE" | "FAILED";

export interface TransactionEventBaseResponse {
  txHash: string;
  blockNumber: bigint; // BigInteger as string
  logIndex: number;
  eventTimestamp: string;
  createdAt: string;
  status : TransactionStatus;
}

export interface BankTransactionResponse extends TransactionEventBaseResponse {
  id: number;
  user: string;
  amount: bigint; // BigInteger as string
  bankAsset: BankAsset;
  bankAction: BankAction;
  nftAddress?: string;
  tokenId?: string// BigInteger as string
}

export interface BankTransactionFilter {
  user?: string;
  fromTime?: number; // epoch millis
  toTime?: number;   // epoch millis
  assetTypes?: BankAsset[];
  actions?: BankAction[];
}

export interface BankTransactionHistoryParams {
  filter: BankTransactionFilter;
  pageable?: Pageable;
}

export async function getBankTransactions({
  filter,
  pageable,
}: BankTransactionHistoryParams) {

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
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
