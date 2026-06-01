"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HandCoins } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import clsx from "clsx";
import { LoanOfferSubmitValues } from "@/model/LoanOffer";
import { UserBalance, UserBalanceResponse } from "@/model/User";
import { LoanApplication } from "@/model/LoanApplication";
import { formatUsdc } from "@/utils";
import { parseUnits } from "viem";

function createLoanRequestSchema() {
  return z.object({
    loanAmount: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập số tiền đề nghị")
      .refine((value) => Number.isFinite(Number(value.replace(/,/g, "."))), {
        message: "Số tiền không hợp lệ",
      })
      .refine((value) => Number(value.replace(/,/g, ".")) > 0, {
        message: "Số tiền phải lớn hơn 0",
      }),
    interestRate: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập lãi suất đề nghị")
      .refine((value) => Number.isFinite(Number(value.replace(/,/g, "."))), {
        message: "Lãi suất không hợp lệ",
      })
      .refine((value) => Number(value.replace(/,/g, ".")) >= 0, {
        message: "Lãi suất phải >= 0",
      }),
    loanTerm: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập kỳ hạn vay")
      .refine((value) => Number.isFinite(Number(value.replace(/,/g, "."))), {
        message: "Kỳ hạn không hợp lệ",
      })
      .refine((value) => Number.isInteger(Number(value.replace(/,/g, "."))), {
        message: "Kỳ hạn phải là số nguyên",
      })
      .refine((value) => Number(value.replace(/,/g, ".")) >= 1, {
        message: "Kỳ hạn phải tối thiểu 1 tháng",
      }),
  });
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(value);
}

function parseDecimalInput(value: string | undefined) {
  const parsed = Number((value ?? "").replace(/,/g, "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

type LoanRequestFormValues = z.infer<
  ReturnType<typeof createLoanRequestSchema>
>;

type LoanRequestDialogProps = {
  loanApplication: LoanApplication;
  triggerLabel?: string;
  userBalance: UserBalance;
  onSubmitRequest: (values: LoanOfferSubmitValues) => void;
  isSubmitting?: boolean;
  txStatus?: "idle" | "success" | "error" | null;
  txMessage?: string | null;
  onResetStatus?: () => void;
  enableButton: boolean;
};

export function LoanRequestDialog({
  userBalance,
  loanApplication,
  triggerLabel,
  onSubmitRequest,
  isSubmitting,
  txStatus,
  txMessage,
  onResetStatus,
  enableButton = true,
}: LoanRequestDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address } = useAccount();

  const loanRequestSchema = useMemo(() => createLoanRequestSchema(), []);

  const form = useForm<LoanRequestFormValues>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      loanAmount: "",
      interestRate: "",
      loanTerm: "",
    },
    mode: "onChange",
  });

  const submitDisabled = !form.formState.isValid || !!isSubmitting;
  const loanAmountInput = form.watch("loanAmount");
  const interestRateInput = form.watch("interestRate");
  const loanTermInput = form.watch("loanTerm");

  const principalAmount = parseDecimalInput(loanAmountInput);
  const monthlyInterestRate = parseDecimalInput(interestRateInput);
  const loanTermMonths = parseDecimalInput(loanTermInput);
  const interestAmount =
    principalAmount * (monthlyInterestRate / 100) * loanTermMonths;
  const totalRepayment = principalAmount + interestAmount;

  const loanId = loanApplication.id;
  console.log("User Balance in Dialog:", userBalance);
  console.log("User address:", userBalance.ethBalance);

  function handleOpenChange(nextOpen: boolean) {
    setIsModalOpen(nextOpen);
    if (!nextOpen) {
      form.reset();
      onResetStatus?.();
    }
  }

  function onSubmit(data: LoanRequestFormValues) {
    onSubmitRequest({
      loanId,
      loanAmount: Number(data.loanAmount.replace(/,/g, ".")),
      interestRate: Number(data.interestRate.replace(/,/g, ".")),
      loanTerm: data.loanTerm,
    });
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      {enableButton && (
        <div className="flex flex-wrap">
          <DialogTrigger asChild>
            <Button className="my-btn bg-blue-700 text-blue-50 hover:bg-blue-700/70">
              <HandCoins className="size-4" />
              {triggerLabel ?? "Tạo đề nghị vay"}
            </Button>
          </DialogTrigger>
        </div>
      )}
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Tạo đề nghị vay mới
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Offer này sẽ được gắn với đơn vay #{loanId}
          </DialogDescription>
          {loanApplication.borrower != userBalance.userWalletAddress && (
            <DialogDescription className="red-text">
              <p>1. Để tạo đề nghị vay bạn cần ứng trước số tiền</p>
              <p>2. Khi đề nghị được chấp nhận bạn không cần phải trả nữa,</p>
              <p>3. Bạn có thể lấy lại số tiền bằng cách hủy đề nghị</p>
            </DialogDescription>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div className="flex flex-col gap-2">
              <p className="font-medium text-foreground italic">
                Loan Application Id : {loanId}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-zinc-300">
                Người tạo đề nghị vay
              </p>
              <Input
                value={userBalance.userWalletAddress}
                className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">
                      Số tiền cho vay
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số tiền cho vay"
                        type="text"
                        inputMode="decimal"
                        className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">
                      Lãi suất theo tháng (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập lãi suất theo tháng"
                        type="text"
                        inputMode="decimal"
                        className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="loanTerm"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-zinc-300">
                    Thời hạn (tháng)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: 12"
                      type="text"
                      inputMode="numeric"
                      className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border border-muted-foreground/40 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">
                Gốc: {formatAmount(principalAmount)} USDC
              </p>
              <p className="text-xs text-muted-foreground">
                Lãi dự kiến: {formatAmount(interestAmount)} USDC
              </p>
              <p className="text-sm font-medium text-foreground">
                Tổng tiền phải trả: {formatAmount(totalRepayment)} USDC
              </p>
            </div>
            {loanApplication.borrower != userBalance.userWalletAddress && (
              <div className="rounded-lg border border-red-400 bg-background/40 p-3">
                <p className="text-xs text-muted-foreground">
                  Số dư hiện tại: {formatUsdc(userBalance.usdcBalance)} USDC
                </p>
                <p className="text-xs text-muted-foreground">
                  Số tiền phải trả để tạo Offer: {principalAmount} USDC
                </p>
                <p className="text-sm font-medium text-foreground">
                  Số dư còn lại:{" "}
                  {formatUsdc(
                    BigInt(userBalance.usdcBalance) -
                      BigInt(parseUnits(loanAmountInput, 6)),
                  )}{" "}
                  USDC
                </p>
              </div>
            )}

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
                type="submit"
                disabled={submitDisabled}
                className="my-btn"
              >
                {isSubmitting ? "Đang xử lý..." : "Tạo đơn vay"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
