"use client";

import { UserBalance, UserBalanceResponse, UserNft, UserNftFilter } from "@/model/User";
import {
  getUserBalance,
  getUserNfts,
  getUserNftsById,
  UserNftParams,
} from "@/service/modules/asset";
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

export function useUserBalance2(address: string | undefined) {
  const enabled = Boolean(address);
  
  const query = useQuery<UserBalance, Error>({
    queryKey: [USER_ASSET_BALANCE_KEY, address],
    queryFn: async () => {
      if (!address) {
        throw new Error("Wallet address is required");
      }
      const data = await getUserBalance(address);
      return {
        userWalletAddress: data.userWalletAddress,
        usdcBalance: data.usdcBalance,
        ethBalance: data.ethBalance,
      };
    }
    ,enabled,
  });
  
  return query;
}



export function useUserNfts(options: UserNftParams) {
  const { filter, pageable } = options;
  const query = useQuery({
    queryKey: [USER_ASSET_NFT_KEY, filter, pageable],
    queryFn: () => {
      return getUserNfts({
        filter,
        pageable,
      });
    },
  });

  return query;
}

export function useUserNfts2(options: UserNftParams) {
  const { filter, pageable } = options;
  const query = useQuery<UserNft[], Error>({
    queryKey: [USER_ASSET_NFT_KEY, filter, pageable],
    queryFn: async () => {
      const data = await getUserNfts({
        filter,
        pageable,
      });
      return data.content.map((nft) => ({
        id: nft.id,
        nftId: nft.nftId,
        nftAddress: nft.nftAddress,
        tokenId: nft.tokenId,
        name: "NFT#" + nft.tokenId.toString(), // Placeholder name, replace with actual name if available
        description: "", // Placeholder description
        collectionName: "", // Placeholder collection name
        timeCreated: nft.timeCreated,
        status: nft.status,
        timeWithdrawn: nft.timeWithdrawn,
      }));
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
    },
    enabled,
  });

  return query;
}

export function useUserNFTById2(nftId: bigint | undefined) {
  const enabled = Boolean(nftId);

  const query = useQuery<UserNft>({
    queryKey: [USER_ASSET_NFT_KEY, nftId?.toString()],
    queryFn: async () => {
      if (!nftId) {
        throw new Error("NFT ID is required");
      }
      const data = await getUserNftsById(nftId);
      return {
        id: data.id,
        nftId: data.nftId,
        user: data.user,
        nftAddress: data.nftAddress,
        tokenId: data.tokenId,
        status: data.status,
        timeCreated: data.timeCreated,
        timeWithdrawn: data.timeWithdrawn,
        name: "NFT#" + data.tokenId.toString(), // Placeholder name, replace with actual name if available
      };
    },
    enabled,
  });

  return query;
}
