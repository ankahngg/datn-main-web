"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DetailCard } from "@/components/shared/DetailCard";
import { useUserBalance } from "@/hooks/use-user-asset";
import { UserLoanResponse } from "@/service/modules/loan";
import { formatUsdc, shortAddress } from "@/utils";

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
  loan: UserLoanResponse | null;
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
      if (amountUnits <= userBalanceUnits) balanceAfterRepayment = userBalanceUnits - amountUnits;
      else balanceAfterRepayment = BigInt(0);
      
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trả vay</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2">
            <DetailCard
              label="Người cho vay"
              value={shortAddress(loan.lender)}
              valueClassName="font-mono"
              helperText={`Khoản vay từ ${loan.timeCreated}`}
            />
            <DetailCard
              label="Số tiền vay"
              value={`${formatUsdc(loan.loanAmount)} USDC`}
          
              helperText={`Tổng phải trả: ${formatUsdc(loan.totalAmountHaveToPay)} USDC`}
            />
            <DetailCard
              label="Đã thanh toán"
              value={`${formatUsdc(loan.amountPaid)} USDC`}
              valueClassName="text-emerald-400"
            />
            <DetailCard
              label="Dư nợ còn lại"
              value={`${formatUsdc(amountRemainingUnits)} USDC`}
              valueClassName="text-amber-300"
            />
          </section>

          <section>
            <DetailCard
              label="Số dư USDC của bạn"
              value={`${formatUsdc(userBalanceUnits)} USDC`}
              valueClassName="text-lg font-semibold"
              helperText={
                balanceAfterRepayment !== null
                  ? `Số dư sau khi trả: ${formatUsdc(balanceAfterRepayment)} USDC`
                  : "Nhập số tiền để xem số dư sau khi trả"
              }
              helperClassName="text-sm"
            />
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