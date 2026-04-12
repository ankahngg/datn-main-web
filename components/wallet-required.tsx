"use client";

import { ReactNode } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WalletRequiredProps = {
  children: ReactNode;
  title?: string;
  message?: string;
};

export default function WalletRequired({
  children,
  title = "Chưa kết nối ví",
  message = "Vui lòng kết nối ví để sử dụng tính năng này.",
}: WalletRequiredProps) {
  const { isConnected } = useAccount();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <section className="py-8">
      <Card className="mx-auto w-full max-w-2xl bg-sidebar/80">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-sidebar-accent/20 text-sidebar-accent">
            <Wallet className="size-5" />
          </div>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">{message}</p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button type="button" onClick={openConnectModal} className="bg-sidebar text-foreground hover:text-foreground hover:bg-sidebar-accent">
                Kết nối ví ngay
              </Button>
            )}
          </ConnectButton.Custom>
        </CardContent>
      </Card>
    </section>
  );
}