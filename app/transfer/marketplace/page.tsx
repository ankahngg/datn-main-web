"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { HandCoins, Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import PageHeader from "@/components/shared/PageHeader";

import { useGetLoanTransfers2 } from "@/hooks/uset-get-loan-transfer";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { FullScreenError } from "@/components/shared/FullScreenError";
import TransferApplicationTable from "@/view/Transfer/TransferApplicationTable";
import { LoanTransferAction, UserLoanTransfer } from "@/model/LoanTransfer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useRouter } from "next/navigation";

export default function TransferMarketplace() {
   const router = useRouter();
  const { address } = useAccount();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedLoanTransfer, setSelectedLoanTransfer] = useState<UserLoanTransfer | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const {data: userLoanTransfers, isLoading: userLoanTransferIsLoading} = useGetLoanTransfers2({
    filter: {
      status: "CREATED",
    },
    pageable: {
      page: 0,
      size: 100,
      sort: "timeCreated,DESC",
    },
  });

  const filteredUserLoanTransfers = userLoanTransfers?.filter(
    transfer => transfer.status === "CREATED" && transfer.seller.toLowerCase() != address?.toLowerCase() ) || [];

  if (userLoanTransferIsLoading) 
    return <FullScreenLoading />;
  
  if (!userLoanTransfers) 
    return <FullScreenError message="Không thể tải dữ liệu chuyển nhượng vay của bạn. Vui lòng thử lại sau." />;

  const handleTableAction = (action: LoanTransferAction, data: UserLoanTransfer) => {
    setSelectedLoanTransfer(data);

    switch (action) {
      case "VIEW_DETAILS":
        // redirect to transfer details page
        router.push(`/transfer/${data.transferId}`);

        break;
      case "CANCEL_TRANSFER":
        setIsCancelDialogOpen(true);
        break;
    }
  };


  const handleCancelTransferApplication = () => {
  }

  return (
    <WalletRequired
      title="Trang cho vay yêu cầu kết nối ví"
      message="Kết nối ví để xem các khoản vay mà bạn đang là người cho vay."
    >
      <div className="space-y-6 pb-8">
        <PageHeader
          title="Chợ chuyển nhượng"
          description="Xem và mua các đơn chuyển nhượng vay "
        />
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="size-4" />
            <span>Danh sách đơn chuyển nhượng vay</span>
          </div>

          <TransferApplicationTable 
            data={filteredUserLoanTransfers}
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

        {/* // Details Transfer Dialog  */}

      </div>
    </WalletRequired>
  );
}
