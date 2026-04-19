"use client"

import { useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { HandCoins } from "lucide-react"
import { useForm } from "react-hook-form"
import { useAccount } from "wagmi"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import clsx from "clsx"

import type { LoanOfferSubmitValues, LoanOfferType } from "./types"

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
  })
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(value)
}

function parseDecimalInput(value: string | undefined) {
  const parsed = Number((value ?? "").replace(/,/g, "."))
  return Number.isFinite(parsed) ? parsed : 0
}

type LoanRequestFormValues = z.infer<ReturnType<typeof createLoanRequestSchema>>

type LoanRequestDialogProps = {
  loanId: number
  offerType: LoanOfferType
  triggerLabel?: string
  onSubmitRequest: (values: LoanOfferSubmitValues) => void
  isSubmitting?: boolean
  txStatus?: "idle" | "success" | "error" | null
  txMessage?: string | null
  onResetStatus?: () => void
  enableButton: boolean
}

export function LoanRequestDialog({
  loanId,
  offerType,
  triggerLabel,
  onSubmitRequest,
  isSubmitting,
  txStatus,
  txMessage,
  onResetStatus,
  enableButton = true,
}: LoanRequestDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address } = useAccount()

  const loanRequestSchema = useMemo(() => createLoanRequestSchema(), [])

  const form = useForm<LoanRequestFormValues>({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: {
      loanAmount: "",
      interestRate: "",
      loanTerm: "",
    },
    mode: "onChange",
  })

  const submitDisabled = !form.formState.isValid || !!isSubmitting
  const loanAmountInput = form.watch("loanAmount")
  const interestRateInput = form.watch("interestRate")
  const loanTermInput = form.watch("loanTerm")

  const principalAmount = parseDecimalInput(loanAmountInput)
  const monthlyInterestRate = parseDecimalInput(interestRateInput)
  const loanTermMonths = parseDecimalInput(loanTermInput)
  const interestAmount = principalAmount * (monthlyInterestRate / 100) * loanTermMonths
  const totalRepayment = principalAmount + interestAmount
  const currentUser = address ?? "Chưa kết nối ví"

  function handleOpenChange(nextOpen: boolean) {
    setIsModalOpen(nextOpen)
    if (!nextOpen) {
      form.reset()
      onResetStatus?.()
    }
  }

  function onSubmit(data: LoanRequestFormValues) {
    onSubmitRequest({
      loanId,
      offerType,
      loanAmount: Number(data.loanAmount.replace(/,/g, ".")),
      interestRate: Number(data.interestRate.replace(/,/g, ".")),
      loanTerm: data.loanTerm,
    })
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
          <DialogTitle className="text-zinc-100">Tạo đề nghị vay mới</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Offer này sẽ được gắn với đơn vay #{loanId} theo nhóm {offerType.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-foreground italic">Loan Application Id : {loanId}</p>
              
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-zinc-300">Người tạo đề nghị vay</p>
              <Input
                value={currentUser}
                
                className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-zinc-300">Loại offer</p>
              <Select value={offerType} disabled>
                <SelectTrigger className="h-9 w-full border-muted-foreground bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-muted-foreground bg-background/90 text-foreground">
                  <SelectItem value="Offer của người tạo đơn">Offer của người tạo đơn</SelectItem>
                  <SelectItem value="Offer của người cho vay">Offer của người cho vay</SelectItem>
                </SelectContent>
              </Select>
            </div>

           <div className="grid gap-4 sm:grid-cols-2">

              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Số tiền cho vay</FormLabel>
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
                    <FormLabel className="text-zinc-300">Lãi suất theo tháng (%)</FormLabel>
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
                  <FormLabel className="text-zinc-300">Thời hạn (tháng)</FormLabel>
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
              <p className="text-xs text-muted-foreground">Gốc: {formatAmount(principalAmount)} USDC</p>
              <p className="text-xs text-muted-foreground">Lãi dự kiến: {formatAmount(interestAmount)} USDC</p>
              <p className="text-sm font-medium text-foreground">
                Tổng tiền phải trả: {formatAmount(totalRepayment)} USDC
              </p>
            </div>

            {txStatus && (
              <div
                className={clsx(
                  "rounded-lg border px-3 py-2 text-sm",
                  txStatus === "success"
                    ? "border-green-500/40 bg-green-500/10 text-green-300"
                    : "border-red-500/40 bg-red-500/10 text-red-300",
                )}
              >
                {txMessage}
              </div>
            )}

            <DialogFooter className="pt-3 bg-background text-foreground">
              <Button
                type="submit"
                disabled={submitDisabled}
                className="my-btn"
              >
                {isSubmitting ? "Đang xử lý..." : "Gửi đề nghị"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
