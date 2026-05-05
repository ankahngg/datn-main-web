"use client";

import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DetailCard } from "@/components/shared/DetailCard";
import { useUserBalance } from "@/hooks/use-user-asset";

import { shortAddress } from "@/utils";
import { UserLoanResponse } from "@/model/Loan";

type EndLoanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserLoanResponse | null;
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
            <DetailCard
              label="Người cho vay"
              value={shortAddress(loan.lender)}
              valueClassName="font-mono text-sm"
              helperText={`Khoản vay từ ${loan.timeCreated}`}
            />

            <DetailCard
              label="Số tiền vay"
              value={`${formatUnits(loan.loanAmount, 6)} USDC`}
              valueClassName="text-lg font-semibold"
              helperText={`Tổng phải trả: ${formatUnits(loan.totalAmountHaveToPay, 6)} USDC`}
            />

            <DetailCard
              label="Đã thanh toán"
              value={`${formatUnits(loan.amountPaid, 6)} USDC`}
              valueClassName="text-lg font-semibold text-emerald-400"
            />

            <DetailCard
              label="Dư nợ còn lại"
              value={`${formatUnits(amountRemainingUnits, 6)} USDC`}
              valueClassName="text-lg font-semibold text-amber-300"
            />
          </section>

          <section>
            <DetailCard
              label="Số tiền thanh toán khi kết thúc"
              value={`${formatUnits(amountRemainingUnits, 6)} USDC`}
              valueClassName="text-lg font-semibold"
            />
          </section>

          <section>
            <DetailCard
              label="Số dư USDC của bạn"
              value={`${formatUnits(userBalanceUnits, 6)} USDC`}
              valueClassName="text-lg font-semibold"
              helperText={`Còn lại sau khi trả: ${formatUnits(remainingBalanceAfterPaymentUnits, 6)} USDC`}
              helperClassName="text-sm"
            />
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