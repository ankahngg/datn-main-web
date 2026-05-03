"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RepaymentDetailsDialog } from "@/view/Repayment/RepaymentDetailsDialog";
import { UserLoan } from "@/model/Loan";


type LendingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserLoan | null;
};

export function LendingDetailsDialog(props: LendingDialogProps) {
  return <RepaymentDetailsDialog {...props} />;
}

export function LendingHistoryDialog({ open, onOpenChange, loan }: LendingDialogProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open || !loan) return;

    onOpenChange(false);
    router.push(`/payment/history/${loan.loanId}`);
  }, [open, loan, onOpenChange, router]);

  return null;
}