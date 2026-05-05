"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { ArrowLeft, LoaderCircle, Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanRequestDialog } from "@/view/Borrowing/LoanRequestDialog";
import { BorrowerLoanRequestTable } from "@/view/Borrowing/BorrowerLoanRequestTable";
import { LenderLoanRequestTable } from "@/view/Borrowing/LenderLoanRequestTable";

import { Badge } from "@/components/ui/badge";

import { formatEther, formatUnits, parseUnits } from "viem";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { contractAddress } from "@/config/app.config";
import abiData from "@/abi.json";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, formatUsdc } from "@/utils";
import { DetailCard } from "@/components/shared/DetailCard";
import BackButton from "@/components/shared/BackButton";
import {
  LoanApplication,
  applicationStatusLabelMap,
  applicationStatusVariantMap,
} from "@/model/LoanApplication";
import { LoanOffer, LoanOfferSubmitValues } from "@/model/LoanOffer";
import {
  useLoanOffersByApplicationId,
  useLoanOffersByApplicationId2,
  useUserLoanApplicationById,
  useUserLoanApplicationById2,
} from "@/hooks/use-get-loan-application";
import { FullScreenError } from "@/components/shared/FullScreenError";
import { useUserBalance, useUserNFTById, useUserNFTById2 } from "@/hooks/use-user-asset";
import { UserNft } from "@/model/User";
import { CancelOfferDialog } from "@/view/Borrowing/CancelOfferDialog";
import { AcceptOfferDialog } from "@/view/Borrowing/AcceptOfferDialog";

