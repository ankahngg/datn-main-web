"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import { BorrowerLoanTable } from "@/view/Repayment/BorrowerLoanTable";

import PageHeader from "@/components/shared/PageHeader";
import { useGetLoans, useGetLoans2 } from "@/hooks/use-get-loans";
import { UserLoan, UserLoanResponse } from "@/model/Loan";
import { EndLoanDialog } from "@/view/Repayment/EndLoanDialog";
import { RepaymentDetailsDialog } from "@/view/Repayment/RepaymentDetailsDialog";
import { RepaymentDialog } from "@/view/Repayment/RepaymentDialog";
import { RepaymentHistoryDialog } from "@/view/Repayment/RepaymentHistoryDialog";
import { RepaymentActionType } from "@/model/enum";
import { contractAddress } from "@/config/app.config";
import abiData from "@/abi.json";
import { useUserBalance } from "@/hooks/use-user-asset";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { FullScreenError } from "@/components/shared/FullScreenError";

export default function RepaymentPage() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Dialog states
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false);
  const [isEndLoanDialogOpen, setIsEndLoanDialogOpen] = useState(false);

  // Selected loan
  const [selectedLoan, setSelectedLoan] = useState<UserLoan | null>(null);

  // Transaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);

  // Fetch repayment loans
  const { data: repaymentLoans, isLoading: isLoadingLoans } = useGetLoans2({
    filter: {
      borrower: address,
    },
    pageable: { page: 0, size: 1000, sort: "timeCreated,DESC" },
  });

  const { data: userBalance, isLoading: userBalanceIsLoading } =
    useUserBalance(address);

  if (userBalanceIsLoading || isLoadingLoans) return <FullScreenLoading />;

  if (!repaymentLoans || !userBalance)
    return (
      <FullScreenError message="Không thể tải dữ liệu khoản vay của bạn. Vui lòng thử lại sau." />
    );

  // Handle action buttons
  const handleTableAction = (action: RepaymentActionType, loan: UserLoan) => {
    setSelectedLoan(loan);

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
  const handleRepayLoan = async (amount: bigint) => {
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
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "payLoan",
        args: [selectedLoan.loanId, amount],
      });

      setTxStatus("success");
      setTxMessage(
        "Trả nợ thành công!",
      );
    } catch (error) {
      console.error("Error repaying loan:", error);
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể trả vay");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle end loan
  const handleEndLoan = async (amount : bigint) => {
    if (!selectedLoan || !address) {
      setTxStatus("error");
      setTxMessage("Vui lòng chọn khoản vay và kết nối ví");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "endLoan",
        args: [selectedLoan.loanId],
      });

      setTxStatus("success");
      setTxMessage(
        "Kết thúc khoản vay thành công!",
      );

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
        <PageHeader
          title="Khoản vay của bạn"
          description="Xem và quản lý các khoản vay hiện tại của bạn. Bạn có thể xem chi tiết, lịch sử thanh toán, thực hiện trả nợ hoặc kết thúc khoản vay."
        />

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Danh sách khoản vay</span>
          </div>

          <BorrowerLoanTable
            loans={repaymentLoans}
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

        {selectedLoan && (
          <RepaymentDialog
            open={isRepayDialogOpen}
            onOpenChange={setIsRepayDialogOpen}
            loan={selectedLoan}
            userBalance={userBalance}
            onConfirm={handleRepayLoan}
            isSubmitting={isSubmitting}
            txStatus={txStatus}
            txMessage={txMessage}
          />
        )}

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
