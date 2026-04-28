"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Wallet } from "lucide-react";
import { contractAddress } from "@/config/app.config";
import abiData from "@/abi.json";
import WalletRequired from "@/components/wallet-required";
import { RepaymentTable } from "@/view/Repayment/RepaymentTable";
import {
  RepaymentDetailsDialog,
  RepaymentHistoryDialog,
  RepaymentDialog,
  EndLoanDialog,
} from "@/view/Repayment/RepaymentActionDialogs";
import { useRepaymentLoans } from "@/hooks/use-repayment-loans";
import type { LoanForRepayment, RepaymentActionType } from "@/view/Repayment/types";
import { id } from "zod/v4/locales";
import { formatUnits, parseUnits } from "viem";
import { UserRepaymentLoanResponse } from "@/service/modules/repayment";

export default function RepaymentPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);
  const [isEndLoanDialogOpen, setIsEndLoanDialogOpen] = useState(false);

  // Selected loan
  const [selectedLoan, setSelectedLoan] = useState<UserRepaymentLoanResponse | null>(null);

  // Transaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [txMessage, setTxMessage] = useState<string | null>(null);

  // Fetch repayment loans
  const { data: repaymentLoans, isLoading: isLoadingLoans } = useRepaymentLoans({
    filter: { borrower: address },
    page: 0,
    size: 10,
    sort: "timeCreated,DESC",
  });

  const loans: LoanForRepayment[] = useMemo(() => {
    return repaymentLoans?.content.map((loan) => ({
      id: loan.id,
      loanId: loan.loanId,
      applicationId : loan.applicationId,
      offerId   : loan.offerId,
      borrower: loan.borrower,
      lender: loan.lender,
      loanAmount: formatUnits(loan.loanAmount, 6),
      interestRate: loan.interestRate.toString(),
      duration: loan.duration.toString(),
      totalAmountHaveToPay: formatUnits(loan.totalAmountHaveToPay, 6),
      amountPaid: formatUnits(loan.amountPaid, 6),
      loanStatus: loan.loanStatus,
      timePaid: loan.timePaid,
      timeAuction: loan.timeAuction,
      timeLiquidated: loan.timeLiquidated,
      timeCreated: loan.timeCreated,
      createdAt: loan.createdAt,
    })) ?? [];
  }, [repaymentLoans]);

  // Handle action buttons
  const handleTableAction = (action: RepaymentActionType, loan: LoanForRepayment) => {
    const selected = repaymentLoans?.content.find((l) => l.id === loan.id) ?? null;
    setSelectedLoan(selected);
    
    switch (action) {
      case "VIEW_DETAILS":
        setIsDetailsDialogOpen(true);
        break;
      case "VIEW_HISTORY":
        setIsHistoryDialogOpen(true);
        break;
      case "REPAY":
        setIsRepayDialogOpen(true);
        break;
      case "END_LOAN":
        setIsEndLoanDialogOpen(true);
        break;
    }
  };

  // Handle repayment
  const handleRepayLoan = async (amount: string) => {
    if (!selectedLoan || !address) {
      setTxStatus("error");
      setTxMessage("Vui lòng chọn khoản vay và kết nối ví");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      // Call service function
     
    } catch (error) {
      console.error("Error repaying loan:", error);
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể trả vay");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle end loan
  const handleEndLoan = async () => {
    if (!selectedLoan || !address) {
      setTxStatus("error");
      setTxMessage("Vui lòng chọn khoản vay và kết nối ví");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      
    } catch (error) {
      console.error("Error ending loan:", error);
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể kết thúc khoản vay");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WalletRequired
      title="Trang hoàn trả yêu cầu kết nối ví"
      message="Kết nối ví để thực hiện hoàn trả khoản vay và cập nhật dư nợ."
    >
      <div className="space-y-6 pb-8">
        <div className="rounded-2xl bg-sidebar p-5 shadow-lg">
          <h1 className="text-2xl font-heading">Trả vay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý và trả nợ các khoản vay của bạn
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Danh sách khoản vay</span>
          </div>

          <RepaymentTable
            loans={loans}
            isLoading={isLoadingLoans}
            onAction={handleTableAction}
          />
        </section>

        {/* Dialogs */}
        <RepaymentDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          loan={selectedLoan}
        />

        <RepaymentHistoryDialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          loan={selectedLoan}
        />

        <RepaymentDialog
          open={isRepayDialogOpen}
          onOpenChange={setIsRepayDialogOpen}
          loan={selectedLoan}
          onConfirm={handleRepayLoan}
          isSubmitting={isSubmitting}
          txStatus={txStatus}
          txMessage={txMessage}
        />

        <EndLoanDialog
          open={isEndLoanDialogOpen}
          onOpenChange={setIsEndLoanDialogOpen}
          loan={selectedLoan}
          onConfirm={handleEndLoan}
          isSubmitting={isSubmitting}
          txStatus={txStatus}
          txMessage={txMessage}
        />
      </div>
    </WalletRequired>
  );
}