export default function LoanOffersPage() {
  const router = useRouter();
  const params = useParams<{ loanId: string }>();
  console.log("LoanOffersPage params:", params);
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const loanApplicationId = BigInt(params.loanId);

  // State for creating offer
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);

  // State for canceling offer
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedCancelOffer, setSelectedCancelOffer] =
    useState<LoanOffer | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [cancelTxStatus, setCancelTxStatus] = useState<
    "idle" | "success" | "error" | null
  >(null);
  const [cancelTxMessage, setCancelTxMessage] = useState<string | null>(null);

  // State for accepting offer
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [selectedAcceptOffer, setSelectedAcceptOffer] =
    useState<LoanOffer | null>(null);
  const [isAcceptSubmitting, setIsAcceptSubmitting] = useState(false);
  const [acceptTxStatus, setAcceptTxStatus] = useState<
    "idle" | "success" | "error" | null
  >(null);
  const [acceptTxMessage, setAcceptTxMessage] = useState<string | null>(null);

  // Data fetching
  const { data: userLoanApplication, isLoading: isLoadingLoanApplication } =
    useUserLoanApplicationById2(loanApplicationId);
  const { data: userLoanOffers, isLoading: isLoadingLoanOffers } =
    useLoanOffersByApplicationId2(loanApplicationId);
  const { data: userNft, isLoading: isLoadingUserNft } = useUserNFTById2(
    userLoanApplication?.nftId,
  );
  const { data: userBalance, isLoading: userBalanceIsLoading } =
    useUserBalance(address);

  if (
    isLoadingLoanApplication ||
    isLoadingLoanOffers ||
    isLoadingUserNft ||
    userBalanceIsLoading
  )
    return <FullScreenLoading message="Đang tải dữ liệu tài sản của bạn..." />;
  if (!userLoanApplication || !userLoanOffers || !userBalance) {
    return (
      <FullScreenError
        message={`Có lỗi xảy ra khi tải dữ liệu cho đơn vay với ID ${loanApplicationId}. Vui lòng thử lại sau.`}
      />
    );
  }

  if (userLoanApplication.nftId && !userNft) {
    return (
      <FullScreenError
        message={`Không tìm thấy thông tin NFT với ID ${userLoanApplication.nftId}`}
      />
    );
  }

  const application = userLoanApplication;

  const nft = userNft;

  const offers = userLoanOffers;

  const borrowerOffers = offers.filter(
    (item) =>
      item.requester.toLowerCase() == application.borrower.toLowerCase(),
  );

  const lenderOffers = offers.filter(
    (item) =>
      item.requester.toLowerCase() != application.borrower.toLowerCase(),
  );

  const accpeptedOffer = application.acceptedOfferId
    ? offers.find((offer) => offer.offerId === application.acceptedOfferId)
    : null;

  console.log("application Application details:", application);
  console.log("All offers for this application:", offers);
  console.log("Borrower's offers:", borrowerOffers);
  console.log("Lender's offers:", lenderOffers);
  console.log("Accepted offer:", accpeptedOffer);

  const handleCreateOffer = async (values: LoanOfferSubmitValues) => {
    if (!address) {
      console.warn("Wallet is not connected");
      return;
    }

    setIsSubmitting(true);
    setTxStatus(null);
    setTxMessage(null);
    try {
      const applicationId = loanApplicationId;
      const loanAmount = parseUnits(values.loanAmount.toString(), 6);
      const interestRate = BigInt(Math.floor(values.interestRate));
      const duration = BigInt(Math.floor(Number(values.loanTerm)));

      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "createLoanOffer",
        args: [applicationId, loanAmount, interestRate, duration],
      });

      setTxStatus("success");
      setTxMessage("Tạo offer vay thành công!");
    } catch (error) {
      setTxStatus("error");
      setTxMessage("Không thể tạo offer vay");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStatus = () => {
    setTxStatus(null);
    setTxMessage(null);
  };

  const handleOpenCancelOfferDialog = (index: number, offerType: string) => {
    if (offerType === "borrower") setSelectedCancelOffer(borrowerOffers[index]);
    else setSelectedCancelOffer(lenderOffers[index]);

    setIsCancelDialogOpen(true);
    setCancelTxStatus(null);
    setCancelTxMessage(null);
  };

  const handleOpenAcceptOfferDialog = (index: number, offerType: string) => {
    if (offerType === "borrower") setSelectedCancelOffer(borrowerOffers[index]);
    else setSelectedCancelOffer(lenderOffers[index]);
    setIsAcceptDialogOpen(true);
    setAcceptTxStatus(null);
    setAcceptTxMessage(null);
  };

  const handleCancelOffer = async () => {
    const selectedCancelOfferId = selectedCancelOffer?.offerId;

    if (!selectedCancelOfferId) {
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
        functionName: "cancelLoanOffer",
        args: [selectedCancelOfferId],
      });

      setCancelTxStatus("success");
      setCancelTxMessage("Hủy offer vay thành công!");
    } catch (error) {
      console.error("Error cancelling offer:", error);
      setCancelTxStatus("error");
      setCancelTxMessage("Không thể hủy offer vay");
    } finally {
      setIsCancelSubmitting(false);
    }
  };

  const handleAcceptOffer = async () => {
    const selectedAcceptOfferId = selectedAcceptOffer?.offerId;

    if (!selectedAcceptOfferId) {
      return;
    }

    if (!address) {
      console.warn("Wallet is not connected");
      setAcceptTxStatus("error");
      setAcceptTxMessage("Wallet is not connected");
      return;
    }

    setIsAcceptSubmitting(true);
    setAcceptTxStatus(null);
    setAcceptTxMessage(null);

    try {
      await writeContractAsync({
        address: contractAddress as `0x${string}`,
        abi: abiData.abi,
        functionName: "applyLoanApplication",
        args: [selectedAcceptOfferId],
      });

      setAcceptTxStatus("success");
      setAcceptTxMessage("Chấp nhận offer vay thành công!");
    } catch (error) {
      console.error("Error accepting offer:", error);
      setAcceptTxStatus("error");
      setAcceptTxMessage("Không thể chấp nhận offer vay");
    } finally {
      setIsAcceptSubmitting(false);
    }
  };

  return (
    <WalletRequired
      title="Trang chi tiết đơn vay yêu cầu kết nối ví"
      message="Kết nối ví để xem và tạo offer vay cho từng đơn vay."
    >
      <main className="space-y-6">
        <BackButton title="Quay lại " />

        {application ? (
          <>
            <Card className="bg-sidebar text-foreground">
              <CardHeader>
                <CardTitle>
                  Chi tiết đơn vay #{application.applicationId}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {accpeptedOffer && (
                  <>
                    <div className="sm:col-span-2 lg:col-span-4">
                      <p className="text-green-600 font-heading bg-foreground/10 px-3 py-2 rounded-xl w-fit">
                        Đơn vay này đã được chấp nhận bởi đề nghị với Offer -{" "}
                        {accpeptedOffer.id}
                      </p>
                    </div>
                  </>
                )}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailCard
                    label="Người vay"
                    value={application.borrower}
                    className="col-span-4 detail-card-bg"
                    valueClassName="break-all font-medium"
                  />
                  <DetailCard
                    label="Tài sản thế chấp"
                    value={application.collateralType}
                    valueClassName="font-medium"
                    className="detail-card-bg"
                  />
                  <DetailCard
                    label="Số lượng thế chấp"
                    value={
                      application.collateralType === "ETHER"
                        ? formatEther(application.collateralAmount)
                        : application.collateralAmount.toString()
                    }
                    valueClassName="font-medium"
                    className="detail-card-bg"
                  />
                  <DetailCard
                    label="Trạng thái"
                    value={
                      <Badge
                        variant={
                          applicationStatusVariantMap[application.status]
                        }
                      >
                        {applicationStatusLabelMap[application.status]}
                      </Badge>
                    }
                    className="detail-card-bg"
                  />

                  {accpeptedOffer && (
                    <>
                      <DetailCard
                        label="Số tiền vay"
                        value={formatUsdc(accpeptedOffer.loanAmount)}
                        valueClassName="font-medium"
                        className="detail-card-bg"
                      />
                      <DetailCard
                        label="Lãi suất"
                        value={accpeptedOffer.interestRate}
                        valueClassName="font-medium"
                        className="detail-card-bg"
                      />
                      <DetailCard
                        label="Thời hạn vay"
                        value={`${accpeptedOffer.duration} tháng`}
                        valueClassName="font-medium"
                        className="detail-card-bg"
                      />
                      <DetailCard
                        label="Thời điểm chấp nhận"
                        value={
                          application.timeAccepted
                            ? application.timeAccepted
                            : "N/A"
                        }
                        valueClassName="font-medium"
                        className="detail-card-bg"
                      />
                    </>
                  )}
                </div>

                {/* NFT Details Section */}
                {nft && (
                  <div className="border-t border-muted pt-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      Thông tin NFT thế chấp
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {nft.name && (
                        <DetailCard
                          label="Tên NFT"
                          value={nft.name}
                          valueClassName="font-medium"
                          className="detail-card-bg"
                        />
                      )}
                      {nft.collectionName && (
                        <DetailCard
                          label="Tên bộ sưu tập"
                          value={nft.collectionName}
                          valueClassName="font-medium"
                          className="detail-card-bg"
                        />
                      )}
                      {nft.nftAddress && (
                        <DetailCard
                          label="Địa chỉ NFT"
                          value={nft.nftAddress}
                          valueClassName="break-all font-mono text-sm font-medium"
                          className="detail-card-bg"
                        />
                      )}
                      {nft.tokenId && (
                        <DetailCard
                          label="Token ID"
                          value={nft.tokenId}
                          valueClassName="font-medium"
                          className="detail-card-bg"
                        />
                      )}
                      {nft.description && (
                        <DetailCard
                          label="Mô tả"
                          value={nft.description}
                          className="sm:col-span-2 lg:col-span-3"
                          valueClassName="font-medium text-sm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <LoanRequestDialog
              loanApplication={application}
              userBalance={userBalance}
              triggerLabel="Tạo đề nghị vay"
              onSubmitRequest={handleCreateOffer}
              isSubmitting={isSubmitting}
              txStatus={txStatus}
              txMessage={txMessage}
              onResetStatus={handleResetStatus}
              enableButton={true}
            />
            <section className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="size-4" />
                  <span>Đề nghị vay của người tạo đơn</span>
                </div>
              </div>
              <BorrowerLoanRequestTable
                title="Danh sách offer của người tạo đơn"
                requests={borrowerOffers}
                application={application}
                emptyText="Chưa có offer nào từ người tạo đơn"
                onCancelRequest={handleOpenCancelOfferDialog}
                onAcceptRequest={handleOpenAcceptOfferDialog}
                hilightRowId={
                  accpeptedOffer ? accpeptedOffer.id.toString() : undefined
                }
              />
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="size-4" />
                  <span>Đề nghị vay của người cho vay</span>
                </div>
              </div>
              <LenderLoanRequestTable
                title="Danh sách offer của người cho vay"
                requests={lenderOffers}
                application={application}
                emptyText="Chưa có offer nào từ người cho vay"
                onCancelRequest={handleOpenCancelOfferDialog}
                onAcceptRequest={handleOpenAcceptOfferDialog}
                hilightRowId={
                  accpeptedOffer ? accpeptedOffer.id.toString() : undefined
                }
              />
            </section>

            {/* // Cancle Offer Dialog */}
            {selectedCancelOffer && (
              <CancelOfferDialog
                userBalance={userBalance}
                application={application}
                offer={selectedCancelOffer}
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                title="Xác nhận hủy offer"
                content="Bạn có chắc chắn muốn hủy offer này? Hành động này không thể hoàn tác."
                txMessage={cancelTxMessage}
                txStatus={cancelTxStatus}
                isSubmtting={isCancelSubmitting}
                onConfirm={handleCancelOffer}
              />
            )}

            {/* // Accept Offer Dialog */}
            {selectedCancelOffer && (
              <AcceptOfferDialog
                userBalance={userBalance}
                application={application}
                offer={selectedCancelOffer}
                open={isAcceptDialogOpen}
                onOpenChange={setIsAcceptDialogOpen}
                title="Xác nhận chấp nhận offer"
                content="Bạn có chắc chắn muốn chấp nhận offer này? Hành động này không thể hoàn tác."
                txMessage={acceptTxMessage}
                txStatus={acceptTxStatus}
                isSubmtting={isAcceptSubmitting}
                onConfirm={handleAcceptOffer}
              />
            )}
          </>
        ) : (
          <Card className="bg-sidebar text-foreground">
            <CardHeader>
              <CardTitle>Không tìm thấy đơn vay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Không thể tìm thấy đơn vay với ID {loanApplicationId}. Vui lòng kiểm
                tra lại đường dẫn hoặc quay lại trang danh sách đơn vay.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </WalletRequired>
  );
}
