"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LoanForRepayment } from "./types";
import { UserRepaymentLoanResponse } from "@/service/modules/repayment";

type RepaymentHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: UserRepaymentLoanResponse | null;
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