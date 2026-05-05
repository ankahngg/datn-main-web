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

type CancelDialogProps = {
    transferApplication: UserLoanTransfer;
    transferOffer: UserLoanTransferOffer;
    userBalance: UserBalanceResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onCancel: (offerId: bigint) => void | Promise<void>;
};

export function CancelTransferOfferDialog({
    transferApplication,
    transferOffer,
    userBalance,
  open,
  onOpenChange,
  txMessage,
  txStatus,
  isSubmtting,
  onCancel,
}: CancelDialogProps) {
  const isSubmitting = Boolean(isSubmtting);
  const canRetry = txStatus !== "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {`Hủy đề nghị chuyển nhượng #${transferOffer.offerId}`}
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy đề nghị chuyển nhượng này không? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <div>
            <BeforeAfterCard 
                beforeLabel="Số dư hiện tại"
                beforeValue={formatUsdc(userBalance.usdcBalance)}
                changeLabel="Tiền hoàn lại"
                changeValue={formatUsdc(transferOffer.price)}
                afterLabel="Số dư sau khi hủy đề nghị"
                afterValue={formatUsdc(userBalance.usdcBalance + transferOffer.price)}
                currency="USDC"
                type="increase"
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
              onCancel(transferOffer.offerId);
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