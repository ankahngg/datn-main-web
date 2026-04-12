"use client";

import WalletRequired from "@/components/wallet-required";

export default function RepaymentPage() {
  return (
    <WalletRequired
      title="Trang hoàn trả yêu cầu kết nối ví"
      message="Kết nối ví để thực hiện hoàn trả khoản vay và cập nhật dư nợ."
    >
      <main>
        <h1 className="text-2xl font-heading">Hoàn trả khoản vay</h1>
      </main>
    </WalletRequired>
  );
}
