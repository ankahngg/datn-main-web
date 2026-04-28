"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount, useWriteContract } from "wagmi";
import { ArrowLeft, LoaderCircle, Wallet } from "lucide-react";
import WalletRequired from "@/components/wallet-required";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoanRequestDialog } from "@/view/Borrowing/LoanRequestDialog";
import { BorrowerLoanRequestTable } from "@/view/Borrowing/BorrowerLoanRequestTable";
import { LenderLoanRequestTable } from "@/view/Borrowing/LenderLoanRequestTable";
import {
  LoanApplication,
  loanApplicationStatusLabelMap,
  loanStatusVariantMap,
  type LoanOffer,
  type LoanOfferSubmitValues,
} from "@/view/Borrowing/types";
import { Badge } from "@/components/ui/badge";
import { useLoanOffersByApplicationId, useUserLoanApplicationById } from "@/hooks/use-user-loan";
import { formatUnits, parseUnits } from "viem";
import { FullScreenLoading } from "@/MyComponent/FullLoadingScreen";
import { contractAddress } from "@/config/app.config";
import abiData from "@/abi.json";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export default function LoanOffersPage() {
  const router = useRouter();
  const params = useParams<{ loanId: string }>();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const loanApplicationId = BigInt(params.loanId);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedCancelOfferId, setSelectedCancelOfferId] = useState<bigint | null>(null);
  const [isCancelSubmitting, setIsCancelSubmitting] = useState(false);
  const [cancelTxStatus, setCancelTxStatus] = useState<"idle" | "success" | "error" | null>(null);
  const [cancelTxMessage, setCancelTxMessage] = useState<string | null>(null);
  
  const {data: userLoanApplications, isLoading: isLoadingLoanApplications} = useUserLoanApplicationById(loanApplicationId);
  const {data: userLoanOffers, isLoading: isLoadingLoanOffers} = useLoanOffersByApplicationId(loanApplicationId);

  const loan:LoanApplication = useMemo(() => {
    return {
        id: userLoanApplications?.id ?? 0,
        applicationId: userLoanApplications?.applicationId ?? BigInt(0),
        borrower: userLoanApplications?.borrower ?? "",
        collateralAsset : userLoanApplications?.collateralType ?? "",
        collateralAmount: userLoanApplications?.collateralType === "ETHER" ? formatUnits(userLoanApplications.collateralAmount, 18) : userLoanApplications?.collateralAmount.toString() ?? "",
        status: userLoanApplications?.status ?? "PENDING_CREATED",
        createdAt: userLoanApplications?.timeCreated ?? userLoanApplications?.createdAt ?? "",
        offerCount: userLoanApplications?.offerCount ?? BigInt(0),
        // NFT fields
        nftAddress: userLoanApplications?.nft?.nftAddress,
        tokenId: userLoanApplications?.nft?.tokenId,
        nftId: userLoanApplications?.nft?.nftId,
        nftName: userLoanApplications?.nft?.nftName,
        nftDescription: userLoanApplications?.nft?.nftDescription,
        nftCollectionName: userLoanApplications?.nft?.nftCollectionName,
        nftImageUrl: userLoanApplications?.nft?.nftImageUrl,

        offerId: userLoanApplications?.offerId,
        timeAccepted: userLoanApplications?.timeAccepted,
    }
  }, [userLoanApplications]);

  const offers: LoanOffer[] = useMemo(() => {
    return userLoanOffers?.content.map((offer) => ({
      id: offer.id,
      loanApplicationId: offer.applicationId,
      offerId: offer.offerId,
      requester: offer.lender,
      loanAmount: formatUnits(offer.loanAmount, 6), // Assuming loanAmount is in USDC with 6 decimals
      interestRate: offer.interestRate,
      duration: offer.duration,
      status: offer.status,
      createdAt: offer.timeCreated ?? offer.createdAt,
    })) ?? [];  
  }, [userLoanOffers]);
   
  const borrowerOffers = useMemo(
    () => offers.filter((item) => item.requester.toLowerCase() != address?.toLowerCase()),
    [offers],
  );
  const lenderOffers = useMemo(
    () => offers.filter((item) => item.requester.toLowerCase() == address?.toLowerCase()),
    [offers],
  );

    const accpeptedOffer = useMemo(() => {
    if (loan.offerId) {
      return offers.find(offer => offer.offerId === loan.offerId);
    }
    return null;
  }, [loan.offerId, offers]);

  console.log("Loan details:", loan);
  console.log("All offers for this loan:", offers);
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
      const loanAmount = parseUnits(values.loanAmount.toString(),6);
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

  const handleOpenCancelOfferDialog = (offerId: bigint) => {
    setSelectedCancelOfferId(offerId);
    setIsCancelDialogOpen(true);
    setCancelTxStatus(null);
    setCancelTxMessage(null);
  };

  const handleCancelOffer = async () => {
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


  if (isLoadingLoanApplications || isLoadingLoanOffers) 
    return <FullScreenLoading message="Đang tải dữ liệu tài sản của bạn..." />;

  return (
    <WalletRequired
      title="Trang chi tiết đơn vay yêu cầu kết nối ví"
      message="Kết nối ví để xem và tạo offer vay cho từng đơn vay."
    >
      <main className="space-y-6">
        <Button
          onClick={() => router.push("/borrowing")}
          className="italic text-foreground/80 hover:text-foreground hover:bg-sidebar"
        >
          <ArrowLeft className="size-4" />
          Quay lại danh sách đơn vay
        </Button>

        {loan ? (
          <>
            <Card className="bg-sidebar text-foreground">
              <CardHeader>
                <CardTitle>Chi tiết đơn vay #{loan.applicationId}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {accpeptedOffer && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <p className="text-green-600 font-heading bg-foreground/10 px-3 py-2 rounded-xl w-fit">Đơn vay này đã được chấp nhận bởi đề nghị với Offer - {accpeptedOffer.id}</p>
                      </div>
                    </>
                )}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="col-span-4">
                    <p className="text-xs text-muted-foreground">Người vay</p>
                    <p className="font-medium">{loan.borrower}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Tài sản thế chấp
                    </p>
                    <p className="font-medium">{loan.collateralAsset}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Số lượng thế chấp
                    </p>
                    <p className="font-medium">{loan.collateralAmount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                    <p className="font-medium">
                      <Badge variant={loanStatusVariantMap[loan.status]}>
                        {loanApplicationStatusLabelMap[loan.status]}
                      </Badge>
                    </p>
                  </div>

                  {accpeptedOffer && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Số tiền vay
                        </p>
                        <p className="font-medium">
                          {accpeptedOffer.loanAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Lãi suất
                        </p>
                        <p className="font-medium">
                          {accpeptedOffer.interestRate}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Thời hạn vay
                        </p>
                        <p className="font-medium">
                          {accpeptedOffer.duration} tháng
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Thời điểm chấp nhận
                        </p>
                        <p className="font-medium">
                          {loan.timeAccepted ? loan.timeAccepted : "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* NFT Details Section */}
                {loan.collateralAsset === "NFT" && (
                  <div className="border-t border-muted pt-4">
                    <h3 className="mb-3 font-semibold text-foreground">
                      Thông tin NFT thế chấp
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {loan.nftName && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tên NFT
                          </p>
                          <p className="font-medium">{loan.nftName}</p>
                        </div>
                      )}
                      {loan.nftCollectionName && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Tên bộ sưu tập
                          </p>
                          <p className="font-medium">
                            {loan.nftCollectionName}
                          </p>
                        </div>
                      )}
                      {loan.nftAddress && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Địa chỉ NFT
                          </p>
                          <p className="font-mono text-sm font-medium">
                            {loan.nftAddress}
                          </p>
                        </div>
                      )}
                      {loan.tokenId !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Token ID
                          </p>
                          <p className="font-medium">{loan.tokenId}</p>
                        </div>
                      )}
                      {loan.nftDescription && (
                        <div className="sm:col-span-2 lg:col-span-3">
                          <p className="text-xs text-muted-foreground">Mô tả</p>
                          <p className="font-medium text-sm">
                            {loan.nftDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <section className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="size-4" />
                  <span>Đề nghị vay của người tạo đơn</span>
                </div>
                <LoanRequestDialog
                  loanId={loan.id}
                  offerType="Offer của người tạo đơn"
                  triggerLabel="Tạo đề nghị vay"
                  onSubmitRequest={handleCreateOffer}
                  isSubmitting={isSubmitting}
                  txStatus={txStatus}
                  txMessage={txMessage}
                  onResetStatus={handleResetStatus}
                    enableButton={true}
                />
              </div>
              <BorrowerLoanRequestTable
                title="Danh sách offer của người tạo đơn"
                requests={borrowerOffers}
                emptyText="Chưa có offer nào từ người tạo đơn"
                onCancelRequest={handleOpenCancelOfferDialog}
              />
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Wallet className="size-4" />
                  <span>Đề nghị vay của người cho vay</span>
                </div>
                <LoanRequestDialog
                  loanId={loan.id}
                  offerType="Offer của người cho vay"
                  triggerLabel="Tạo đề nghị vay"
                  onSubmitRequest={handleCreateOffer}
                  isSubmitting={isSubmitting}
                  txStatus={txStatus}
                  txMessage={txMessage}
                  onResetStatus={handleResetStatus}
                 enableButton={false}
                />
              </div>
              <LenderLoanRequestTable
                title="Danh sách offer của người cho vay"
                requests={lenderOffers}
                emptyText="Chưa có offer nào từ người cho vay"
                onCancelRequest={handleOpenCancelOfferDialog}
              />
            </section>

            <ConfirmDialog
              open={isCancelDialogOpen}
              onOpenChange={setIsCancelDialogOpen}
              title="Xác nhận hủy offer"
              content="Bạn có chắc chắn muốn hủy offer này? Hành động này không thể hoàn tác."
              txMessage={cancelTxMessage}
              txStatus={cancelTxStatus}
              isSubmtting={isCancelSubmitting}
              onConfirm={handleCancelOffer}
            />
          </>
        ) : (
          <Card className="bg-sidebar text-foreground">
            <CardHeader>
              <CardTitle>Không tìm thấy đơn vay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Không thể tìm thấy đơn vay với ID {params.loanId}. Vui lòng kiểm tra lại đường dẫn hoặc quay lại trang danh sách đơn vay.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </WalletRequired>
  );
}
