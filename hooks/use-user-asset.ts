"use client";

import { UserBalanceResponse, UserNftFilter } from "@/model/User";
import { getUserBalance, getUserNfts, getUserNftsById } from "@/service/modules/asset";
import { useQuery } from "@tanstack/react-query";

const USER_ASSET_BALANCE_KEY = "userAssetBalance";
const USER_ASSET_NFT_KEY = "userAssetNft";

export function useUserBalance(address: string | undefined) {
  const enabled = Boolean(address);

  const query = useQuery<UserBalanceResponse, Error>({
    queryKey: [USER_ASSET_BALANCE_KEY, address],
    queryFn: () => {
      if (!address) {
        throw new Error("Wallet address is required");
      }
      return getUserBalance(address);
    },
    enabled,
  });

  return query;
}

export interface UseGetUserNftsOptions {
  filter: UserNftFilter;
  page?: number;
  size?: number;
  sort?: string;
}

export function useUserNfts(options: UseGetUserNftsOptions) {
  const { filter, page = 0, size = 10, sort = "timeCreated,DESC" } = options;
  const query = useQuery({
    queryKey: [USER_ASSET_NFT_KEY, filter, page, size, sort],
    queryFn: () => {
      
      return getUserNfts(
        {
          filter,
          page,
          size,
          sort,
        }
       );
    }
  });

  return query;
}

export function useUserNFTById(nftId: bigint | undefined) {
  const enabled = Boolean(nftId);

  const query = useQuery({
    queryKey: [USER_ASSET_NFT_KEY, nftId?.toString()],
    queryFn: () => {
      if (!nftId) {
        throw new Error("NFT ID is required");
      }
      return getUserNftsById(nftId);
    }
    ,
    enabled,
  });
  
  return query;
}
