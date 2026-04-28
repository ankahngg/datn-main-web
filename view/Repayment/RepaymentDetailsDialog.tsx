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
import { Label } from "@/components/ui/label";
import { shortAddress } from "@/components/shared/data-table";
import { formatUnits, parseUnits } from "viem";
import { loanStatusLabelMap, loanStatusVariantMap } from "./types";
import { calEndDate, formatDate, formatUsdc } from "@/utils";
import { UserRepaymentLoanResponse } from "@/service/modules/repayment";
import { DetailCard } from "@/components/shared/DetailCard";

type RepaymentDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserRepaymentLoanResponse | null;
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
          <section className="grid gap-4 md:grid-cols-2">
            {DetailCard({ label: "Người vay", value: <span className="font-mono">{shortAddress(loan.borrower)}</span> })}
            {DetailCard({ label: "Người cho vay", value: <span className="font-mono">{shortAddress(loan.lender)}</span> })}
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {DetailCard({ label: "Số tiền vay", value: `${formatUsdc(loan.loanAmount)} USDC` })}
            {DetailCard({ label: "Lãi suất", value: `${loan.interestRate}%` })}
            {DetailCard({ label: "Thời hạn", value: `${loan.duration} tháng` })}
            {DetailCard({ label: "Tổng phải trả", value: `${formatUsdc(loan.totalAmountHaveToPay)} USDC` })}
            {DetailCard({ label: "Đã thanh toán", value: <span className="text-emerald-400">{formatUsdc(loan.amountPaid)} USDC</span> })}
            {DetailCard({ label: "Còn lại", value: <span className="text-amber-300">{formatUsdc(remainingUnits)} USDC</span> })}
            {DetailCard({ label: "Ngày tạo", value: formatDate(loan.timeCreated) })}
            {DetailCard({ label: "Ngày đến hạn", value: formatDate(endDate) })}
          </section>

          <section className="rounded-xl border border-border bg-sidebar/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Trạng thái khoản vay</p>
                <p className="mt-1 text-sm text-foreground">{loanStatusLabelMap[loan.loanStatus]}</p>
              </div>
              <Badge variant={loanStatusVariantMap[loan.loanStatus]}>
                {loanStatusLabelMap[loan.loanStatus]}
              </Badge>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {DetailCard({ label: "ID", value: loan.id })}
              {DetailCard({ label: "Loan ID", value: <span className="font-mono">{loan.loanId.toString()}</span> })}
              {DetailCard({ label: "Application ID", value: <span className="font-mono">{loan.applicationId.toString()}</span> })}
              {DetailCard({ label: "Offer ID", value: <span className="font-mono">{loan.offerId.toString()}</span> })}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {DetailCard({ label: "Thanh toán lúc", value: formatDate(loan.timePaid) })}
              {DetailCard({ label: "Đấu giá lúc", value: formatDate(loan.timeAuction) })}
              {DetailCard({ label: "Thanh lý lúc", value: formatDate(loan.timeLiquidated) })}
            </div>
          </section>
        </div>

        <DialogFooter className=" bg-background text-foreground ">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}