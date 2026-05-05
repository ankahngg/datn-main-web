"use client";
import { Suspense, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailCard } from "@/components/shared/DetailCard";
import { PaymentHistoryTable } from "@/view/Repayment/PaymentHistoryTable";

import { formatUnits } from "viem";
import BackButton from "@/components/shared/BackButton";
import { useLoanPayTransactions } from "@/hooks/use-get-loan-pay-transaction";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { UserLoanStatusVariantMap, UserLoanStatusLabelMap } from "@/model/Loan";
import { useGetLoanById2, useGetLoans, useGetLoans2 } from "@/hooks/use-get-loans";
import { formatDate, formatUsdc, shortAddress } from "@/utils";
import { FullScreenError } from "@/components/shared/FullScreenError";
import { useParams, useRouter } from "next/navigation";


export default function PaymentHistoryContent() {
  const params = useParams<{ loanId: string }>();
  const loanIdBigInt = BigInt(params.loanId);

  // Fetch payment history
  const {data: loanPayHistoryData, isLoading: loanPayHistoryIsLoading} = useLoanPayTransactions({
    filter: {
      loanId: loanIdBigInt,
    },
    pageable: {
      page: 0,
      size: 100,
      sort: "timeCreated,DESC",
    },
  });

  // Fetch loan details
  const { data: loansData, isLoading: loansIsLoading } = useGetLoanById2(loanIdBigInt);
  const loan = loansData;

  if (loanPayHistoryIsLoading || loansIsLoading) {
    return <FullScreenLoading message="Đang tải lịch sử thanh toán..." />;
  }

  if (!loan || !loanPayHistoryData) {
    return <FullScreenError message="Không tìm thấy khoản vay hoặc lịch sử thanh toán." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BackButton title="Quay lại " destination="/payment" />
      </div>

      {/* Loan Summary Card */}
      <Card className="bg-sidebar p-6 border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading text-foreground">
              Lịch sử thanh toán
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Khoản vay: {shortAddress(loan.borrower)} →{" "}
              {shortAddress(loan.lender)}
            </p>
          </div>
          <Badge variant={UserLoanStatusVariantMap[loan.loanStatus]}>
            {UserLoanStatusLabelMap[loan.loanStatus]}
          </Badge>
        </div>

        {/* Loan Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailCard
            label="Số tiền vay"
            value={`${formatUsdc(loan.loanAmount) } USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold"
          />

          <DetailCard
            label="Tổng phải trả"
            value={`${formatUsdc(loan.totalAmountHaveToPay)} USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold"
          />

          <DetailCard
            label="Đã thanh toán"
            value={`${formatUsdc(loan.amountPaid)} USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold text-emerald-500"
          />

          <DetailCard
            label="Còn lại"
            value={`${formatUsdc(loan.totalAmountHaveToPay - loan.amountPaid)} USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold text-orange-500"
          />
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <DetailCard
            label="Lãi suất"
            value={`${loan.interestRate.toString()}%`}
            className="detail-card-bg"
            valueClassName="font-medium"
          />
          <DetailCard
            label="Thời hạn"
            value={`${loan.duration.toString()} ngày`}
            className="detail-card-bg"
            valueClassName="font-medium"
          />
          <DetailCard
            label="Ngày tạo"
            value={formatDate(loan.timeCreated)}
            className="detail-card-bg"
            valueClassName="font-medium"
          />
        </div>
      </Card>

      {/* Payment History Table */}
      {history.length > 0 ? (
        <PaymentHistoryTable history={loanPayHistoryData} />
      ) : (
        <Card className="bg-sidebar p-8 border-border text-center">
          <p className="text-muted-foreground">
            Chưa có lịch sử thanh toán cho khoản vay này
          </p>
        </Card>
      )}
    </div>
  );
}

