"use client"

import { useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { HandCoins } from "lucide-react"
import { useForm } from "react-hook-form"

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
import { LoanApplicationSubmitValues } from "@/model/LoanApplication"
import { UserNft } from "@/model/User"



const quickPercentages = [25, 50, 100]

function createLoanApplicationSchema() {
  return z
    .object({
      collateralAsset: z.enum(["ETH", "NFT"], {
        message: "Vui lòng chọn tài sản thế chấp",
      }),
      collateralAmount: z
        .string()
        .trim()
        .optional(),
      selectedNftId: z.string().trim().optional(),
      loanAmountUsdc: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập số USDC muốn vay")
        .refine((value) => Number.isFinite(Number(value.replace(/,/g, "."))), {
          message: "Số USDC không hợp lệ",
        })
        .refine((value) => Number(value.replace(/,/g, ".")) > 0, {
          message: "Số USDC muốn vay phải lớn hơn 0",
        }),
      monthlyInterestRate: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập lãi suất theo tháng")
        .refine((value) => Number.isFinite(Number(value.replace(/,/g, "."))), {
          message: "Lãi suất không hợp lệ",
        })
        .refine((value) => Number(value.replace(/,/g, ".")) >= 0, {
          message: "Lãi suất không được âm",
        }),
      loanTermMonths: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập kỳ hạn")
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
    .superRefine((values, ctx) => {
      if (values.collateralAsset === "ETH") {
        if (!values.collateralAmount?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Vui lòng nhập số ETH thế chấp",
            path: ["collateralAmount"],
          })
          return
        }

        const collateralAmount = Number(values.collateralAmount.replace(/,/g, "."))
        if (!Number.isFinite(collateralAmount) || collateralAmount <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Số ETH thế chấp phải lớn hơn 0",
            path: ["collateralAmount"],
          })
        }
      }

      if (values.collateralAsset === "NFT" && !values.selectedNftId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vui lòng chọn NFT thế chấp",
          path: ["selectedNftId"],
        })
      }
    })
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 4,
  }).format(value)
}

function parseDecimalInput(value: string | undefined) {
  const parsed = Number((value ?? "").replace(/,/g, "."))
  return Number.isFinite(parsed) ? parsed : 0
}



type LoanApplicationFormValues = z.infer<ReturnType<typeof createLoanApplicationSchema>>

type LoanApplicationDialogProps = {
  onSubmitApplication: (values: LoanApplicationSubmitValues) => void
  availableNfts: UserNft[]
  ethBalance: number
  isSubmitting?: boolean
  txStatus?: "idle" | "success" | "error" | null
  txMessage?: string | null
  onResetStatus?: () => void
}

