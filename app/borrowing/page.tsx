"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import WalletRequired from "@/components/wallet-required";
import { LoanApplicationDialog } from "@/view/Borrowing/LoanApplicationDialog";
import { LoanApplicationTable } from "@/view/Borrowing/LoanApplicationTable";
import { mockLoanApplications, mockLoanOffers } from "@/view/Borrowing/mock-data";
import { useUserBalance, useUserNfts } from "@/hooks/use-user-asset";
import type {
  LoanApplication,
  LoanApplicationSubmitValues,
} from "@/view/Borrowing/types";

export default function BorrowingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [applications, setApplications] = useState<LoanApplication[]>(mockLoanApplications);
  const { data: userBalance } = useUserBalance(address);
  const { data: userNfts } = useUserNfts(address);

  const ethBalance = userBalance ? Number(formatEther(userBalance.ethBalance)) : 0;
  const availableNfts = (userNfts?.content ?? [])
    .filter((nft) => !nft.isWithdrawn)
    .map((nft) => ({
      id: nft.id,
      nftAddress: nft.nftAddress,
      tokenId: nft.tokenId.toString(),
      name: `NFT #${nft.nftId.toString()}`,
    }));

  const offerCountByLoanId = mockLoanOffers.reduce<Record<number, number>>((acc, item) => {
    acc[item.loanApplicationId] = (acc[item.loanApplicationId] ?? 0) + 1;
    return acc;
  }, {});

  const handleSubmitApplication = async (values: LoanApplicationSubmitValues) => {
    setIsSubmitting(true);
    try {
      const newApplication: LoanApplication = {
        id: applications.length + 1,
        borrower: address || "0x0000...0000",
        collateralAsset: values.collateralAsset,
        collateralAmount: String(values.collateralAmount),
        loanAmountUsdc: String(values.loanAmountUsdc),
        monthlyInterestRate: String(values.monthlyInterestRate),
        loanTermMonths: String(values.loanTermMonths),
        totalRepayment: String(values.totalRepayment),
        nftId: values.selectedNftId,
        nftAddress: values.selectedNftAddress,
        tokenId: values.selectedNftTokenId ? Number(values.selectedNftTokenId) : undefined,
        nftName: values.selectedNftName,
        status: "Chờ xử lý",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setApplications([...applications, newApplication]);
      setTxStatus("success");
      setTxMessage("Đơn vay được tạo thành công!");
    } catch (error) {
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể tạo đơn vay");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStatus = () => {
    setTxStatus(null);
    setTxMessage(null);
  };

  const handleCancelApplication = (loanId: number) => {
    setApplications((prev) => prev.filter((application) => application.id !== loanId));
  };

  const handleViewLoan = (loanId: number) => {
    router.push(`/repayment?loanId=${loanId}`);
  };

  return (
    <WalletRequired
      title="Trang vay yêu cầu kết nối ví"
      message="Kết nối ví để mở vị thế vay và theo dõi tài sản thế chấp của bạn."
    >
      <div className="space-y-6 pb-8">
        <div className="rounded-2xl bg-sidebar p-5 shadow-lg">
          <h1 className="text-2xl font-heading">Vay tài sản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đơn vay là trung tâm, offer vay được quản lý trong chi tiết của từng đơn vay.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Quản lý đơn vay</span>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <LoanApplicationDialog
              onSubmitApplication={handleSubmitApplication}
              availableNfts={availableNfts}
              ethBalance={ethBalance}
              isSubmitting={isSubmitting}
              txStatus={txStatus}
              txMessage={txMessage}
              onResetStatus={handleResetStatus}
            />
          </div>
          <LoanApplicationTable
            applications={applications}
            offerCountByLoanId={offerCountByLoanId}
            onViewOffers={(loanId) => router.push(`/borrowing/${loanId}`)}
            onCancelApplication={handleCancelApplication}
            onViewLoan={handleViewLoan}
          />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <HandCoins className="size-4" />
            <span>Luồng offer vay</span>
          </div>
          <p className="rounded-xl bg-sidebar px-4 py-3 text-sm text-muted-foreground">
            Offer của người tạo đơn và offer của người cho vay sẽ được hiển thị ở trang chi tiết từng đơn vay.
          </p>
        </section>
      </div>
    </WalletRequired>
  );
}
