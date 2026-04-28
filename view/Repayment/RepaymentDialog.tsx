"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { shortAddress } from "@/components/shared/data-table";
import { useUserBalance } from "@/hooks/use-user-asset";
import type { LoanForRepayment } from "./types";
import { UserRepaymentLoanResponse } from "@/service/modules/repayment";

const repaymentSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số tiền")
    .refine((value) => !Number.isNaN(Number(value.replace(/,/g, "."))), "Số tiền không hợp lệ")
    .refine((value) => {
      try {
        parseUnits(value.replace(/,/g, "."), 6);
        return true;
      } catch {
        return false;
      }
    }, "Số tiền không hợp lệ")
    .refine((value) => Number(value.replace(/,/g, ".")) > 0, "Số tiền phải lớn hơn 0"),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;

type RepaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserRepaymentLoanResponse | null;
  onConfirm: (amount: string) => Promise<void> | void;
  isSubmitting?: boolean;
  txStatus?: "idle" | "success" | "error" | null;
  txMessage?: string | null;
};


export function RepaymentDialog({
  open,
  onOpenChange,
  loan,
  onConfirm,
  isSubmitting = false,
  txStatus = "idle",
  txMessage,
}: RepaymentDialogProps) {
  const { address } = useAccount();
  const { data: userBalance } = useUserBalance(address);

  const form = useForm<RepaymentFormValues>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { amount: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) {
      form.reset({ amount: "" });
    }
  }, [form, open]);

  if (!loan || !userBalance) return null;

  const amountRemainingUnits = loan.totalAmountHaveToPay - loan.amountPaid;
  const userBalanceUnits = userBalance.usdcBalance;

  const watchAmount = form.watch("amount");
  const normalizedWatchAmount = watchAmount.replace(/,/g, ".").trim();

  let balanceAfterRepayment: bigint | null = null;

  if (normalizedWatchAmount) {
    try {
      const amountUnits = parseUnits(normalizedWatchAmount, 6);

      if (amountUnits <= userBalanceUnits) {
        balanceAfterRepayment = userBalanceUnits - amountUnits;
      }
      else {
        balanceAfterRepayment = BigInt(0);
      }
    } catch {
      balanceAfterRepayment = null;
    }
  }

  const onSubmit = async (values: RepaymentFormValues) => {
    const normalizedAmount = values.amount.replace(/,/g, ".");
    const amountUnits = parseUnits(normalizedAmount, 6);

    if (amountUnits > amountRemainingUnits) {
      form.setError("amount", {
        message: "Số tiền vượt quá dư nợ còn lại",
      });
      return;
    }

    if (amountUnits > userBalanceUnits) {
      form.setError("amount", {
        message: "Số dư USDC không đủ",
      });
      return;
    }

    await onConfirm(normalizedAmount);
  };

  const applyQuickAmount = (amount: string) => {
    form.setValue("amount", amount, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trả vay</DialogTitle>
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
              <p className="mt-2 text-lg font-semibold text-foreground">{formatUnits(loan.loanAmount,6)} USDC</p>
              <p className="mt-1 text-xs text-muted-foreground">Tổng phải trả: {formatUnits(loan.totalAmountHaveToPay,6)} USDC</p>
            </div>
            <div className="rounded-xl border border-border bg-sidebar/80 p-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Đã thanh toán</Label>
              <p className="mt-2 text-lg font-semibold text-emerald-400">{formatUnits(loan.amountPaid,6)} USDC</p>
            </div>
            <div className="rounded-xl border border-border bg-sidebar/80 p-4">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dư nợ còn lại</Label>
              <p className="mt-2 text-lg font-semibold text-amber-300">{formatUnits(amountRemainingUnits,6)} USDC</p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-sidebar/80 p-4">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Số dư USDC của bạn</Label>
            <p className="mt-2 text-lg font-semibold text-foreground">{formatUnits(userBalanceUnits,6)} USDC</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {balanceAfterRepayment !== null
                ? `Số dư sau khi trả: ${formatUnits(balanceAfterRepayment, 6)} USDC`
                : "Nhập số tiền để xem số dư sau khi trả"}
            </p>
          </section>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền thanh toán</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0"
                        inputMode="decimal"
                        disabled={isSubmitting}
                        className="bg-background text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {quickAmounts.map((item) => (
                  <Button
                    key={item.percentage}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyQuickAmount(item.value)}
                    disabled={isSubmitting || repayableUnits === BigInt(0)}
                    className="text-xs"
                  >
                    {item.percentage}%
                  </Button>
                ))}
              </div> */}

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

              <DialogFooter className="pt-2  bg-background text-foreground ">
                <Button type="submit" disabled={isSubmitting || !watchAmount}>
                  {isSubmitting ? "Đang xử lý..." : "Trả vay"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}