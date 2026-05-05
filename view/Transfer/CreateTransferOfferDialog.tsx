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
import { UserLoanTransfer } from "@/model/LoanTransfer";
import { CreateLoanTransferOfferSubmitValues } from "@/model/LoanTransferOffer";
import { HandCoins } from "lucide-react";

import { Input } from "@/components/ui/input";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import clsx from "clsx";
import { UserBalance, UserBalanceResponse } from "@/model/User";
import { useMemo } from "react";
import BeforeAfterCard from "@/components/shared/BeforeAfterCard";
import { formatUsdc } from "@/utils";

type Props = {
  transferApplication: UserLoanTransfer;
  userBalance: UserBalance;
  onCreate: (offer: CreateLoanTransferOfferSubmitValues) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmitting?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
};

const formSchema = z.object({
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

function CreateTransferOfferDialog(props: Props) {
  const { address } = useAccount();
  const {
    transferApplication,
    onCreate,
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
      price: 0,
    },
  });

  const submitDisabled = !form.formState.isValid || !!isSubmitting;
  const priceValue = form.watch("price");

  const price = useMemo(() => {
    const parsed = formSchema.shape.price.safeParse(priceValue);
    if (parsed.success) {
      return parsed.data;
    }
    return null;
  }, [priceValue]);

  const remainingBalance = useMemo(() => {
    if (price === null) return props.userBalance.usdcBalance;
    const remaining =
      props.userBalance.usdcBalance - BigInt(parseUnits(price.toString(), 6));
    return remaining;
  }, [price, props.userBalance.usdcBalance]);

  function onSubmit(data: z.output<typeof formSchema>) {
    const res = formSchema.parse(data);

    const submitData: CreateLoanTransferOfferSubmitValues = {
      seller: address || "",
      price: parseUnits(res.price.toString(), 6), // Convert price to USDC decimals
      transferId: transferApplication.transferId,
    };
    console.log("Submitting create offer with data:", submitData);
    onCreate(submitData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-wrap">
        <DialogTrigger asChild>
          <Button className="my-btn" disabled={!enabled}>
            <HandCoins className="size-4" />
            Tạo đề nghị mua chuyển nhượng
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Tạo đề nghị mua chuyển nhượng mới
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            <p>
              Đề nghị này sẽ gắn với đơn chuyển nhượng vay #
              {transferApplication.transferId} của bạn.
            </p>
            <p className="text-red-400">
              Bạn cần phải ứng trước tiền cho đề nghị này, và bạn có thể lấy lại
              bất cứ lúc nào khi hủy đề nghị.
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* // Form content here */}
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
          <Controller
            name="price"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Giá đề nghị (USDC)</FieldLabel>
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
            beforeLabel="Số dư USDC hiện tại"
            beforeValue={formatUsdc(props.userBalance.usdcBalance)}
            changeLabel="Số USDC ứng trước cho đề nghị này"
            changeValue={price || 0}
            type="decrease"
            afterLabel="Số dư USDC còn lại"
            afterValue={
              remainingBalance < 0 ? "Không đủ" : formatUsdc(remainingBalance)
            }
            currency="USDC"
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

export default CreateTransferOfferDialog;
