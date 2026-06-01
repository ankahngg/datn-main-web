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
import { DetailCard } from "@/components/shared/DetailCard";

type StartAuctionDialogProps = {
    loan: UserLoan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function StartAuctionDialog({
    loan,
  open,
  onOpenChange,
  txMessage,
  txStatus,
  isSubmtting,
  onConfirm,
}: StartAuctionDialogProps) {
  const isSubmitting = Boolean(isSubmtting);
  const canRetry = txStatus !== "success";

  const startPrice = loan.remainingAmount > BigInt(loan.loanAmount) * BigInt(6) / BigInt(10) 
  ? loan.remainingAmount : BigInt(loan.loanAmount) * BigInt(6) / BigInt(10) 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Bắt đầu đấu giá khoản vay
          </DialogTitle>
          <DialogDescription>
            <p>
                Khoản vay chỉ được đấu giá khi đã quá hạn và chưa được thanh toán. 
            </p>
            <p>
                Khi bắt đầu đấu giá, mọi người sẽ đấu giá để mua lại tài sản thế chấp của khoản vay.
            </p>
            <p className="text-red-400">
                Số tiền khởi điểm = Max (Số tiền còn nợ, Số tiền vay ban đầu * 60%)
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
            <DetailCard
            label="Số tiền còn nợ"
            value={formatUsdc(loan.remainingAmount) }
           />
            <DetailCard
            label="60% Số tiền vay"
            value={formatUsdc(BigInt(loan.loanAmount) * BigInt(6) / BigInt(10)) }
           />
           
           <DetailCard
            className="col-span-2"
            label="Số tiền khởi điểm đấu giá"
            value={formatUsdc(startPrice) }
           />
           
            
        </div>
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
              onConfirm();
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