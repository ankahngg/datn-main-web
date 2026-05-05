"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserLoanResponse } from "@/model/Loan";


type RepaymentHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserLoanResponse | null;
};

export function RepaymentHistoryDialog({ open, onOpenChange, loan }: RepaymentHistoryDialogProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open || !loan) return;

    onOpenChange(false);
    router.push(`/payment/history/${loan.loanId}`);
  }, [open, loan, onOpenChange, router]);

  return null;
}