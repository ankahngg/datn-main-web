import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentHistoryTable } from "@/view/Repayment/PaymentHistoryTable";
import { getLoanPaymentHistory, getLoansForRepayment } from "@/service/modules/repayment";
import { loanStatusLabelMap, loanStatusVariantMap } from "@/view/Repayment/types";
import { formatUnits } from "viem";

function truncateAddress(address: string, startChars = 6, endChars = 4) {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

function formatAmount(value: string | bigint, decimals = 6) {
  const numericValue = typeof value === "bigint" ? Number(value) / Math.pow(10, decimals) : Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 6,
  }).format(numericValue);
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
  const loansData = await getLoansForRepayment(
    {
      filter: {},
        pageable: {
          page: 0,
          size: 100,
          sort: "timeCreated,DESC",
        },
    },
  );

  const loan = loansData.content.find((l) => l.loanId === loanIdBigInt);

  if (!loan) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/payment">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 size-4" />
              Quay lại
            </Button>
          </Link>
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

  const amountRemaining = BigInt(loan.totalAmountHaveToPay) - BigInt(loan.amountPaid);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/payment">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      {/* Loan Summary Card */}
      <Card className="bg-sidebar p-6 border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading text-foreground">Lịch sử thanh toán</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Khoản vay: {truncateAddress(loan.borrower)} → {truncateAddress(loan.lender)}
            </p>
          </div>
          <Badge variant={loanStatusVariantMap[loan.loanStatus]}>
            {loanStatusLabelMap[loan.loanStatus]}
          </Badge>
        </div>

        {/* Loan Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background rounded p-4">
            <p className="text-xs text-muted-foreground mb-1">Số tiền vay</p>
            <p className="text-lg font-semibold text-foreground">
              {formattedLoan.loanAmount} USDC
            </p>
          </div>

          <div className="bg-background rounded p-4">
            <p className="text-xs text-muted-foreground mb-1">Tổng phải trả</p>
            <p className="text-lg font-semibold text-foreground">
              {formattedLoan.totalAmountHaveToPay} USDC
            </p>
          </div>

          <div className="bg-background rounded p-4">
            <p className="text-xs text-muted-foreground mb-1">Đã thanh toán</p>
            <p className="text-lg font-semibold text-emerald-500">
              {formattedLoan.amountPaid} USDC
            </p>
          </div>

          <div className="bg-background rounded p-4">
            <p className="text-xs text-muted-foreground mb-1">Còn lại</p>
            <p className="text-lg font-semibold text-orange-500">
              {formatAmount(amountRemaining)} USDC
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Lãi suất</p>
            <p className="text-sm font-medium text-foreground">{loan.interestRate.toString()}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Thời hạn</p>
            <p className="text-sm font-medium text-foreground">{loan.duration.toString()} ngày</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ngày tạo</p>
            <p className="text-sm font-medium text-foreground">
              {formatDate(loan.timeCreated)}
            </p>
          </div>
        </div>
      </Card>

      {/* Payment History Table */}
      {history.length > 0 ? (
        <PaymentHistoryTable history={history} />
      ) : (
        <Card className="bg-sidebar p-8 border-border text-center">
          <p className="text-muted-foreground">Chưa có lịch sử thanh toán cho khoản vay này</p>
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
