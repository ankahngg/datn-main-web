"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { calEndDate, formatDate, formatUsdc, shortAddress } from "@/utils";

import { DetailCard } from "@/components/shared/DetailCard";
import { UserLoanResponse, UserLoanStatusLabelMap, UserLoanStatusVariantMap } from "@/model/Loan";

type RepaymentDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserLoanResponse | null;
};

export function RepaymentDetailsDialog({ open, onOpenChange, loan }: RepaymentDetailsDialogProps) {
  if (!loan) return null;

  const remainingUnits = BigInt(loan.totalAmountHaveToPay) - BigInt(loan.amountPaid);
    const endDate = calEndDate(loan.timeCreated, loan.duration);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết khoản vay</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-1">
            <DetailCard 
            
              label="Người vay"
              value={loan.borrower}
              valueClassName="font-mono"
            />
            <DetailCard
              label="Người cho vay"
              value={loan.lender}
              valueClassName="font-mono"
            />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DetailCard label="Số tiền vay" value={`${formatUsdc(loan.loanAmount)} USDC`} />
            <DetailCard label="Lãi suất" value={`${loan.interestRate}%`} />
            <DetailCard label="Thời hạn" value={`${loan.duration} tháng`} />
            <DetailCard label="Tổng phải trả" value={`${formatUsdc(loan.totalAmountHaveToPay)} USDC`} />
            <DetailCard
              label="Đã thanh toán"
              value={`${formatUsdc(loan.amountPaid)} USDC`}
              valueClassName="text-emerald-400"
            />
            <DetailCard
              label="Còn lại"
              value={`${formatUsdc(remainingUnits)} USDC`}
              valueClassName="text-amber-300"
            />
            <DetailCard label="Ngày tạo" value={formatDate(loan.timeCreated)} />
            <DetailCard label="Ngày đến hạn" value={formatDate(endDate)} />
          </section>

          <section className="rounded-xl border border-border bg-sidebar/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trạng thái khoản vay</p>
                <p className="mt-1 text-sm text-foreground">{UserLoanStatusLabelMap[loan.loanStatus]}</p>
              </div>
              <Badge variant={UserLoanStatusVariantMap[loan.loanStatus]}>
                {UserLoanStatusLabelMap[loan.loanStatus]}
              </Badge>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailCard label="ID" value={loan.id} />
              <DetailCard
                label="Loan ID"
                value={loan.loanId.toString()}
                valueClassName="font-mono"
              />
              <DetailCard
                label="Application ID"
                value={loan.applicationId.toString()}
                valueClassName="font-mono"
              />
              <DetailCard
                label="Offer ID"
                value={loan.offerId.toString()}
                valueClassName="font-mono"
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <DetailCard label="Thanh toán lúc" value={formatDate(loan.timePaid)} />
              <DetailCard label="Đấu giá lúc" value={formatDate(loan.timeAuction)} />
              <DetailCard label="Thanh lý lúc" value={formatDate(loan.timeLiquidated)} />
            </div>
          </section>
        </div>

        <DialogFooter className=" bg-background text-foreground ">
          <Button className="my-btn" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}