"use client";
import { FullScreenLoading } from "@/components/shared/FullLoadingScreen";
import { FullScreenError } from "@/components/shared/FullScreenError";
import PageHeader from "@/components/shared/PageHeader";
import WalletRequired from "@/components/wallet-required";
import { useAuctions2 } from "@/hooks/use-auction";
import { Auction, AuctionAction } from "@/model/Auction";
import AuctionTable from "@/view/Auction/AuctionTable";
import { Scale, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAccount } from "wagmi";

function AuctionPage() {
  const router = useRouter();

    const { address } = useAccount();
    const { data: auctions, isLoading: auctionsIsLoading } = useAuctions2({
        filter: {
            status: "CREATED",
        },
        pageable: {
            page: 0,
            size: 100,
            sort: "timeCreated,DESC",
        },
    });    

    if (auctionsIsLoading) return <FullScreenLoading />;

    if(!auctions) return <FullScreenError message="Không thể tải dữ liệu đấu giá. Vui lòng thử lại sau." />
       
    function handleAuctionTableAction(action: AuctionAction, auction: Auction) {
        switch (action) {
            case "VIEW_DETAILS":
                router.push(`/auction/${auction.auctionId}`);
                
                break;
            default:
                break;
        }
    }

  return (
    <WalletRequired
      title="Trang cho vay yêu cầu kết nối ví"
      message="Kết nối ví để xem các khoản vay mà bạn đang là người cho vay."
    >
      <div className="space-y-6 pb-8">
        <PageHeader
            icon = {<Scale className="mr-2" />}
          title="Đấu giá"
          description="Xem và thực hiện đấu giá các khoản vay quá hạn"
        />
        <section className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
                <Wallet className="size-4" />
                <span>Danh sách đấu giá </span>
            </div>
        
            <AuctionTable 
               data={auctions}
                onAuctionTableAction={handleAuctionTableAction}
            />
        </section>
      </div>
    </WalletRequired>
  );
}

export default AuctionPage;


