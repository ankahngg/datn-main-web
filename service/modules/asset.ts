
import { UseGetUserNftsOptions } from "@/hooks/use-user-asset";
import { Page, request } from "../api";
import { mockBalance, mockNftsResponse, UserBalanceResponse, UserNftResponse } from "@/model/User";

// Get the balance of a user by their wallet address
export async function getUserBalance(address: string) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock balance for user:", address);
    return mockBalance;
  }

  const data = await request<UserBalanceResponse>({
    path: `/api/v1/user-assets/balance/${address}`,
    method: "GET",
  });
  
  return data;
}


// Get the NFTs owned by a user by their wallet address
export async function getUserNfts(options: UseGetUserNftsOptions) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock NFTs for user:", options.filter.user);
    return mockNftsResponse;
  }
  const data = await request<Page<UserNftResponse>>({
    path: "/api/v1/user-assets/nfts",
    query: {
        ...options.filter,
        page: options.page ?? 0,
        size: options.size ?? 10,
        sort: options.sort ?? "createdAt,DESC",
    },
    method: "GET",
  });
  
  return data;
}

export async function getUserNftsById(nftId: bigint) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    console.log("Returning mock NFT for ID:", nftId);
    return mockNftsResponse.content.find(nft => nft.nftId === nftId);
  }
  const data = await request<UserNftResponse>({
    path: `/api/v1/user-assets/nfts/${nftId}`,
    method: "GET",
  });

  return data;
}


