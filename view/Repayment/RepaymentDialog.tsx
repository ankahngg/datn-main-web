"use client";

import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DetailCard } from "@/components/shared/DetailCard";
import { useUserBalance } from "@/hooks/use-user-asset";
import { formatUsdc } from "@/utils";
import { UserLoanResponse } from "@/model/Loan";
import BeforeAfterCard from "@/components/shared/BeforeAfterCard";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { UserBalance } from "@/model/User";
import clsx from "clsx";

const repaymentSchema = z.object({
  amount: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

type RepaymentFormValues = z.infer<typeof repaymentSchema>;

type RepaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserLoanResponse;
  userBalance: UserBalance;
  onConfirm: (amount: bigint) => Promise<void> | void;
  isSubmitting?: boolean;
  txStatus?: "idle" | "success" | "error" | null;
  txMessage?: string | null;
};

export function RepaymentDialog({
  open,
  onOpenChange,
  loan,
  userBalance,
  onConfirm,
  isSubmitting = false,
  txStatus = "idle",
  txMessage,
}: RepaymentDialogProps) {
  const { address } = useAccount();

  const form = useForm<z.input<typeof repaymentSchema>>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: { amount: 0 },
    mode: "onChange",
  });

  const amountRemainingUnits = loan.totalAmountHaveToPay - loan.amountPaid;
  const userUsdcBalance = userBalance.usdcBalance;

  
  const watchAmount = form.watch("amount");

  const amount = useMemo(() => {
    const parsed = repaymentSchema.shape.amount.safeParse(watchAmount);
    if (parsed.success) {
      return parsed.data;
    }
    return null;
  }, [watchAmount]);

  const remainingBalance = useMemo(() => {
    if (amount === null) return userUsdcBalance;
    const remaining =
      BigInt(userBalance.usdcBalance) - BigInt(parseUnits(amount.toString(), 6));
    return remaining;
  } 
  , [amount, userBalance.usdcBalance]);

  const remainingDebt = useMemo(() => {
    if (amount === null) return amountRemainingUnits;
    
    const remaining = BigInt(amountRemainingUnits) - BigInt(parseUnits(amount.toString(), 6));
    return remaining;
  }, [amount, amountRemainingUnits]);

  const submitDisabled = !form.formState.isValid || !!isSubmitting || amount === null || amount == 0;

  const onSubmit = async (data: z.output<typeof repaymentSchema>) => {
    const values = repaymentSchema.parse(data);

    const amountUnits = parseUnits(values.amount.toString(), 6);

    if (amountUnits > amountRemainingUnits) {
      form.setError("amount", {
        message: "Số tiền vượt quá dư nợ còn lại",
      });
      return;
    }

    if (amountUnits > userUsdcBalance) {
      form.setError("amount", {
        message: "Số dư USDC không đủ",
      });
      return;
    }

    await onConfirm(amountUnits);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Trả vay</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-3">
            <DetailCard
              className="col-span-3"
              label="Người cho vay"
              value={loan.lender}
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

          {/* <section>
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
          </section> */}

          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="space-y-4"
          >
            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Số tiền trả</FieldLabel>
                  <Input
                    {...field}
                    value={field.value as any}
                    onChange={
                      (e) => {
                        const value = e.target.value;
                        const result = repaymentSchema.shape.amount.safeParse(value);

                        if (result.success) {
                          field.onChange(value);
                        }
                      }
                    }

                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <BeforeAfterCard
              beforeLabel="Số dư hiện tại"
              beforeValue={formatUsdc(userUsdcBalance)}
              changeLabel="Số tiền trả vay"
              changeValue={amount || 0}
              afterLabel="Số dư sau khi trả vay"
              afterValue={
                remainingBalance < 0 ? "Không đủ" : formatUsdc(remainingBalance)
              }
              currency="USDC"
              type="decrease"
              afterLabel2="Dư nợ còn lại"
              afterValue2={
                remainingDebt < 0 ? "Quá dư nợ" : formatUsdc(remainingDebt)
              }
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

            <DialogFooter className="bg-background text-foreground">
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
                        <Button type="submit" disabled={submitDisabled} className="my-btn">
                          {isSubmitting ? "Đang xử lý..." : "Trả vay"}
                        </Button>
                      </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
