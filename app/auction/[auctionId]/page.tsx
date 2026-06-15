"use client";

import BackButton from "@/components/shared/BackButton";
import { DetailCard } from "@/components/shared/DetailCard";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WalletRequired from "@/components/wallet-required";
import { useAuctionById2 } from "@/hooks/use-auction";
import { useAuctionTransactions2 } from "@/hooks/use-auction-transaction";
import { useUserBalance2 } from "@/hooks/use-user-asset";
import {
  AuctionStatusVariantMap,
  AuctionStatusLabelMap,
  Auction,
} from "@/model/Auction";
import {
  AuctionBidSubmit,
  AuctionFinalizeSubmit,
  AuctionTransaction,
  AuctionTransactionAction,
} from "@/model/AuctionTransaction";
import { formatUsdc, formatDate } from "@/utils";
import AuctionTransactionBidDialog from "@/view/Auction/AuctionTransactionBidDialog";
import AuctionTransactionTable from "@/view/Auction/AuctionTransactionTable";
import { FinalizeAuctionDialog } from "@/view/Auction/FinalizeAuctionDialog";
import { Wallet } from "lucide-react";
import abiData from "@/abi.json";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { fi } from "zod/v4/locales";
import { contractAddress } from "@/config/app.config";

function Page() {
  const { address } = useAccount();
  const params = useParams<{ auctionId: string }>();
  const auctionId = BigInt(params.auctionId);
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [openBidDialog, setOpenBidDialog] = useState(false);
  const [openFinalizeDialog, setOpenFinalizeDialog] = useState(false);

  const { data: auction, isLoading, error } = useAuctionById2(auctionId);
  const { data: auctionTransactions, isLoading: auctionTransactionsIsLoading } =
    useAuctionTransactions2({
      filter: {
        auctionId: Number(auctionId),
      },
      pageable: {
        page: 0,
        size: 100,
        sort: "eventTimestamp,DESC",
      },
    });
  const { data: userBalance, isLoading: userBalanceIsLoading } =
    useUserBalance2(address);
  
  const canBid = auction && auction.status === "CREATED" && new Date() < new Date(auction.timeEnd) || false;
  const canFinalize =
    auction &&
    auction.status === "CREATED" &&
    auction.timeEnd &&
    new Date() > new Date(auction.timeEnd) || false;

  if (isLoading || userBalanceIsLoading || auctionTransactionsIsLoading)
    return <FullScreenLoading />;

  if (!auction || !auctionTransactions || !userBalance)
    return (
      <FullScreenLoading message="Không thể tải dữ liệu đấu giá. Vui lòng thử lại sau." />
    );

  function handleAuctionTransactionAction(
    auctionTransactionAction: AuctionTransactionAction,
    auctionTransaction: AuctionTransaction,
  ) {
    switch (auctionTransactionAction) {
      case "VIEW_DETAILS":
        // router.push(`/auction/${auction.auctionId}`);
        alert(
          `Xem chi tiết giao dịch đấu giá #${auctionTransaction.auctionId}`,
        );
        break;
      default:
        break;
    }
  }

  async function onBid(submitData: AuctionBidSubmit) {
    if (!address) {
      console.warn("Wallet is not connected");
      setTxStatus("error");
      setTxMessage("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "bid",
        args: [submitData.auctionId, submitData.bidAmount],
      });

      setTxStatus("success");
      setTxMessage("Đặt giá thành công");
    } catch (error: any) {
      console.error("Error placing bid:", error);
      setTxStatus("error");
      setTxMessage( "Có lỗi xảy ra khi đặt giá");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onFinalize(submitData : AuctionFinalizeSubmit) {
    if (!address) {
      console.warn("Wallet is not connected");
      setTxStatus("error");
      setTxMessage("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "finalizeAuction",
        args: [submitData.auctionId],
      });

      setTxStatus("success");
      setTxMessage("Chốt đấu giá thành công");
    }
      catch (error: any) {  
      console.error("Error finalizing auction:", error);
      setTxStatus("error");
      setTxMessage("Có lỗi xảy ra khi chốt đấu giá");
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <WalletRequired
      title="Trang chi tiết đấu giá yêu cầu kết nối ví"
      message="Kết nối ví để thực hiện các hành động liên quan đến đấu giá."
    >
      <div className="space-y-6 pb-8">
        <BackButton title="Quay lại" />

        <Card className="bg-sidebar text-foreground">
          <CardHeader>
            <CardTitle>Chi tiết đấu giá #{auction.auctionId}</CardTitle>
          </CardHeader>

          <CardContent className="gap-3 grid sm:grid-cols-2 lg:grid-cols-3">
            <DetailCard
              label="Người trả giá cao nhất"
              value={auction.highestBidder || "Chưa có người mua"}
              className="col-span-2 detail-card-bg"
            />
            <DetailCard
              label="Giá cao nhất hiện tại"
              value={formatUsdc(auction.highestBid)}
              className="detail-card-bg col-span-1 "
            />
            <DetailCard
              label="Khoản vay đấu giá"
              value={
                <div className="flex gap-4 items-center">
                  <div>ID #{auction.loanId}</div>
                  <Button
                    className="text-sm text-muted-foreground italic underline hover:text-foreground bg-transparent border-0 p-0"
                    onClick={() =>
                      router.push(`/payment/history/${auction.loanId}`)
                    }
                  >
                    Xem khoản vay
                  </Button>
                </div>
              }
              className="detail-card-bg"
            />
            <DetailCard
              label="Giá khởi điểm"
              value={formatUsdc(auction.startPrice)}
              className="detail-card-bg"
            />

            <DetailCard
              label="Trạng thái"
              value={
                <Badge variant={AuctionStatusVariantMap[auction.status]}>
                  {AuctionStatusLabelMap[auction.status]}
                </Badge>
              }
              className="detail-card-bg"
            />
            <DetailCard
              label="Thời gian bắt đầu"
              value={formatDate(auction.timeStart)}
              className="detail-card-bg"
            />
            <DetailCard
              label="Thời gian dự kiến kết thúc"
              value={formatDate(auction.timeEnd)}
              className="detail-card-bg"
            />
            <DetailCard
              label="Thời gian kết thúc"
              value={formatDate(auction.timeFinalized)}
              className="detail-card-bg"
            />
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <AuctionTransactionBidDialog
              auction={auction}
              userBalance={userBalance}
              onBid={onBid}
              txMessage={txMessage}
              txStatus={txStatus}
              isSubmitting={isSubmitting}
              enabled={canBid}
              open={openBidDialog}
              onOpenChange={setOpenBidDialog}
            />
            {
              canFinalize
             && (
                <Button
                  className="my-btn"
                  onClick={() => setOpenFinalizeDialog(true)}
                >
                  Chốt đấu giá
                </Button>
              )}
          </CardFooter>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="size-4" />
              <span>Lịch sử đấu giá </span>
            </div>
          </div>
          <AuctionTransactionTable
            data={auctionTransactions}
            onAuctionTransactionAction={handleAuctionTransactionAction}
          />
        </section>

        <section>
          <FinalizeAuctionDialog
            userBalance={userBalance}
            auction={auction}
            onFinalize={onFinalize}
            open={openFinalizeDialog}
            onOpenChange={setOpenFinalizeDialog}
            txMessage={txMessage}
            txStatus={txStatus}
            isSubmtting={isSubmitting}
          />
        </section>
      </div>
    </WalletRequired>
  );
}

export default Page;
