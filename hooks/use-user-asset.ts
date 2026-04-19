"use client";

import { getUserBalance, getUserNfts, UserBalanceResponse } from "@/service/modules/asset";
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

export function useUserNfts(address: string | undefined) {
  const enabled = Boolean(address);

  const query = useQuery({
    queryKey: [USER_ASSET_NFT_KEY, address],
    queryFn: () => {
      if (!address) {
        throw new Error("Wallet address is required");
      }
      return getUserNfts(address);
    }
    ,
    enabled,
  });

  return query;
}
