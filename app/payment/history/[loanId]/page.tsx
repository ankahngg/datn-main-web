import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailCard } from "@/components/shared/DetailCard";
import { PaymentHistoryTable } from "@/view/Repayment/PaymentHistoryTable";
import {
  getLoanPaymentHistory,
  getLoans,
} from "@/service/modules/loan";
import {
  loanStatusLabelMap,
  loanStatusVariantMap,
} from "@/view/Repayment/types";
import { formatUnits } from "viem";
import BackButton from "@/components/shared/BackButton";

function truncateAddress(address: string, startChars = 6, endChars = 4) {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

interface PageProps {
  params: Promise<{
    loanId: string;
  }>;
}

async function PaymentHistoryContent({ params }: PageProps) {
  const { loanId } = await params;
  const loanIdBigInt = BigInt(loanId);

  // Fetch payment history
  const historyData = await getLoanPaymentHistory(loanIdBigInt);
  const history = historyData.content || [];

  // Fetch all loans to find the matching loan details
  const loansData = await getLoans({
    filter: {},
    pageable: {
      page: 0,
      size: 100,
      sort: "timeCreated,DESC",
    },
  });

  const loan = loansData.content.find((l) => l.loanId === loanIdBigInt);

  if (!loan) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <BackButton title="Quay lại " destination="/payment" />
        </div>

        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Không tìm thấy thông tin khoản vay</p>
        </div>
      </div>
    );
  }

  const formattedLoan = {
    loanAmount: formatUnits(loan.loanAmount, 6),
    totalAmountHaveToPay: formatUnits(loan.totalAmountHaveToPay, 6),
    amountPaid: formatUnits(loan.amountPaid, 6),
  };

  const amountRemaining =
    BigInt(loan.totalAmountHaveToPay) - BigInt(loan.amountPaid);

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
              Khoản vay: {truncateAddress(loan.borrower)} →{" "}
              {truncateAddress(loan.lender)}
            </p>
          </div>
          <Badge variant={loanStatusVariantMap[loan.loanStatus]}>
            {loanStatusLabelMap[loan.loanStatus]}
          </Badge>
        </div>

        {/* Loan Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailCard
            label="Số tiền vay"
            value={`${formattedLoan.loanAmount} USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold"
          />

          <DetailCard
            label="Tổng phải trả"
            value={`${formattedLoan.totalAmountHaveToPay} USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold"
          />

          <DetailCard
            label="Đã thanh toán"
            value={`${formattedLoan.amountPaid} USDC`}
            className="detail-card-bg"
            valueClassName="text-lg font-semibold text-emerald-500"
          />

          <DetailCard
            label="Còn lại"
            value={`${formatUnits(amountRemaining, 6)} USDC`}
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
        <PaymentHistoryTable history={history} />
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

export default function PaymentHistoryPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="text-center py-8">Đang tải...</div>}>
      <PaymentHistoryContent params={props.params} />
    </Suspense>
  );
}
