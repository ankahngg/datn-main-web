"use client";

import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Coins, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import WalletRequired from "@/components/wallet-required";
import { AssetTransferDialog } from "@/view/Asset/AssetTransferDialog";
import { NftDepositTable } from "@/view/Asset/NftDepositTable";
import { TransactionHistoryTable } from "@/view/Asset/TransactionHistoryTable";
import type {
  AssetTransferSubmitValues,
  AssetBalance,
  NftDeposit,
  Transaction,
} from "@/view/Asset/types";

const initialBalances: AssetBalance[] = [
  { symbol: "ETH", name: "Ethereum", amount: 3.742, unit: "ETH" },
  { symbol: "USDC", name: "USD Coin", amount: 12450.22, unit: "USDC" },
  { symbol: "NFT", name: "Tài sản số", amount: 7, unit: "NFT" },
];

const initialHistory: Transaction[] = [
  {
    id: 1,
    type: "Gửi",
    asset: "ETH",
    amount: 1.2,
    time: "12/04/2026 - 08:40",
    status: "Thành công",
  },
  {
    id: 2,
    type: "Rút",
    asset: "USDC",
    amount: 700,
    time: "11/04/2026 - 21:15",
    status: "Thành công",
  },
  {
    id: 3,
    type: "Gửi",
    asset: "NFT",
    amount: 1,
    time: "11/04/2026 - 14:02",
    status: "Đang xử lý",
  },
  {
    id: 4,
    type: "Rút",
    asset: "ETH",
    amount: 0.45,
    time: "10/04/2026 - 18:30",
    status: "Thất bại",
  },
  {
    id: 5,
    type: "Gửi",
    asset: "USDC",
    amount: 2500,
    time: "09/04/2026 - 09:20",
    status: "Thành công",
  },
];

const initialNftDeposits: NftDeposit[] = [
  {
    id: 1,
    nftAddress: "0x8f2c6A89A1b5f6E7D2cC1932fB5aF18d9012c9A1",
    tokenId: "1024",
    name: "Lending Vault Genesis",
    depositedAt: "12/04/2026 - 08:05",
    status: "Đã deposit",
  },
  {
    id: 2,
    nftAddress: "0x4B7d11c3eA8f9087b4D0c8A2fEEf9B20c091E2f8",
    tokenId: "778",
    name: "Blue Chip NFT",
    depositedAt: "11/04/2026 - 19:20",
    status: "Đã deposit",
  },
  {
    id: 3,
    nftAddress: "0xA1e3D3B4A9f91C4E2d7B6c58f11eA4c0B1234d91",
    tokenId: "4512",
    name: "Rare Assets Series",
    depositedAt: "11/04/2026 - 14:50",
    status: "Đã rút",
  },
  {
    id: 4,
    nftAddress: "0x7C90F5B38E61A2fADc13e9b64D2ef0A91D31B2a7",
    tokenId: "88",
    name: "Collateral Art NFT",
    depositedAt: "10/04/2026 - 17:10",
    status: "Đã deposit",
  },
  {
    id: 5,
    nftAddress: "0x92F1b7E4C5d6A7e8f9012B3c4D5e6F7089A10cD3",
    tokenId: "309",
    name: "Yield NFT Pass",
    depositedAt: "09/04/2026 - 09:35",
    status: "Đã rút",
  },
];

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(value);
}

export default function AssetsPage() {
  const [balances, setBalances] = useState<AssetBalance[]>(initialBalances);
  const [nftDeposits, setNftDeposits] = useState<NftDeposit[]>(initialNftDeposits);
  const [history, setHistory] = useState<Transaction[]>(initialHistory);

  const availableNfts = useMemo(
    () => nftDeposits.filter((item) => item.status === "Đã deposit"),
    [nftDeposits]
  );

  function handleTransferSubmit(values: AssetTransferSubmitValues) {
    
  }

  return (
    <WalletRequired
      title="Trang tài sản yêu cầu kết nối ví"
      message="Kết nối ví để xem số dư, quản lý NFT và thực hiện giao dịch gửi/rút tài sản."
    >
      <div className="space-y-6 pb-8">
        <div className="rounded-2xl bg-sidebar p-5 shadow-lg">
          <h1 className="text-2xl font-heading">Gửi/rút tài sản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài sản thế chấp, gửi thêm hoặc rút về một cách nhanh chóng.
          </p>
        </div>

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
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {balances.map((asset) => (
              <Card key={asset.symbol} className="bg-sidebar">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    {asset.symbol}
                  </CardTitle>
                  <CardDescription>{asset.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold font-sans text-foreground">
                    {formatAmount(asset.amount)}
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

          <NftDepositTable deposits={nftDeposits} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Lịch sử giao dịch</span>
          </div>

          <TransactionHistoryTable history={history} />
        </section>
      </div>
    </WalletRequired>
  );
}
