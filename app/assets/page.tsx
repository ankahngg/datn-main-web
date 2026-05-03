"use client";

import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Coins, Wallet } from "lucide-react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatEther, formatUnits, parseEther, parseUnits } from "viem";
import abi from "@/abi.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WalletRequired from "@/components/wallet-required";
import { AssetTransferDialog } from "@/view/Asset/AssetTransferDialog";

import { TransactionHistoryTable } from "@/view/Asset/TransactionHistoryTable";

import { contractAddress, usdcAddress } from "@/config/app.config";
import { useUserBalance, useUserNfts } from "@/hooks/use-user-asset";
import { FullScreenError } from "@/MyComponent/FullScreenError";
import { FullScreenLoading } from "@/MyComponent/FullLoadingScreen";
import { useBankTransactions } from "@/hooks/use-bank-transactions";
import { formatDate } from "@/utils";
import PageHeader from "@/components/shared/PageHeader";
import { UserNft, AssetBalance, AssetTransferSubmitValues } from "@/model/User";
import { Transaction } from "@/model/BankTransaction";
import { UserNftTable } from "@/view/Asset/NftTable";

const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const erc721Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export default function AssetsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { refetch: refetchUsdcAllowance } = useReadContract({
    address: usdcAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address
      ? [address as `0x${string}`, contractAddress as `0x${string}`]
      : undefined,
    query: {
      enabled: !!address,
    },
  });
  
  const {data: userBalance, isLoading: userBalanceLoading, isError: userBalanceIsError, error: userBalanceError} = useUserBalance(useAccount().address);
  const {data: userNfts, isLoading: userNftsLoading, isError: userNftsIsError, error: userNftsError} = useUserNfts(
    {
      filter: {
        user: address,
      },
    }
  );
  const {data: history, isLoading: historyLoading, isError: historyIsError, error: historyError} = useBankTransactions ({
    filter: {
      user: address,
    },
  });

  const UserNfts = useMemo((): UserNft[] => {
    if (userNfts) {
      return userNfts.content.map((nft) => ({
        id: nft.id,
        nftId: nft.nftId,
        nftAddress: nft.nftAddress,
        tokenId: nft.tokenId,
        name: `NFT #${nft.nftId}`,
        depositedAt: formatDate(nft.timeCreated),
        status: nft.status
        
      }));
    }
    return [];
  }
  , [userNfts]);
  console.log("UserNfts :", userNfts);

  const availableNfts = useMemo(() => {
    return UserNfts.filter((nft) => nft.status === "DEPOSITED" || nft.status === "COLLATERALIZED");
  }, [UserNfts]);
  console.log("availableNfts :", availableNfts);

   const balances = useMemo((): AssetBalance[] => {
    if (userBalance) {
      return [
        { symbol: "ETHER", name: "Ethereum", amount: formatEther(userBalance.ethBalance), unit: "ETH" },
        { symbol: "USDC", name: "USD Coin", amount: formatUnits(userBalance.usdcBalance, 6), unit: "USDC" },
        { symbol: "NFT", name: "NFTs", amount: availableNfts.length.toString(), unit: "NFT" },
      ];
    }
    return [];
  }, [userBalance]);
  console.log("balances :", balances);

  const transactionHistory = useMemo((): Transaction[] => {
    if (history) {
      return history.content.map((tx) => ({
        id: tx.id,
        type: tx.bankAction,
        asset: tx.bankAsset,
        amount: tx.amount,
        time: formatDate(tx.eventTimestamp),
        status: tx.status,
      }));
    }
    return [];
  }
  , [history]);
  console.log("transactionHistory :", transactionHistory);

  if (userBalanceIsError || userNftsIsError) {
    console.error("Error loading user assets", {
      balanceError: userBalanceError,
      nftsError: userNftsError,
    });
    return <FullScreenError message="Lỗi khi tải dữ liệu tài sản của bạn. Vui lòng thử lại sau." onRetry={() => {}} />;
  }

  if (userBalanceLoading || userNftsLoading) {
    return <FullScreenLoading message="Đang tải dữ liệu tài sản của bạn..." />;
  }

  // return <FullScreenError message="Lỗi khi tải dữ liệu tài sản của bạn. Vui lòng thử lại sau." onRetry={() => {}} />;
  // return <FullScreenLoading message="Đang tải dữ liệu tài sản của bạn..." />;

  function resetTxFeedback() {
    setTxStatus(null);
    setTxMessage(null);
  }

  async function handleTransferSubmit(values: AssetTransferSubmitValues) {
    if (!address) {
      console.warn("Wallet is not connected");
      return;
    }
    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      const amountStr = values.amount.toString();

      // ETH 
      if (values.asset === "ETHER") {
        if (values.action === "Gửi") {
          await writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: (abi as { abi: unknown[] }).abi,
            functionName: "depositEther",
            value: parseEther(amountStr),
          });
        } else {
          await writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: (abi as { abi: unknown[] }).abi,
            functionName: "withdrawEther",
            args: [parseEther(amountStr)],
          });
        }
      }

      // USDC
      if (values.asset === "USDC") {
        const amountUsdc = parseUnits(amountStr, 6); // USDC 6 decimals

        if (values.action === "Gửi") {
          const { data: currentAllowance } = await refetchUsdcAllowance();
          const allowance = currentAllowance ?? 0;

          if (allowance < amountUsdc) {
            await writeContractAsync({
              address: usdcAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: "approve",
              args: [contractAddress as `0x${string}`, amountUsdc],
            });
          }

          await writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: (abi as { abi: unknown[] }).abi,
            functionName: "depositUSDC",
            args: [amountUsdc],
          });
        } else {
          await writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: (abi as { abi: unknown[] }).abi,
            functionName: "withdrawUSDC",
            args: [amountUsdc],
          });
        }
      }

      // NFT
      if (values.asset === "NFT") {
        if (values.action === "Gửi") {
          // Approve NFT for the bank contract before depositing
          await writeContractAsync({
            address: values.nftAddress as `0x${string}`,
            abi: erc721Abi,
            functionName: "approve",
            args: [contractAddress as `0x${string}`, BigInt(values.tokenId || "0")],
          });

          await writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: (abi as { abi: unknown[] }).abi,
            functionName: "depositNFT",
            args: [values.nftAddress as `0x${string}`, BigInt(values.tokenId || "0")],
          });
        } else if (values.action === "Rút") {
          await writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: (abi as { abi: unknown[] }).abi,
            functionName: "withdrawNFT",
            args: [BigInt(values.withdrawNftId || "0")],
          });
        }
      }

      setTxStatus("success");
      setTxMessage("Giao dịch thành công.");
      console.info("Transfer success", values);
    } catch (error) {
      console.error("Transfer failed", error);
      setTxStatus("error");
      setTxMessage("Hệ thống bận, vui lòng thử lại sau");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <WalletRequired
      title="Trang tài sản yêu cầu kết nối ví"
      message="Kết nối ví để xem số dư, quản lý NFT và thực hiện giao dịch gửi/rút tài sản."
    >
      <div className="space-y-6 pb-8">
        <PageHeader 
          title="Tài sản của bạn"
          description="Quản lý số dư ETH, USDC và NFT của bạn. Xem lịch sử giao dịch và các NFT đã gửi."
        />

        <section className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="size-4" />
              <span>Tài khoản</span>
            </div>
            <AssetTransferDialog
              balances={balances}
              availableNfts={availableNfts}
              onSubmitTransfer={handleTransferSubmit}
              isSubmitting={isSubmitting}
              txStatus={txStatus}
              txMessage={txMessage}
              onResetStatus={resetTxFeedback}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {balances?.map((asset) => (
              <Card key={asset.symbol} className="bg-sidebar">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    {asset.symbol}
                  </CardTitle>
                  <CardDescription>{asset.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold font-sans text-foreground">
                    {asset.amount}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {asset.unit} đang có
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="size-4" />
            <span>Danh sách NFT đã gửi</span>
          </div>

          <UserNftTable data={UserNfts} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Lịch sử giao dịch</span>
          </div>

          <TransactionHistoryTable history={transactionHistory} />
        </section>
      </div>
    </WalletRequired>
  );
}
