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
import { CreateLoanTransferOfferSubmitValues, UpdateLoanTransferPriceSubmitValues } from "@/model/LoanTransferOffer";
import { HandCoins } from "lucide-react";

import { Input } from "@/components/ui/input";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import clsx from "clsx";
import { useMemo } from "react";


type Props = {
  transferApplication: UserLoanTransfer;
  onUpdate: (transfer: UpdateLoanTransferPriceSubmitValues) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmitting?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  
};

const formSchema = z.object({
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
});

function UpdateTransferPriceDialog(props: Props) {
  const { address } = useAccount();
  const {
    transferApplication,
    onUpdate,
    txMessage,
    txStatus,
    isSubmitting,
    open,
    onOpenChange,
  } = props;

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 0,
    },
  });

  const priceValue = form.watch("price");
  
  const price = useMemo(() => {
      const parsed = formSchema.shape.price.safeParse(priceValue);
      if (parsed.success) {
          return parsed.data;
        }
        return null;
    }, [priceValue]);
    
    const submitDisabled = !form.formState.isValid || !!isSubmitting || price === null || price == 0;

  function onSubmit(data: z.output<typeof formSchema>) {
    const res = formSchema.parse(data);

    const submitData: UpdateLoanTransferPriceSubmitValues = {
      newPrice: parseUnits(res.price.toString(), 6), // Convert price to USDC decimals
      transferId: transferApplication.transferId,
    };
    console.log("Submitting update price with data:", submitData);
    onUpdate(submitData);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Cập nhật giá chuyển nhượng 
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            <p>
                Cập nhật giá mới cho đơn #{transferApplication.transferId} của bạn
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
                <FieldLabel>Giá mới (USDC)</FieldLabel>
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
              {isSubmitting ? "Đang xử lý..." : "Chấp nhận"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateTransferPriceDialog;
