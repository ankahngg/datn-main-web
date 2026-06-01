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
import { addDateDuration, formatDate, formatUsdc, subtractDate } from "@/utils";
import { useGetLoans2 } from "@/hooks/use-get-loans";

import { CreateLoanTransferApplicationSubmit } from "@/model/LoanTransfer";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "@/components/ui/select";
import { DetailCard } from "@/components/shared/DetailCard";

type Props = {
  onCreate: (offer: CreateLoanTransferApplicationSubmit) => void;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmitting?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabled: boolean;
};

const formSchema = z.object({
  price: z.coerce.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  loanId: z.coerce.bigint({
    message: "Vui lòng chọn khoản vay để chuyển nhượng",
  }),
});

function CreateTransferApplicationDialog(props: Props) {
  const { address } = useAccount();
  const {
    onCreate,
    txMessage,
    txStatus,
    isSubmitting,
    open,
    onOpenChange,
    enabled = true,
  } = props;

  const { data: userLoan, isLoading: userLoanIsLoading } = useGetLoans2({
    filter: {
      lender: address,
    },
  });

  const filteredCanTransferLoans = useMemo(() => {
    if (!userLoan) return [];
    return userLoan.filter((loan) => loan.status === "CREATED");
  }, [userLoan]);

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 0,
    },
  });

  const submitDisabled = !form.formState.isValid || !!isSubmitting;
  const priceValue = form.watch("price");
  const loanId = form.watch("loanId");
  console.log("Loan ID selected in form:", loanId);

  const selectedLoan = useMemo(() => {
    if (!loanId) return null;
    const val =
      filteredCanTransferLoans.find((loan) => loan.loanId == loanId) || null;
    if (!val) return null;
    const endDate = addDateDuration(val.timeCreated, val.duration);
    const timeLeft = subtractDate(new Date().toISOString(), endDate);
    return {
      ...val,
      endDate: endDate,
      timeLeft: timeLeft,
    };
  }, [loanId, filteredCanTransferLoans]);

  console.log("Selected loan for transfer application:", selectedLoan);

  function onSubmit(data: z.output<typeof formSchema>) {
    const res = formSchema.parse(data);

    const submitData: CreateLoanTransferApplicationSubmit = {
      seller: address || "",
      price: parseUnits(res.price.toString(), 6), // Convert price to USDC decimals
      loanId: res.loanId,
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
            Tạo đơn chuyển nhượng vay mới
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">
            Tạo đơn chuyển nhượng vay mới
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            <p>
              Đơn chuyển nhượng vay sẽ cho phép bạn chuyển nhượng khoản vay của
              mình cho người khác.
            </p>
          </DialogDescription>
        </DialogHeader>

        {/* // Form content here */}
        <form
          onSubmit={form.handleSubmit(onSubmit as any)}
          className="space-y-4"
        >
          <Controller
            name="loanId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Chọn khoản vay muốn chuyển nhượng</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                  }}
                  value={field.value as any}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn khoản vay" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {filteredCanTransferLoans.map((loan) => (
                      <SelectItem
                        key={loan.loanId}
                        value={loan.loanId.toString()}
                      >
                        {`Loan #${loan.loanId} - Số tiền: ${formatUsdc(loan.loanAmount)} USDC`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
                {selectedLoan && (
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <DetailCard
                      className="col-span-3"
                      label="Người cho vay"
                      value={selectedLoan.lender}
                      valueClassName="font-mono"
                    />
                    <DetailCard
                      label="Tiền vay"
                      value={`${formatUsdc(selectedLoan.loanAmount)} USDC `}
                    />
                    <DetailCard
                      label="Tiền phải trả"
                      value={`${formatUsdc(selectedLoan.totalAmountHaveToPay)} USDC `}
                    />
                    <DetailCard
                      label="Tiền đã trả"
                      value={`${formatUsdc(selectedLoan.amountPaid)} USDC `}
                    />
                    <DetailCard
                      className="col-span-3"
                      label="Ngày đến hạn"
                      value={
                        formatDate(selectedLoan.endDate) +
                        " - Còn " +
                        selectedLoan.timeLeft.months +
                        " tháng " +
                        selectedLoan.timeLeft.days +
                        " ngày"
                      }
                    />
                  </div>
                )}
              </Field>
            )}
          />

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

export default CreateTransferApplicationDialog;
