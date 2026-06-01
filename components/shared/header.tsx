"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Bell } from "lucide-react";
import { Ellipsis } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";

function WalletConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        authenticationStatus,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <Button
              type="button"
              onClick={openConnectModal}
              className="bg-sidebar text-foreground hover:text-foreground hover:bg-sidebar-accent"
            >
              Kết nối ví
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button type="button" onClick={openChainModal} variant="destructive">
              Sai mạng
            </Button>
          );
        }

        return (
          <Button
            type="button"
            onClick={openAccountModal}
            className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
          >
            {account.displayName}
          </Button>
        );
      }}
    </ConnectButton.Custom>
  );
}

function Header() {
  const { address, isConnected } = useAccount();
  if (!isConnected) {
    return (
      <div
        className="flex gap-5 pt-5 pb-4 items-center
            border-b-2 border-(--devider-color)
            "
      >
        <WalletConnectButton />
        <div className="text-sm ">
          Chưa thực hiện kết nối ví, vui lòng kết nối để sử dụng
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between border-b-2 border-(--devider-color) pt-5 pb-3 sticky top-0 bg-background z-10">
        {/* <WalletConnectButton /> */}
        <ConnectButton />
      <div
        className="flex items-end justify-end gap-10">
        {/* Dia chi vi dien tu: 0x1234...5678 */}
        <div className="text-xs text-sidebar-foreground font-mono">
          {address}
        </div>

        <div className="flex items-center gap-4">
          <Bell />

          {/* Divider */}
          <div className="h-6 w-0.5 bg-(--devider-color)" />

          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">User 1</div>
              <div className="text-xs text-sidebar-foreground">Người dùng</div>
            </div>
            <Ellipsis className="ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
