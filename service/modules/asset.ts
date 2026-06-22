
import { useMockData } from "@/config/app.config";
import { Page, Pageable, request } from "../api";
import { mockBalance, mockNftsResponse, UserBalanceResponse, UserNftFilter, UserNftResponse } from "@/model/User";

export interface UserNftParams {
  filter: UserNftFilter;
  pageable?: Pageable;
}


// Get the balance of a user by their wallet address
export async function getUserBalance(address: string) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(useMockData) {
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
export async function getUserNfts(options: UserNftParams) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(useMockData) {
    console.log("Returning mock NFTs for user:", options.filter.user);
    return mockNftsResponse;
  }
  const data = await request<Page<UserNftResponse>>({
    path: "/api/v1/user-assets/nfts",
    query: {
        ...options.filter,
        page: options.pageable?.page ?? 0,
        size: options.pageable?.size ?? 10,
        sort: options.pageable?.sort ?? "timeCreated,DESC",
    },
    method: "GET",
  });
  
  return data;
}

export async function getUserNftsById(nftId: bigint) {
  console.log("DEV environment:", process.env.NEXT_PUBLIC_DEV);
  if(useMockData) {
    console.log("Returning mock NFT for ID:", nftId);
    const val = mockNftsResponse.content.find(nft => nft.nftId === nftId) ?? null;
    if (!val) throw new Error(`Mock NFT with ID ${nftId} not found`);
    return val;
  }
  const data = await request<UserNftResponse>({
    path: `/api/v1/user-assets/nfts/${nftId}`,
    method: "GET",
  });

  return data;
}


