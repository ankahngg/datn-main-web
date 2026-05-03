
import { Page } from "@/service/api";
import { BankAsset, UserNFTResponseStatus } from "./enum";

export interface UserBalanceResponse {
  userWalletAddress : string;
  usdcBalance: bigint;
  ethBalance: bigint;
} 

export interface UserNftFilter {
    user?: string;
    nftAddress?: string;
    fromTimeCreated?: string; // ISO string
    toTimeCreated?: string; // ISO string
}

export interface UserNftResponse {
  id  : number;
  nftId: bigint;
  user : string;
  nftAddress: string;
  tokenId : bigint;
 status : UserNFTResponseStatus
    timeCreated: string;
    timeWithdrawn ?: string;
    createdAt: string;
}


export const mockBalance: UserBalanceResponse = {
  userWalletAddress: "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
  usdcBalance: BigInt("1000000000"), // 1000 USDC with 6 decimals
  ethBalance: BigInt("50000000000000000"), // 0.05 ETH with 18 decimals
};

export type AssetBalance = {
  symbol: BankAsset;
  name: string;
  amount: string;
  unit: string;
};

export type UserNft = {
  id: number;
  nftId: bigint;
  nftAddress: string;
  tokenId: bigint;
  name?: string;
  description?: string;
    collectionName?: string;
  depositedAt: string;
  status: UserNFTResponseStatus;
};

export type AssetTransferSubmitValues = {
  action: string;
  asset: BankAsset;
  amount: number;
  nftName?: string;
  nftDescription?: string;
  nftAddress?: string;
  tokenId?: string;
  withdrawNftId?: string;
};

export const nftStatusVariantMap : Record<UserNFTResponseStatus, "success" | "danger" | "warning"> = {
  DEPOSITED: "success",
  WITHDRAWN: "danger",
    PENDING_DEPOSIT: "warning",
    PENDING_WITHDRAW: "warning",
    COLLATERALIZED: "danger",
};

export const nftStatusLabelMap : Record<UserNFTResponseStatus, string> = {
  DEPOSITED: "Đã gửi",
  WITHDRAWN: "Đã rút",
    PENDING_DEPOSIT: "Đang gửi",
    PENDING_WITHDRAW: "Đang rút",
    COLLATERALIZED: "Khóa",
};

export const mockNftsResponse: Page<UserNftResponse> = {
  content: [
    {
      id: 1,
        nftId: BigInt("1001"),
        user: "0x1234...abcd",
        nftAddress: "0x5678...efgh",
        tokenId: BigInt("1"),
        status: "DEPOSITED",
        timeCreated: "2024-01-01T12:00:00Z",
        createdAt: "2024-01-01T12:00:00Z",
    },
    {
      id: 2,
        nftId: BigInt("1002"),
        user: "0x1234...abcd",
        nftAddress: "0x5678...efgh",
        tokenId: BigInt("2"),
        status: "PENDING_DEPOSIT",
        timeCreated: "2024-01-02T12:00:00Z",
        createdAt: "2024-01-02T12:00:00Z",
    },
  ],
  totalElements: 2,
    totalPages: 1,
    size: 10,
    number: 0,
};
