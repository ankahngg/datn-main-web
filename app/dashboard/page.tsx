"use client";

import WalletRequired from "@/components/wallet-required";

export default function DashboardPage() {
  return (
    <WalletRequired
      title="Trang tổng quan yêu cầu kết nối ví"
      message="Hãy kết nối ví để xem thông tin tổng quan về tài sản và hoạt động DeFi của bạn."
    >
      <div>
        <h1 className="text-2xl font-heading">Trang chủ</h1>
      </div>
    </WalletRequired>
  );
}
