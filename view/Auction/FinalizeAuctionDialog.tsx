"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import clsx from "clsx";
import { LoanApplication } from "@/model/LoanApplication";
import { LoanOffer } from "@/model/LoanOffer";
import BeforeAfterCard from "@/components/shared/BeforeAfterCard";
import { UserBalanceResponse } from "@/model/User";
import { formatUsdc } from "@/utils";
import { UserLoan } from "@/model/Loan";
import { UserLoanTransfer } from "@/model/LoanTransfer";
import { UserLoanTransferOffer } from "@/model/LoanTransferOffer";
import { Auction } from "@/model/Auction";
import { AuctionFinalizeSubmit } from "@/model/AuctionTransaction";
import { useAccount } from "wagmi";

type FinalizeAuctionProps = {
    auction: Auction;
    
    userBalance: UserBalanceResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onFinalize: (val: AuctionFinalizeSubmit) => void | Promise<void>;
};

export function FinalizeAuctionDialog({
    auction,
    userBalance,
  open,
  onOpenChange,
  txMessage,
  txStatus,
  isSubmtting,
  onFinalize,
}: FinalizeAuctionProps) {
    const {address} = useAccount();
  const isSubmitting = Boolean(isSubmtting);
  const canRetry = txStatus !== "success";
  const isHaveBid = auction.highestBid > BigInt(0) && auction.highestBidder !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {`Chốt đấu giá #${auction.auctionId}`}
          </DialogTitle>
          <DialogDescription>
            {
                isHaveBid
                ? `Số tiền đấu giá sẽ được trả nợ và dư ra sẽ được chuyển về tài khoản của người bán. `
                : "Đấu giá sẽ kết thúc mà không có ai trả giá. Thế chấp khoản vay sẽ được trả về người cho vay."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-3 bg-background text-foreground">
          {txMessage && (
                          <p
                            className={clsx(
                              "mr-auto text-sm",
                              txStatus === "success" && "text-emerald-400",
                              txStatus === "error" && "text-red-400",
                            )}
                          >
                            {txMessage}
                          </p>
                        )}
          <Button
            className="red-btn"
            onClick={() => {
              onFinalize({
                auctionId: auction.auctionId,
              });
            }}
            disabled={isSubmitting || !canRetry}
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}