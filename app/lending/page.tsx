"use client";

import WalletRequired from "@/components/wallet-required";

export default function LendingPage() {
  return (
    <WalletRequired
      title="Trang cho vay yêu cầu kết nối ví"
      message="Kết nối ví để gửi tài sản vào pool cho vay và nhận lợi nhuận."
    >
      <main>
        <h1 className="text-2xl font-heading">Cho vay tài sản</h1>
      </main>
    </WalletRequired>
  );
}
