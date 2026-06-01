"use client";
import BackButton from "@/components/shared/BackButton";
import { DetailCard } from "@/components/shared/DetailCard";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { FullScreenError } from "@/components/shared/FullScreenError";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WalletRequired from "@/components/wallet-required";
import { useUserBalance2 } from "@/hooks/use-user-asset";
import {
  useGetLoanTransferById2,
  useLoanTransferOffersByTransferId2,
} from "@/hooks/uset-get-loan-transfer";
import {
  applicationStatusVariantMap,
  applicationStatusLabelMap,
} from "@/model/LoanApplication";
import {
  CreateLoanTransferOfferSubmitValues,
  LoanTransferOfferAction,
  UserLoanTransferOffer,
} from "@/model/LoanTransferOffer";
import { formatDate, formatUsdc } from "@/utils";
import { CancelOfferDialog } from "@/view/Borrowing/CancelOfferDialog";
import { AcceptTransferDialog } from "@/view/Transfer/AcceptTransferDialog";
import { CancelTransferOfferDialog } from "@/view/Transfer/CancelTransferOfferDialog";
import CreateTransferOfferDialog from "@/view/Transfer/CreateTransferOfferDialog";
import TransferOfferTable from "@/view/Transfer/TransferOfferTable";
import { Wallet } from "lucide-react";
import abiData from "@/abi.json";

import { useParams, useRouter } from "next/navigation";
import { format } from "path";
import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { contractAddress } from "@/config/app.config";
import { set } from "zod";
import { ca } from "zod/v4/locales";

