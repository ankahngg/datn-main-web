"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { HandCoins, Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import PageHeader from "@/components/shared/PageHeader";

import { LendingTable } from "@/view/Lending/LendingTable";
import {
  LendingDetailsDialog,
  LendingHistoryDialog,
} from "@/view/Lending/LendingActionDialogs";

import { Button } from "@/components/ui/button";
import { useGetLoans } from "@/hooks/use-get-loans";
import { UserLoan } from "@/model/Loan";

export default function LendingPage() {
  const { address } = useAccount();

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<UserLoan | null>(null);

  const { data: lendingLoans, isLoading: isLoadingLoans } = useGetLoans({
    filter: { user2: address },
    page: 0,
    size: 1000,
    sort: "timeCreated,DESC",
  });

  const loans = lendingLoans?.content ?? [];

  const handleTableAction = (action: string, loan: UserLoan) => {
    const selected = lendingLoans?.content.find((item) => item.id === loan.id) ?? null;
    setSelectedLoan(selected);

    switch (action) {
      case "VIEW_DETAILS":
        setIsDetailsDialogOpen(true);
        break;
      case "VIEW_HISTORY":
        setIsHistoryDialogOpen(true);
        break;
    }
  };

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

        <Button className="my-btn" onClick={() => window.location.href = "/lending/marketplace"}>
          <HandCoins className="size-4" />
          Cho vay
        </Button>

          <LendingTable
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
      </div>
    </WalletRequired>
  );
}
