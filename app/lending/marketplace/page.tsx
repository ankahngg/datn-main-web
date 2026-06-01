"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import WalletRequired from "@/components/wallet-required";
import PageHeader from "@/components/shared/PageHeader";
import { LoanApplicationTable } from "@/view/Borrowing/LoanApplicationTable";
import { useUserLoanApplications, useUserLoanApplications2 } from "@/hooks/use-get-loan-application";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { formatDate } from "@/utils";
import { LoanApplication } from "@/model/LoanApplication";
import { FullScreenError } from "@/components/shared/FullScreenError";
import { COMMON_ERROR_MESSAGE, COMMON_LOADING_MESSAGE } from "@/constaints";

export default function LendingMarketplacePage() {
	const router = useRouter();
	const { address } = useAccount();

	const {
		data: userLoanApplications,
		isLoading: isLoadingLoanApplications,
	} = useUserLoanApplications2({
		filter: {},
		pageable: { page: 0, size: 1000, sort: "createdAt,DESC" },
	});


	if (isLoadingLoanApplications) {
		return <FullScreenLoading message={COMMON_LOADING_MESSAGE} />;
	}

	if(!userLoanApplications) {
		return <FullScreenError message={COMMON_ERROR_MESSAGE} />;
	}

	const filteredApplications = userLoanApplications.filter((app) => app.status === "CREATED" || app.status === "PENDING_CREATED");

	return (
		<WalletRequired
			title="Chợ vay yêu cầu kết nối ví"
			message="Kết nối ví để xem và cho vay các đơn vay hấp dẫn"
		>
			<div className="space-y-6 pb-8">
				<PageHeader
					title="Chợ vay"
					description="Tìm kiếm và cho vay các đơn vay hấp dẫn từ người đi vay"
				/>

				<section className="space-y-4">
					<div className="flex items-center gap-2 text-sm">
						<Wallet className="size-4" />
						<span>Danh sách các đơn vay đang mở</span>
					</div>

					<LoanApplicationTable
                        title="Danh sách đơn vay đang mở"
						applications={filteredApplications}
						onViewOffers={(loanId) => router.push(`/borrowing/${loanId}`)}
						showCancelAction={false}
						showViewLoanAction={false}
					/>
				</section>
			</div>
		</WalletRequired>
	);
}
