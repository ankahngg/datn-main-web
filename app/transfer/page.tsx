"use client";

import WalletRequired from "@/components/wallet-required";

export default function TransferPage() {
  return (
    <WalletRequired
      title="Trang chuyển tài sản yêu cầu kết nối ví"
      message="Kết nối ví để chuyển tài sản an toàn giữa các địa chỉ hoặc mạng hỗ trợ."
    >
      <main>
        <h1 className="text-2xl font-heading">Chuyển tài sản</h1>
      </main>
    </WalletRequired>
  );
}
