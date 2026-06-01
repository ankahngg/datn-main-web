import BeforeAfterCard from "@/components/shared/BeforeAfterCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@/components/ui/select";
import { Auction } from "@/model/Auction";
import { AuctionBidSubmit } from "@/model/AuctionTransaction";
import { UserBalance } from "@/model/User";
import { formatUsdc } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { HandCoins } from "lucide-react";
import { use, useMemo } from "react";

import { Controller, useForm } from "react-hook-form";
import { parseUnits } from "viem/utils";
import { useAccount } from "wagmi";
import z from "zod";

type Props = {
  auction: Auction;
  userBalance: UserBalance;
  onBid: (bid: AuctionBidSubmit) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmitting?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
};

const formSchema = z.object({
  bidAmount: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

function AuctionTransactionBidDialog(props: Props) {
  const { address } = useAccount();
  const {
    auction,
    userBalance,
    onBid,
    txMessage,
    txStatus,
    isSubmitting,
    open,
    onOpenChange,
    enabled = true,
  } = props;

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bidAmount: 0,
    },
  });
  
  const bidAmountValue = form.watch("bidAmount");

  const bidAmount = useMemo(() => {
    const parsed = formSchema.shape.bidAmount.safeParse(bidAmountValue);
    if (!parsed.success) return BigInt(0);
    return parseUnits(parsed.data.toString(), 6);
  }, [bidAmountValue]);

  const remainingBalance = useMemo(() => {
    if (!userBalance.usdcBalance) return BigInt(0);
    return BigInt(userBalance.usdcBalance) - BigInt(bidAmount);
  }, [userBalance.usdcBalance, bidAmount]);

  const submitDisabled = !form.formState.isValid || !!isSubmitting || !bidAmount || remainingBalance < BigInt(0);

  const minBidAmount = auction.highestBid ?
  BigInt(props.auction.highestBid) + BigInt(props.auction.highestBid) / BigInt(20) // Minimum bid is current highest bid + 5%
  : props.auction.startPrice; // If no bids yet, minimum bid is the starting price

  function onSubmit(data: z.output<typeof formSchema>) {
    const res = formSchema.parse(data);

    const bidAmount = parseUnits(res.bidAmount.toString(), 6);

    if(bidAmount < minBidAmount) {
      form.setError("bidAmount", {
        type: "manual",
        message: `Số tiền nhỏ nhất là ${formatUsdc(minBidAmount)}`,
      });
      return;
    }

    const submitData: AuctionBidSubmit = {
      auctionId: props.auction.auctionId,
      bidAmount: parseUnits(res.bidAmount.toString(), 6),
      bidder: address || "",
    };
    console.log("Submitting create offer with data:", submitData);
    onBid(submitData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-wrap">
        <DialogTrigger asChild>
          <Button className="my-btn" disabled={!enabled}>
            <HandCoins className="size-4" />
            Đấu giá
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Đấu giá cho đấu giá #{props.auction.auctionId}
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            <p>
                Nhập số tiền bạn muốn đặt cho đấu giá này. Số tiền phải lớn hơn 5% giá hiện tại của đấu giá.
            </p>
            <p>
                Bạn sẽ phải ứng trước số tiền, và số tiền này sẽ được hoàn lại nếu có ai đặt giá cao hơn bạn sau đó.
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* // Form content here */}
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-4"
        >
          <Controller
            name="bidAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Số tiền đặt (Số tiền nhỏ nhất có thể đặt là {formatUsdc(minBidAmount)})</FieldLabel>
                <Input
                  {...field}
                  value={field.value as any}
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
            beforeValue={formatUsdc(props.userBalance.usdcBalance)}
            changeLabel="Số tiền đặt"
            changeValue={formatUsdc(bidAmount)}
            afterLabel="Số dư sau khi đặt"
            afterValue={
              remainingBalance < BigInt(0) ? "Không đủ tiền" : formatUsdc(remainingBalance)
            }
            currency="USDC"
            type="decrease"
          />

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
              {isSubmitting ? "Đang xử lý..." : "Tạo đề nghị"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AuctionTransactionBidDialog;
