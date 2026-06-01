"use client";

import { useState } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { HandCoins, Search, Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import PageHeader from "@/components/shared/PageHeader";
import abiData from "@/abi.json";
import { useGetLoanTransfers2 } from "@/hooks/uset-get-loan-transfer";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { FullScreenError } from "@/components/shared/FullScreenError";
import TransferApplicationTable from "@/view/Transfer/TransferApplicationTable";
import bankNFTAbi from "@/bankNFTAbi.json";
import {
  CreateLoanTransferApplicationSubmit,
  LoanTransferAction,
  UserLoanTransfer,
} from "@/model/LoanTransfer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useRouter } from "next/navigation";
import CreateTransferApplicationDialog from "@/view/Transfer/CreateTransferApplicationDialog";
import { Button } from "@/components/ui/button";
import { bankNFTAddress, contractAddress } from "@/config/app.config";
import UpdateTransferPriceDialog from "@/view/Transfer/UpdateTransferPriceDialog";
import { UpdateLoanTransferPriceSubmitValues } from "@/model/LoanTransferOffer";

export default function LoanTransferPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [createTransferDialogOpen, setCreateTransferDialogOpen] =
    useState(false);

  const [updatePriceDialogOpen, setUpdatePriceDialogOpen] = useState(false);

  const [selectedLoanTransfer, setSelectedLoanTransfer] =
    useState<UserLoanTransfer | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const { data: userLoanTransfers, isLoading: userLoanTransferIsLoading } =
    useGetLoanTransfers2({
      filter: {
        seller: address,
      },
      pageable: {
        page: 0,
        size: 100,
        sort: "timeCreated,DESC",
      },
    });

  if (userLoanTransferIsLoading) return <FullScreenLoading />;

  if (!userLoanTransfers || !publicClient)
    return (
      <FullScreenError message="Không thể tải dữ liệu chuyển nhượng vay của bạn. Vui lòng thử lại sau." />
    );

  const handleTableAction = (
    action: LoanTransferAction,
    data: UserLoanTransfer,
  ) => {
    setSelectedLoanTransfer(data);

    switch (action) {
      case "VIEW_DETAILS":
        // redirect to transfer details page
        router.push(`/transfer/${data.transferId}`);

        break;
      case "CANCEL_TRANSFER":
        setIsCancelDialogOpen(true);
        break;
      case "UPDATE_PRICE":
        setUpdatePriceDialogOpen(true);
        break;
    }
  };

  const onCreateTransferApplication = async (
    data: CreateLoanTransferApplicationSubmit,
  ) => {
    if (!address) {
      console.warn("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      const approvedAddress = await publicClient.readContract({
        address: bankNFTAddress as `0x${string}`,
        abi: bankNFTAbi.abi,
        functionName: "getApproved",
        args: [BigInt(data.loanId)],
      }) as `0x${string}`; 

      if (approvedAddress.toLowerCase() !== contractAddress.toLowerCase()) {
        await writeContractAsync({
          address: bankNFTAddress as `0x${string}`,
          abi: bankNFTAbi.abi,
          functionName: "approve",
          args: [contractAddress, BigInt(data.loanId)],
        });
      }

      // Call API to create transfer application
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "createLoanTransferApplication",
        args: [data.loanId, data.price],
      });
      setTxStatus("success");
      setTxMessage("Tạo đơn chuyển nhượng thành công!");
    } catch (error) {
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể tạo đơn chuyển nhượng");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateTransferPrice = async (
    data: UpdateLoanTransferPriceSubmitValues,
  ) => {
    if (!address) {
      console.warn("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      // Call API to update transfer price
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "updateLoanTransferApplication",
        args: [data.transferId, data.newPrice],
      });
      setTxStatus("success");
      setTxMessage("Cập nhật giá chuyển nhượng thành công!");
    } catch (error) {
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể cập nhật giá chuyển nhượng");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelTransferApplication = () => {};

  return (
    <WalletRequired
      title="Trang cho vay yêu cầu kết nối ví"
      message="Kết nối ví để xem các khoản vay mà bạn đang là người cho vay."
    >
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Chuyển nhượng vay"
          description="Xem, quản lý các đơn chuyển nhượng vay của bạn"
        />
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Danh sách đơn chuyển nhượng vay của bạn</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <CreateTransferApplicationDialog
              onCreate={onCreateTransferApplication}
              txMessage={txMessage}
              txStatus={txStatus}
              isSubmitting={isSubmitting}
              open={createTransferDialogOpen}
              onOpenChange={setCreateTransferDialogOpen}
              enabled={true}
            />

            <Button
              className="my-btn"
              onClick={() => router.push("/transfer/marketplace")}
            >
              <Search className="size-4" />
              Mua khoản vay
            </Button>
          </div>

          <TransferApplicationTable
            data={userLoanTransfers}
            onTransferAction={handleTableAction}
          />
        </section>

        {/* // Cancel Transfer Confirmation Dialog */}
        <ConfirmDialog
          open={isCancelDialogOpen}
          onOpenChange={setIsCancelDialogOpen}
          title="Xác nhận hủy chuyển nhượng"
          content={`Bạn có chắc chắn muốn hủy chuyển nhượng cho khoản vay ID ${selectedLoanTransfer?.loanId}?`}
          txMessage={txMessage}
          txStatus={txStatus}
          isSubmtting={isSubmitting}
          onConfirm={() => {
            handleCancelTransferApplication();
          }}
        />

        {selectedLoanTransfer && (
          <UpdateTransferPriceDialog
            open={updatePriceDialogOpen}
            onOpenChange={setUpdatePriceDialogOpen}
            transferApplication={selectedLoanTransfer}
            txMessage={txMessage}
            txStatus={txStatus}
            isSubmitting={isSubmitting}
            onUpdate={onUpdateTransferPrice}
          />
        )}

        {/* // Details Transfer Dialog  */}
      </div>
    </WalletRequired>
  );
}
