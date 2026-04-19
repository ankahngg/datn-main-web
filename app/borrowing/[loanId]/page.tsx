"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowLeft, Wallet } from "lucide-react";
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
  mockLoanApplications,
  mockLoanOffers,
} from "@/view/Borrowing/mock-data";
import {
  loanStatusVariantMap,
  type LoanOffer,
  type LoanOfferSubmitValues,
} from "@/view/Borrowing/types";
import { Badge } from "@/components/ui/badge";

export default function LoanOffersPage() {
  const router = useRouter();
  const params = useParams<{ loanId: string }>();
  const { address } = useAccount();

  const loanId = Number(params.loanId);
  const loan = useMemo(
    () => mockLoanApplications.find((item) => item.id === loanId),
    [loanId],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStatus, setTxStatus] = useState<"idle" | "success" | "error" | null>(
    null,
  );
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [offers, setOffers] = useState<LoanOffer[]>(
    mockLoanOffers.filter((item) => item.loanApplicationId === loanId),
  );

  const borrowerOffers = useMemo(
    () => offers.filter((item) => item.offerType === "Offer của người tạo đơn"),
    [offers],
  );
  const lenderOffers = useMemo(
    () => offers.filter((item) => item.offerType === "Offer của người cho vay"),
    [offers],
  );

  const accpeptedOffer = useMemo(() => {
    if (!loan || !loan.offerId) return null;
    return offers.find((offer) => offer.id === loan.offerId);
  }, [loan, offers]);

  const handleCreateOffer = async (values: LoanOfferSubmitValues) => {
    setIsSubmitting(true);
    try {
      const newOffer: LoanOffer = {
        id: offers.length + 1,
        loanApplicationId: values.loanId,
        offerType: values.offerType,
        requester: address ?? "0x0000...0000",
        loanAmount: String(values.loanAmount),
        interestRate: String(values.interestRate),
        duration: values.loanTerm,
        status: "Chờ xử lý",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setOffers((prev) => [...prev, newOffer]);
      setTxStatus("success");
      setTxMessage("Tạo offer vay thành công!");
    } catch {
      setTxStatus("error");
      setTxMessage("Không thể tạo offer vay");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStatus = () => {
    setTxStatus(null);
    setTxMessage(null);
  };

  const handleCancelOffer = (offerId: number) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === offerId && offer.status === "Chờ xử lý"
          ? { ...offer, status: "Đã hủy" }
          : offer,
      ),
    );
  };

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
                <CardTitle>Chi tiết đơn vay #{loan.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
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
                        {loan.status}
                      </Badge>
                    </p>
                  </div>

                  {accpeptedOffer && (
                    <>
                      <div className="sm:col-span-2 lg:col-span-4">
                        <p className="text-green-500 italic font-heading">Đơn vay này đã được chấp nhận bởi đề nghị với ID - {accpeptedOffer.id}</p>
                      </div>
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
                          {loan.timeStartActive ? loan.timeStartActive : "N/A"}
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
                onCancelRequest={handleCancelOffer}
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
                onCancelRequest={handleCancelOffer}
              />
            </section>
          </>
        ) : (
          <Card className="bg-sidebar text-foreground">
            <CardHeader>
              <CardTitle>Không tìm thấy đơn vay</CardTitle>
              <CardDescription>
                Đơn vay bạn đang truy cập không tồn tại hoặc đã bị xóa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/borrowing")}>
                Quay lại trang vay
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </WalletRequired>
  );
}
