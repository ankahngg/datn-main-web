import { mockNfts } from "@/view/Asset/mock-data";
import { Page, request } from "../api";

export interface UserBalanceResponse {
  userAddress : string;
  usdcBalance: bigint;
  ethBalance: bigint;
} 

export interface UserNftResponse {
  userAddress: string;
  id  : number;
  nftId: bigint;
  user : string;
  nftAddress: string;
  tokenId : bigint;
  timeCreated: string;
  createdAt: string;
  isWithdrawn?: boolean;
  withdrawnAt?: string;
  // Optional fields for enriched NFT data
  nftName?: string;
  nftDescription?: string;
  nftCollectionName?: string;
  nftImageUrl?: string;
}

const mockBalance: UserBalanceResponse = {
  userAddress: "0x1234...abcd",
  usdcBalance: BigInt("1000000000000000000"), // 1,000 USDC with 18 decimals
  ethBalance: BigInt("50000000000000000"), // 0.05 ETH with 18 decimals
};


export async function getUserBalance(address: string) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(process.env.NEXT_USE_MOCK_DATA === "true") {
    console.log("Returning mock balance for user:", address);
    return mockBalance;
  }

  const data = await request<UserBalanceResponse>({
    path: `/api/v1/user-assets/balance/${address}`,
    method: "GET",
  });
  
  return data;
}

export async function getUserNfts(address: string) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(process.env.NEXT_USE_MOCK_DATA === "true") {
    console.log("Returning mock NFTs for user:", address);
    return mockNfts;
  }
  const data = await request<Page<UserNftResponse>>({
    path: "/api/v1/user-assets/nfts",
    query: {
      user: address,
    },
    method: "GET",
  });
  
  return data;
}


