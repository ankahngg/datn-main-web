"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"
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

import type { AssetTransferSubmitValues, NftDeposit } from "./types"
import type { AssetBalance } from "./types"
import clsx from "clsx"

const quickPercentages = [25, 50, 100]

function createAssetTransferSchema() {
  return z
    .object({
      action: z.enum(["Gửi", "Rút"]),
      asset: z.enum(["ETH", "USDC", "NFT"]),
      amount: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập số lượng")
        .refine((value) => Number.isFinite(Number(value.replace(/,/g, "."))), {
          message: "Số lượng không hợp lệ",
        })
        .refine((value) => Number(value.replace(/,/g, ".")) > 0, {
          message: "Số lượng phải lớn hơn 0",
        }),
      nftName: z.string().optional(),
      nftDescription: z.string().optional(),
      nftAddress: z.string().optional(),
      tokenId: z.string().optional(),
      withdrawNftId: z.string().optional(),
    })
}

type AssetTransferFormValues = z.infer<ReturnType<typeof createAssetTransferSchema>>

type AssetTransferDialogProps = {
  balances: AssetBalance[]
  availableNfts: NftDeposit[]
  onSubmitTransfer: (values: AssetTransferSubmitValues) => void
  isSubmitting?: boolean
  txStatus?: "idle" | "success" | "error" | null
  txMessage?: string | null
  onResetStatus?: () => void
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(value)
}

