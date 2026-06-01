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

import BeforeAfterCard from "@/components/shared/BeforeAfterCard";
import { UserBalanceResponse } from "@/model/User";
import { formatUsdc } from "@/utils";
import { UserLoanTransfer } from "@/model/LoanTransfer";
import { UserLoanTransferOffer } from "@/model/LoanTransferOffer";

type AcceptTransferDialogProps = {
    transferApplication: UserLoanTransfer;
    transferOffer?: UserLoanTransferOffer;
    userBalance: UserBalanceResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onConfirm: (accepter: "SELLER" | "BUYER", offerId : bigint, transferId : bigint) => void;
  accepter: "SELLER" | "BUYER";
};

export function AcceptTransferDialog({
    transferApplication,
    transferOffer,
    userBalance,
  open,
  onOpenChange,
  txMessage,
  txStatus,
  isSubmtting,
  onConfirm,
  accepter
}: AcceptTransferDialogProps) {
  const isSubmitting = Boolean(isSubmtting);
  const canRetry = txStatus !== "success";
  const userRemaining = userBalance.usdcBalance - transferApplication.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Bạn có chắc chắn muốn chấp nhận chuyển nhượng vay này 
          </DialogTitle>
          {/* <DialogDescription>
            Sau khi chấp nhận, bạn sẽ trở thành chủ mới của khoản vay.
          </DialogDescription> */}
        </DialogHeader>
        
        <div className="mt-3">
            {
                accepter == "BUYER" ?
                <BeforeAfterCard 
                    beforeLabel="Số dư hiện tại"
                    beforeValue={formatUsdc(userBalance.usdcBalance)}
                    changeLabel="Tiền mua chuyển nhượng"
                    changeValue={formatUsdc(transferApplication.price)}
                    afterLabel="Số dư sau khi cho vay"
                    afterValue={
                        userRemaining >= 0 ?
                        formatUsdc(userRemaining)
                        :
                        "Không đủ"
                    }
                    currency="USDC"
                    type="decrease"
                />
                :
                <BeforeAfterCard 
                    beforeLabel="Số dư hiện tại"
                    beforeValue={formatUsdc(userBalance.usdcBalance)}
                    changeLabel="Tiền nhận được sau chuyển nhượng"
                    changeValue={formatUsdc(transferApplication.price)}
                    afterLabel="Số dư sau khi nhận chuyển nhượng"
                    afterValue={formatUsdc(userBalance.usdcBalance + transferApplication.price)}
                    currency="USDC"
                    type="increase"
                 />
            }
        </div>

        <DialogFooter className=" bg-background text-foreground">
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
                onConfirm(accepter, transferOffer ? transferOffer.offerId : BigInt(0), transferApplication.transferId);
            }}
            disabled={isSubmitting || !canRetry || (accepter == "BUYER" && userRemaining < 0)}
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}