"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HandCoins, Wallet } from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther, parseEther, parseUnits } from "viem";
import { contractAddress } from "@/config/app.config";
import abiData from "@/abi.json";
import WalletRequired from "@/components/wallet-required";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { LoanApplicationDialog } from "@/view/Borrowing/LoanApplicationDialog";
import { LoanApplicationTable } from "@/view/Borrowing/LoanApplicationTable";
import { mockLoanApplications, mockLoanOffers } from "@/view/Borrowing/mock-data";
import { useUserBalance, useUserNfts } from "@/hooks/use-user-asset";
import type {
  LoanApplication,
  LoanApplicationSubmitValues,
} from "@/view/Borrowing/types";
import { useUserLoanApplications } from "@/hooks/use-user-loan";

export default function BorrowingPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedCancelApplicationId, setSelectedCancelApplicationId] = useState<bigint | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [cancelTxStatus, setCancelTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [cancelTxMessage, setCancelTxMessage] = useState<string | null>(null);
  const { data: userBalance } = useUserBalance(address);
  const { data: userNfts } = useUserNfts(address);
  const {data: userLoanApplications, isLoading: isLoadingLoanApplications } = useUserLoanApplications({
    filter: { user1: address },
    page: 0,
    size: 10,
    sort: "createdAt,DESC",
  });

  const ethBalance = userBalance ? Number(formatEther(userBalance.ethBalance)) : 0;
  const availableNfts = (userNfts?.content ?? [])
    .filter((nft) => !nft.isWithdrawn)
    .map((nft) => ({
      id: nft.id,
      nftAddress: nft.nftAddress,
      tokenId: nft.tokenId.toString(),
      name: `NFT #${nft.nftId.toString()}`,
    }));

  const applications: LoanApplication[] = useMemo(() => {
    if (isLoadingLoanApplications) {
      return [];
    }
    return userLoanApplications?.content.map((application) => ({
      id: application.id,
      applicationId: application.applicationId,
      borrower: application.borrower,
      collateralAsset : application.collateralType,
      collateralAmount: application.collateralType === "ETHER" ? formatEther(application.collateralAmount) : application.collateralAmount.toString(),
            status: application.status,
            createdAt: application.timeCreated ?? application.createdAt,
      offerCount: application.offerCount ?? BigInt(0),
      // NFT fields
      nftAddress: application.nft?.nftAddress,
      tokenId: application.nft?.tokenId ,
      nftId: application.nft?.nftId,
      nftName: application.nft?.nftName,
      nftDescription: application.nft?.nftDescription,
      nftCollectionName: application.nft?.nftCollectionName,
      nftImageUrl: application.nft?.nftImageUrl,
      
      offerId: application.offerId,
      timeAccepted: application.timeAccepted,

    })) ?? [];
  }, [userLoanApplications, isLoadingLoanApplications]);

  const handleSubmitApplication = async (values: LoanApplicationSubmitValues) => {
    if (!address) {
      console.warn("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);
    try {
      // Determine collateral type: 0 = ETH, 1 = NFT
      const collateralType = values.collateralAsset === "ETH" ? 0 : 1;
      
      // Convert amounts to wei/proper format
      const collateralAmount = values.collateralAsset === "ETH" 
        ? parseEther(values.collateralAmount.toString())
        : BigInt(Math.floor(values.collateralAmount));
      
      const loanAmount = parseUnits(values.loanAmountUsdc.toString(), 6); // Assuming USDC has 6 decimals
      const interestRate = BigInt(Math.floor(values.monthlyInterestRate)); // Convert to basis points or appropriate format
      const duration = BigInt(values.loanTermMonths);
      const nftId = BigInt(values.selectedNftId || 0);

      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "createLoanApplication",
        args: [collateralType, collateralAmount, nftId, loanAmount, interestRate, duration],
      });

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

  const handleCancelApplication = (loanApplicationId: bigint) => {
    setSelectedCancelApplicationId(loanApplicationId);
    setIsCancelDialogOpen(true);
    setCancelTxStatus(null);
    setCancelTxMessage(null);
  };

  const handleConfirmCancelApplication = async () => {
    if (!selectedCancelApplicationId) {
      return;
    }

    if (!address) {
      console.warn("Wallet is not connected");
      setCancelTxStatus("error");
      setCancelTxMessage("Wallet is not connected");
      return;
    }

    setIsCancelSubmitting(true);
    setCancelTxStatus(null);
    setCancelTxMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "cancelLoanApplication",
        args: [selectedCancelApplicationId],
      });

      setCancelTxStatus("success");
      setCancelTxMessage("Hủy đơn vay thành công!");
    } catch (error) {
      console.error("Error cancelling loan application:", error);
      setCancelTxStatus("error");
      setCancelTxMessage("Không thể hủy đơn vay");
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  const handleViewLoan = (loanId: bigint) => {
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
            onViewOffers={(loanId) => router.push(`/borrowing/${loanId}`)}
            onCancelApplication={handleCancelApplication}
            onViewLoan={handleViewLoan}
          />

          <ConfirmDialog
            open={isCancelDialogOpen}
            onOpenChange={setIsCancelDialogOpen}
            title="Xác nhận hủy đơn vay"
            content="Bạn có chắc chắn muốn hủy đơn vay này? Hành động này không thể hoàn tác."
            txMessage={cancelTxMessage}
            txStatus={cancelTxStatus}
            isSubmtting={isCancelSubmitting}
            onConfirm={handleConfirmCancelApplication}
          />
        </section>

        {/* <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <HandCoins className="size-4" />
            <span>Luồng offer vay</span>
          </div>
          <p className="rounded-xl bg-sidebar px-4 py-3 text-sm text-muted-foreground">
            Offer của người tạo đơn và offer của người cho vay sẽ được hiển thị ở trang chi tiết từng đơn vay.
          </p>
        </section> */}
      </div>
    </WalletRequired>
  );
}