export function AssetTransferDialog({
  balances,
  availableNfts,
  onSubmitTransfer,
  isSubmitting,
  txStatus,
  txMessage,
  onResetStatus,
}: AssetTransferDialogProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const assetTransferSchema = useMemo(() => createAssetTransferSchema(), [])

  const form = useForm<AssetTransferFormValues>({
    resolver: zodResolver(assetTransferSchema),
    defaultValues: {
      action: "Gửi",
      asset: "ETH",
      amount: "",
      nftName: "",
      nftDescription: "",
      nftAddress: "",
      tokenId: "",
      withdrawNftId: "",
    },
    mode: "onChange",
  })

  const action = form.watch("action")
  const selectedAsset = form.watch("asset")
  const amountInput = form.watch("amount")

  const currentBalance = Number(
    balances.find((asset) => asset.symbol === selectedAsset)?.amount ?? '0'
  )

  const parsedAmount = Number(amountInput.replace(/,/g, "."))
  const effectiveAmount = selectedAsset === "NFT" ? 1 : parsedAmount
  const nextBalance = Number.isFinite(effectiveAmount)
    ? action === "Gửi"
      ? currentBalance + effectiveAmount
      : currentBalance - effectiveAmount
    : currentBalance

  useEffect(() => {
    if (selectedAsset === "NFT") {
      form.setValue("amount", "1", { shouldValidate: true })
    }
  }, [form, selectedAsset])

  const submitDisabled = !form.formState.isValid || !!isSubmitting

  function applyPercentage(percent: number) {
    const nextAmount = (currentBalance * percent) / 100
    if (selectedAsset === "NFT") {
      form.setValue("amount", String(Math.floor(nextAmount)), { shouldValidate: true })
      return
    }

    form.setValue("amount", nextAmount.toFixed(3).replace(/\.0+$/, ""), {
      shouldValidate: true,
    })
  }

  function handleOpenChange(nextOpen: boolean) {
    setIsModalOpen(nextOpen)
    if (!nextOpen) {
      form.reset({
        action: "Gửi",
        asset: "ETH",
        amount: "",
        nftName: "",
        nftDescription: "",
        nftAddress: "",
        tokenId: "",
        withdrawNftId: "",
      })
      if (onResetStatus) {
        onResetStatus()
      }
    }
  }

  function onSubmit(values: AssetTransferFormValues) {
    const amount = values.asset === "NFT" ? 1 : Number(values.amount.replace(/,/g, "."))

    if (values.asset === "NFT" && values.action === "Gửi") {
      if (!values.nftName?.trim()) {
        form.setError("nftName", {
          type: "manual",
          message: "Vui lòng nhập tên tài sản",
        })
        return
      }

      if (!values.nftAddress?.trim()) {
        form.setError("nftAddress", {
          type: "manual",
          message: "Vui lòng nhập NFT address",
        })
        return
      }

      if (!values.tokenId?.trim()) {
        form.setError("tokenId", {
          type: "manual",
          message: "Vui lòng nhập Token ID",
        })
        return
      }
    }

    if (values.asset === "NFT" && values.action === "Rút" && !values.withdrawNftId) {
      form.setError("withdrawNftId", {
        type: "manual",
        message: "Vui lòng chọn NFT muốn rút",
      })
      return
    }

    if (values.asset === "NFT" && !Number.isInteger(amount)) {
      form.setError("amount", {
        type: "manual",
        message: "NFT chỉ hỗ trợ số nguyên",
      })
      return
    }

    const selectedBalance =
      Number(balances.find((asset) => asset.symbol === values.asset)?.amount ?? 0)

    if (values.action === "Rút" && amount > selectedBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Số lượng rút đang vượt quá tài sản hiện có",
      })
      return
    }

    onSubmitTransfer({
      action: values.action,
      asset: values.asset,
      amount,
      nftName: values.asset === "NFT" && values.action === "Gửi" ? values.nftName?.trim() : undefined,
      nftDescription:
        values.asset === "NFT" && values.action === "Gửi"
          ? values.nftDescription?.trim() || undefined
          : undefined,
      nftAddress: values.asset === "NFT" && values.action === "Gửi" ? values.nftAddress?.trim() : undefined,
      tokenId: values.asset === "NFT" && values.action === "Gửi" ? values.tokenId?.trim() : undefined,
      withdrawNftId: values.asset === "NFT" && values.action === "Rút" ? values.withdrawNftId : undefined,
    })
    // handleOpenChange(false)
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

      {/* //// DialogTrigger //// */}
      <div className="flex flex-wrap gap-2">
        <DialogTrigger asChild>
          <Button
            type="button"
            onClick={() => form.setValue("action", "Gửi", { shouldValidate: true })}
            className="bg-green-700 text-green-50 hover:bg-green-700/60"
          >
            <ArrowDownCircle className="size-4" />
            Gửi tài sản
          </Button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/60"
            onClick={() => form.setValue("action", "Rút", { shouldValidate: true })}
          >
            <ArrowUpCircle className="size-4" />
            Rút tài sản
          </Button>
        </DialogTrigger>
      </div>


    {/* //// DialogContent //// */}
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">{action} tài sản</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Chọn loại tài sản và số lượng muốn {action.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 pt-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Tài sản</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9 w-full border-muted-foreground bg-background text-foreground">
                          <SelectValue placeholder="Chọn tài sản" />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          className="border-muted-foreground bg-background/90 text-foreground"
                        >
                        {balances.map((asset) => (
                          <SelectItem
                            key={asset.symbol}
                            value={asset.symbol}
                          >
                            {asset.symbol} - {asset.name}
                          </SelectItem>
                        ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Số lượng</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step={selectedAsset === "NFT" ? "1" : "0.001"}
                        placeholder="Nhập số lượng"
                        className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        disabled={selectedAsset === "NFT"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedAsset === "NFT" && action === "Gửi" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nftName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:col-span-2">
                      <FormLabel className="text-zinc-300">Tên tài sản</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập tên NFT"
                          className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nftAddress"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-zinc-300">NFT address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0x..."
                          className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-zinc-300">Token ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nhập token id"
                          className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nftDescription"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:col-span-2">
                      <FormLabel className="text-zinc-300">Mô tả (không bắt buộc)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Mô tả ngắn về NFT"
                          className="h-9 border-muted-foreground bg-background text-foreground placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedAsset === "NFT" && action === "Rút" && (
              <FormField
                control={form.control}
                name="withdrawNftId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-zinc-300">Chọn NFT muốn rút</FormLabel>
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
                      <p className="text-xs text-muted-foreground">Không có NFT đang deposit để rút</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="rounded-lg border border-muted-foreground/40 bg-background/40 p-3">
              <p className="text-xs text-muted-foreground">Số dư hiện tại: {formatAmount(currentBalance)} {selectedAsset}</p>
              <p className="text-sm font-medium text-foreground">
                Số dư sau {action.toLowerCase()}: {formatAmount(Math.max(nextBalance, 0))} {selectedAsset}
              </p>
            </div>

            {selectedAsset !== "NFT" && (
              <div className="flex flex-wrap gap-2">
                {quickPercentages.map((percent) => (
                  <Button
                    key={percent}
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => applyPercentage(percent)}
                    className="border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            )}

            <Separator className="bg-zinc-800" />

            <DialogFooter className="pt-3 bg-background text-foreground">
              {txMessage && (
                <p
                  className={clsx(
                    "mr-auto text-sm",
                    txStatus === "success" && "text-emerald-400",
                    txStatus === "error" && "text-red-400"
                  )}
                >
                  {txMessage}
                </p>
              )}
              <Button
                type="submit"
                disabled={submitDisabled}
                className={clsx(
                  action === "Gửi"
                    ? "bg-green-700/80 hover:bg-green-700 disabled:bg-green-700/40"
                    : "bg-destructive/80 hover:bg-destructive disabled:bg-destructive/40",
                  "ml-auto",
                  "disabled:text-foreground/50 hover:text-foreground text-foreground/80"
                )}
              >
                {isSubmitting ? "Đang xử lý..." : `Xác nhận ${action.toLowerCase()}`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