function Page() {
  const params = useParams<{ transferId: string }>();
  const transferId = BigInt(params.transferId);
  // alert(`Transfer ID: ${transferId}`);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const [openCreateOfferDialog, setOpenCreateOfferDialog] = useState(false);
  const [openAcceptOfferDialog, setOpenAcceptOfferDialog] = useState(false);
  const [cancelOfferDialog, setCancelOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] =
    useState<UserLoanTransferOffer | null>(null);
  const [accepter, setAccepter] = useState<"SELLER" | "BUYER">("SELLER");

  const { address } = useAccount();
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();

  const {
    data: userBalance,
    isLoading: userBalanceIsLoading,
    error: userBalanceError,
  } = useUserBalance2(address);

  const {
    data: loanTransfer,
    isLoading: loanTransferIsLoading,
    error,
  } = useGetLoanTransferById2(transferId);

  const {
    data: userLoanTransferOffers,
    isLoading: userLoanTransferOffersIsLoading,
    error: userLoanTransferOffersError,
  } = useLoanTransferOffersByTransferId2(transferId);

  if (
    loanTransferIsLoading ||
    userLoanTransferOffersIsLoading ||
    userBalanceIsLoading
  )
    return <FullScreenLoading />;
  if (!loanTransfer || !userLoanTransferOffers || !userBalance)
    return (
      <FullScreenError message="Không thể tải dữ liệu chuyển nhượng vay. Vui lòng thử lại sau." />
    );

  function onTableAction(
    action: LoanTransferOfferAction,
    data: UserLoanTransferOffer,
  ) {
    setSelectedOffer(data);

    switch (action) {
      case "ACCEPT_OFFER":
        setOpenAcceptOfferDialog(true);
        setAccepter("SELLER");
        break;
      case "CANCEL_OFFER":
        setCancelOfferDialog(true);
        break;
    }
  }

  async function onCreateTransferOffer(
    val: CreateLoanTransferOfferSubmitValues,
  ) {
    if (!address) {
      console.warn("Wallet is not connected");
      setTxStatus("error");
      setTxMessage("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "createLoanTransferOffer",
        args: [val.transferId, val.price],
      });

      setTxStatus("success");
      setTxMessage("Tạo đề nghị chuyển nhượng thành công!");
    } catch (error) {
      console.error("Error creating transfer offer:", error);
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể tạo đề nghị chuyển nhượng");
    } finally {
      setIsSubmitting(false);
    }
  }

  function onCancelTransferOffer(offerId: bigint) {
    alert(`Cancel offer with id: ${offerId}`);
  }

  async function onAcceptTransfer(
    accepter: "SELLER" | "BUYER",
    offerId: bigint,
    transferId: bigint 
  ) {
    if (!address) {
      console.warn("Wallet is not connected");
      setTxStatus("error");
      setTxMessage("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);
    console.log("Accepting transfer with data:", { accepter, offerId, transferId });
    try {
       
       await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "acceptLoanTransferApplication",
        args: [transferId, offerId]
      });

      setTxStatus("success");
      setTxMessage("Chấp nhận đề nghị chuyển nhượng thành công!");

    } catch (error) {
      console.error("Error accepting transfer offer:", error);
      setTxStatus("error");
      setTxMessage("Lỗi: Không thể chấp nhận đề nghị chuyển nhượng");
    }
    finally {
      setIsSubmitting(false);
    }
  }

  // Chỉ mua được khi đang ở trạng thái CREATED và người mua phải không là seller của đơn chuyển nhượng đó
  const canAcceptBuy =
    loanTransfer.status === "CREATED" &&
    address?.toLowerCase() !== loanTransfer.seller.toLowerCase();

  // Chỉ được tạo offer khi đang ở trạng thái CREATED và người tạo offer phải không phải là seller của đơn chuyển nhượng đó
  const canCreateOffer =
    loanTransfer.status === "CREATED" &&
    address?.toLowerCase() !== loanTransfer.seller.toLowerCase();

  return (
    <WalletRequired
      title="Trang cho vay yêu cầu kết nối ví"
      message="Kết nối ví để xem các khoản vay mà bạn đang là người cho vay."
    >
      <div className="space-y-6 pb-8">
        <BackButton title="Quay lại" />

        <Card className="bg-sidebar text-foreground">
          <CardHeader>
            <CardTitle>
              Chi tiết đơn chuyển nhượng vay #{loanTransfer.transferId}
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4">
            <DetailCard
              label="Người bán"
              value={loanTransfer.seller}
              className="col-span-4 detail-card-bg"
            />
            <DetailCard
              label="Người mua"
              value={loanTransfer.buyer || "Chưa có người mua"}
              className="col-span-4 detail-card-bg"
            />

            <DetailCard
              label="Khoản vay chuyển nhượng"
              value={
                <div className="flex gap-4 items-center">
                  <div>ID #{loanTransfer.loanId}</div>
                  <Button 
                    className="text-sm text-muted-foreground italic underline hover:text-foreground bg-transparent border-0 p-0"
                    onClick={() => router.push(`/payment/history/${loanTransfer.loanId}`)}
                    >
                      
                    Xem khoản vay
                  </Button>
                </div>
              }
              className="detail-card-bg"
            />
            <DetailCard
              label="Giá chuyển nhượng"
              value={formatUsdc(loanTransfer.price)}
              className="detail-card-bg"
            />

            <DetailCard
              label="Trạng thái"
              value={
                <Badge
                  variant={applicationStatusVariantMap[loanTransfer.status]}
                >
                  {applicationStatusLabelMap[loanTransfer.status]}
                </Badge>
              }
              className="detail-card-bg"
            />
            <DetailCard
              label="Thời gian tạo"
              value={formatDate(loanTransfer.timeCreated)}
              className="detail-card-bg"
            />
          </CardContent>
          <CardFooter>
            {canAcceptBuy && (
              <Button
                className="my-btn"
                onClick={() => {
                  setAccepter("BUYER");
                  setOpenAcceptOfferDialog(true);
                }}
              >
                Chấp nhận mua
              </Button>
            )}
          </CardFooter>
        </Card>

        {canCreateOffer && (
          <CreateTransferOfferDialog
            userBalance={userBalance}
            transferApplication={loanTransfer}
            onCreate={onCreateTransferOffer}
            txMessage={txMessage}
            txStatus={txStatus}
            isSubmitting={isSubmitting}
            open={openCreateOfferDialog}
            onOpenChange={setOpenCreateOfferDialog}
            enabled={loanTransfer.status === "CREATED"}
          />
        )}

        {selectedOffer && (
          <CancelTransferOfferDialog
            transferApplication={loanTransfer}
            transferOffer={selectedOffer}
            userBalance={userBalance}
            onCancel={onCancelTransferOffer}
            txMessage={txMessage}
            txStatus={txStatus}
            isSubmtting={isSubmitting}
            open={cancelOfferDialog}
            onOpenChange={setCancelOfferDialog}
          />
        )}

        <AcceptTransferDialog
          transferApplication={loanTransfer}
          userBalance={userBalance}
          transferOffer={selectedOffer as UserLoanTransferOffer}
          onConfirm={onAcceptTransfer}
          txMessage={txMessage}
          txStatus={txStatus}
          isSubmtting={isSubmitting}
          open={openAcceptOfferDialog}
          onOpenChange={setOpenAcceptOfferDialog}
          accepter={accepter}
        />

        <section className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="size-4" />
              <span>Danh sách đề nghị </span>
            </div>
          </div>
          <TransferOfferTable
            transferApplication={loanTransfer}
            data={userLoanTransferOffers}
            onAction={onTableAction}
          />
        </section>
      </div>
    </WalletRequired>
  );
}

export default Page;