export function LoanApplicationDialog({
  onSubmitApplication,
  availableNfts,
  ethBalance,
  isSubmitting,
  txStatus,
  txMessage,
  onResetStatus,
}: LoanApplicationDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loanApplicationSchema = useMemo(() => createLoanApplicationSchema(), [])

  const form = useForm<LoanApplicationFormValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      collateralAsset: "ETH",
      collateralAmount: "",
      selectedNftId: "",
      loanAmountUsdc: "",
      monthlyInterestRate: "",
      loanTermMonths: "",
    },
    mode: "onChange",
  })

  const collateralAsset = form.watch("collateralAsset")
  const collateralAmountInput = form.watch("collateralAmount")
  const loanAmountUsdcInput = form.watch("loanAmountUsdc")
  const monthlyInterestRateInput = form.watch("monthlyInterestRate")
  const loanTermMonthsInput = form.watch("loanTermMonths")

  const collateralAmount = parseDecimalInput(collateralAmountInput)
  const principalAmount = parseDecimalInput(loanAmountUsdcInput)
  const monthlyInterestRate = parseDecimalInput(monthlyInterestRateInput)
  const loanTermMonths = parseDecimalInput(loanTermMonthsInput)
  const totalRepayment =
    principalAmount + principalAmount * (monthlyInterestRate / 100) * loanTermMonths
  const remainingEth = Math.max(ethBalance - collateralAmount, 0)

  const submitDisabled = !form.formState.isValid || !!isSubmitting

  function applyEthPercentage(percent: number) {
    const nextAmount = (ethBalance * percent) / 100
    form.setValue("collateralAmount", nextAmount.toFixed(4).replace(/\.0+$/, ""), {
      shouldValidate: true,
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsModalOpen(nextOpen)
    if (!nextOpen) {
      form.reset({
        collateralAsset: "ETH",
        collateralAmount: "",
        selectedNftId: "",
        loanAmountUsdc: "",
        monthlyInterestRate: "",
        loanTermMonths: "",
      })
      onResetStatus?.()
    }
  }

  function onSubmit(data: LoanApplicationFormValues) {
    const normalizedCollateralAmount =
      data.collateralAsset === "NFT"
        ? 1
        : Number(data.collateralAmount?.replace(/,/g, ".") ?? 0)
    const normalizedLoanAmountUsdc = Number(data.loanAmountUsdc.replace(/,/g, "."))
    const normalizedMonthlyRate = Number(data.monthlyInterestRate.replace(/,/g, "."))
    const normalizedLoanTermMonths = Number(data.loanTermMonths.replace(/,/g, "."))

    if (data.collateralAsset === "ETH" && normalizedCollateralAmount > ethBalance) {
      form.setError("collateralAmount", {
        type: "manual",
        message: "Số ETH thế chấp vượt quá số dư hiện có",
      })
      return
    }

    const selectedNft = availableNfts.find((nft) => String(nft.id) === data.selectedNftId)
    if (data.collateralAsset === "NFT" && !selectedNft) {
      form.setError("selectedNftId", {
        type: "manual",
        message: "NFT không hợp lệ hoặc đã được rút",
      })
      return
    }

    const repayment =
      normalizedLoanAmountUsdc +
      normalizedLoanAmountUsdc * (normalizedMonthlyRate / 100) * normalizedLoanTermMonths

    onSubmitApplication({
      collateralAsset: data.collateralAsset,
      collateralAmount: normalizedCollateralAmount,
      selectedNftId: selectedNft?.id,
      selectedNftAddress: selectedNft?.nftAddress,
      selectedNftTokenId: selectedNft?.tokenId,
      selectedNftName: selectedNft?.name,
      loanAmountUsdc: normalizedLoanAmountUsdc,
      monthlyInterestRate: normalizedMonthlyRate,
      loanTermMonths: normalizedLoanTermMonths,
      totalRepayment: repayment,
    })
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="my-btn ">
          <HandCoins className="size-4" />
          Tạo đơn vay
        </Button>
      </DialogTrigger>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Tạo đơn vay mới</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Chọn loại tài sản thế chấp và điều kiện khoản vay của bạn.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="collateralAsset"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-zinc-300">Loại tài sản thế chấp</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      if (value === "ETH") {
                        form.setValue("selectedNftId", "", { shouldValidate: true })
                        return
                      }

                      form.setValue("collateralAmount", "", { shouldValidate: true })
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 w-full border-muted-foreground bg-background text-foreground">
                        <SelectValue placeholder="Chọn tài sản" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      className="border-muted-foreground bg-background/90 text-foreground"
                    >
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="NFT">NFT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {collateralAsset === "ETH" ? (
              <>
                <FormField
                  control={form.control}
                  name="collateralAmount"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-zinc-300">Số lượng ETH thế chấp</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập số lượng ETH"
                          type="text"
                          inputMode="decimal"
                          className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-muted-foreground/40 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    Số ETH hiện có: {formatAmount(ethBalance)} ETH
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    ETH còn lại sau thế chấp: {formatAmount(remainingEth)} ETH
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {quickPercentages.map((percent) => (
                    <Button
                      key={percent}
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => applyEthPercentage(percent)}
                      className="border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                    >
                      {percent}% ETH
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <FormField
                control={form.control}
                name="selectedNftId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Chọn NFT thế chấp</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9 w-full border-muted-foreground bg-background text-foreground">
                          <SelectValue placeholder="Chọn NFT" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          className="border-muted-foreground bg-background/90 text-foreground"
                        >
                          {availableNfts.map((nft) => (
                            <SelectItem key={nft.id} value={String(nft.id)}>
                              {nft.name} - #{nft.tokenId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {availableNfts.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Không có NFT hợp lệ để thế chấp
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="loanAmountUsdc"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Số lượng USDC muốn vay</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nhập số USDC"
                        type="text"
                        inputMode="decimal"
                        className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthlyInterestRate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Lãi vay theo tháng (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ví dụ 5"
                        type="text"
                        inputMode="decimal"
                        className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="loanTermMonths"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-zinc-300">Kỳ hạn vay (tháng)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nhập số tháng"
                      type="text"
                      inputMode="numeric"
                      className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
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
                Lãi đơn: {formatAmount(principalAmount * (monthlyInterestRate / 100) * loanTermMonths)} USDC
              </p>
              <p className="text-sm font-medium text-foreground">
                Tổng tiền phải trả: {formatAmount(totalRepayment)} USDC
              </p>
            </div>

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
  )
}
