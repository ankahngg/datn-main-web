"use client";

import WalletRequired from "@/components/wallet-required";

export default function BorrowingPage() {
  return (
    <WalletRequired
      title="Trang vay yêu cầu kết nối ví"
      message="Kết nối ví để mở vị thế vay và theo dõi tài sản thế chấp của bạn."
    >
      <main>
        <h1 className="text-2xl font-heading">Vay tài sản</h1>
      </main>
    </WalletRequired>
  );
}
