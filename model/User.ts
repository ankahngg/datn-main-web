
import { Page } from "@/service/api";
import { BankAsset, UserNFTResponseStatus } from "./enum";

export interface UserBalanceResponse {
  userWalletAddress : string;
  usdcBalance: bigint;
  ethBalance: bigint;
} 

export interface UserBalance {
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
  userWalletAddress: "0xD838d5d1B7d03544BF95Aaa8FC5B0EF3a4088a95",
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
  timeCreated: string;
  status: UserNFTResponseStatus;
  timeWithdrawn?: string;

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
        user: "0xD838d5d1B7d03544BF95Aaa8FC5B0EF3a4088a95",
        nftAddress: "0xE7fC53AB9634aA4005fd6Ac26fE46570Bf112023",
        tokenId: BigInt("0"),
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
