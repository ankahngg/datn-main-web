"use client";

import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { shortAddress } from "@/components/shared/data-table";
import { useUserBalance } from "@/hooks/use-user-asset";
import { UserRepaymentLoanResponse } from "@/service/modules/repayment";

type EndLoanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserRepaymentLoanResponse | null;
  onConfirm: () => Promise<void> | void;
  isSubmitting?: boolean;
  txStatus?: "idle" | "success" | "error" | null;
  txMessage?: string | null;
};

export function EndLoanDialog({
  open,
  onOpenChange,
  loan,
  onConfirm,
  isSubmitting = false,
  txStatus = "idle",
  txMessage,
}: EndLoanDialogProps) {
  const { address } = useAccount();
  const { data: userBalance } = useUserBalance(address);

  if (!loan) return null;

  const amountRemainingUnits = loan.totalAmountHaveToPay - loan.amountPaid;
  const userBalanceUnits = userBalance?.usdcBalance ?? BigInt(0);
  const hasEnoughBalance = userBalanceUnits >= amountRemainingUnits;
  const remainingBalanceAfterPaymentUnits = hasEnoughBalance
    ? userBalanceUnits - amountRemainingUnits
    : BigInt(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kết thúc khoản vay</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-sidebar/80 p-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Người cho vay</Label>
              <p className="mt-2 font-mono text-sm text-foreground">{shortAddress(loan.lender)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Khoản vay từ {loan.timeCreated}</p>
            </div>

            <div className="rounded-xl border border-border bg-sidebar/80 p-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Số tiền vay</Label>
              <p className="mt-2 text-lg font-semibold text-foreground">{formatUnits(loan.loanAmount, 6)} USDC</p>
              <p className="mt-1 text-xs text-muted-foreground">Tổng phải trả: {formatUnits(loan.totalAmountHaveToPay, 6)} USDC</p>
            </div>

            <div className="rounded-xl border border-border bg-sidebar/80 p-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Đã thanh toán</Label>
              <p className="mt-2 text-lg font-semibold text-emerald-400">{formatUnits(loan.amountPaid, 6)} USDC</p>
            </div>

            <div className="rounded-xl border border-border bg-sidebar/80 p-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dư nợ còn lại</Label>
              <p className="mt-2 text-lg font-semibold text-amber-300">{formatUnits(amountRemainingUnits, 6)} USDC</p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-sidebar/80 p-4">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Số tiền thanh toán khi kết thúc</Label>
            <p className="mt-2 text-lg font-semibold text-foreground">{formatUnits(amountRemainingUnits, 6)} USDC</p>
          </section>

          <section className="rounded-xl border border-border bg-sidebar/80 p-4">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Số dư USDC của bạn</Label>
            <p className="mt-2 text-lg font-semibold text-foreground">{formatUnits(userBalanceUnits, 6)} USDC</p>
            <p className="mt-1 text-sm text-foreground">
              Còn lại sau khi trả: {formatUnits(remainingBalanceAfterPaymentUnits, 6)} USDC
            </p>
            
          </section>

          {txStatus === "error" && txMessage && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {txMessage}
            </div>
          )}
          {txStatus === "success" && txMessage && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {txMessage}
            </div>
          )}

          <DialogFooter className="pt-2 bg-background text-foreground">
            <Button onClick={onConfirm} disabled={isSubmitting || !hasEnoughBalance} className="my-btn">
              {isSubmitting ? "Đang xử lý..." : "Kết thúc khoản vay"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}