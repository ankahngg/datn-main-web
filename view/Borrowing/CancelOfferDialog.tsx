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

type CancelDialogProps = {
    application: LoanApplication;
    offer: LoanOffer;
    userBalance: UserBalanceResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function CancelOfferDialog({

    application,
    offer,
    userBalance,
  open,
  onOpenChange,
  title,
  content,
  txMessage,
  txStatus,
  isSubmtting,
  onConfirm,
}: CancelDialogProps) {
  const isSubmitting = Boolean(isSubmtting);
  const canRetry = txStatus !== "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
        <div>
            {
                application.borrower.toLowerCase() != offer.requester.toLowerCase() && 
                <BeforeAfterCard 
                    beforeLabel="Số dư hiện tại"
                    beforeValue={formatUsdc(userBalance.usdcBalance)}
                    changeLabel="Tiền hoàn lại"
                    changeValue={formatUsdc(offer.loanAmount)}
                    afterLabel="Số dư sau khi hủy đề nghị"
                    afterValue={formatUsdc(userBalance.usdcBalance + offer.loanAmount)}
                    currency="USDC"
                    type="increase"
                />
            }
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