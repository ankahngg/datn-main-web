"use client";

import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DetailCard } from "@/components/shared/DetailCard";
import { useUserBalance } from "@/hooks/use-user-asset";

import { shortAddress } from "@/utils";
import { UserLoanResponse } from "@/model/Loan";
import BeforeAfterCard from "@/components/shared/BeforeAfterCard";
import clsx from "clsx";

type EndLoanDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserLoanResponse | null;
  onConfirm: (amount: bigint) => void | Promise<void>;
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
  const remainingBalanceAfterPaymentUnits =
    userBalanceUnits - amountRemainingUnits;

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
            <BeforeAfterCard
              beforeLabel="Số dư USDC của bạn"
              beforeValue={`${formatUnits(userBalanceUnits, 6)}`}
              changeLabel="Số USDC phải trả"
              changeValue={`${formatUnits(amountRemainingUnits, 6)}`}
              type="decrease"
              afterLabel="Số dư USDC còn lại "
              afterValue={
                remainingBalanceAfterPaymentUnits < 0
                  ? "Không đủ"
                  : `${formatUnits(remainingBalanceAfterPaymentUnits, 6)}`
              }
              currency="USDC"
            />
          </section>

          <DialogFooter className="pt-2 bg-background text-foreground">
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
              onClick={() => onConfirm(amountRemainingUnits)}
              disabled={isSubmitting}
              className="my-btn"
            >
              {isSubmitting ? "Đang xử lý..." : "Kết thúc khoản vay"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
