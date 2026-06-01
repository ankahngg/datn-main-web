"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { HandCoins, Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import PageHeader from "@/components/shared/PageHeader";

import { LenderLoanTable } from "@/view/Lending/LenderLoanTable";
import {
  LendingDetailsDialog,
  LendingHistoryDialog,
} from "@/view/Lending/LendingActionDialogs";
import abiData from "@/abi.json";

import { Button } from "@/components/ui/button";
import { useGetLoans2 } from "@/hooks/use-get-loans";
import { UserLoan } from "@/model/Loan";
import { useRouter } from "next/navigation";
import { StartAuctionDialog } from "@/view/Lending/StartAuctionDialog";
import { contractAddress } from "@/config/app.config";

export default function LendingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isStartAuctionDialogOpen, setIsStartAuctionDialogOpen] =
    useState(false);
  const [selectedLoan, setSelectedLoan] = useState<UserLoan | null>(null);

  // Transaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const { data: lendingLoans, isLoading: isLoadingLoans } = useGetLoans2({
    filter: { lender: address },
    pageable: { page: 0, size: 1000, sort: "timeCreated,DESC" },
  });

  const loans = lendingLoans ?? [];

  const handleTableAction = (action: string, loan: UserLoan) => {
    setSelectedLoan(loan);

    switch (action) {
      case "VIEW_DETAILS":
        setIsDetailsDialogOpen(true);
        break;
      case "VIEW_HISTORY":
        setIsHistoryDialogOpen(true);
        break;
      case "VIEW_APPLICATION":
        router.push(`/borrowing/${loan.applicationId}`);
        break;
      case "START_AUCTION":
        setIsStartAuctionDialogOpen(true);
        break;
    }
  };

  const handleStartAuctionConfirm = async () => {
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
        functionName: "startAuction",
        args: [selectedLoan.loanId],
      });

      setTxStatus("success");
      setTxMessage("Bắt đầu đấu giá thành công");

    } catch (error: any) {
      console.error("Error starting auction:", error);
      setTxStatus("error");
      setTxMessage( "Có lỗi xảy ra khi bắt đầu đấu giá");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <WalletRequired
      title="Trang cho vay yêu cầu kết nối ví"
      message="Kết nối ví để xem các khoản vay mà bạn đang là người cho vay."
    >
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Khoản cho vay của bạn"
          description="Xem và quản lý các khoản vay hiện tại mà bạn là người cho vay. Bạn có thể xem chi tiết hoặc xem lịch sử vay của từng khoản."
        />
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Danh sách khoản cho vay</span>
          </div>

          <Button
            className="my-btn"
            onClick={() => (window.location.href = "/lending/marketplace")}
          >
            <HandCoins className="size-4" />
            Cho vay
          </Button>

          <LenderLoanTable
            loans={loans}
            isLoading={isLoadingLoans}
            onAction={handleTableAction}
          />
        </section>

        <LendingDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          loan={selectedLoan}
        />

        <LendingHistoryDialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          loan={selectedLoan}
        />

        {selectedLoan && (
          <StartAuctionDialog
            open={isStartAuctionDialogOpen}
            onOpenChange={setIsStartAuctionDialogOpen}
            loan={selectedLoan}
            txMessage={txMessage}
            txStatus={txStatus}
            isSubmtting={isSubmitting}
            onConfirm={handleStartAuctionConfirm}

          />
        )}
      </div>
    </WalletRequired>
  );
}
