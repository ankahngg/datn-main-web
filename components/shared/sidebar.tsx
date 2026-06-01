"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Landmark } from "lucide-react";
import { FileText } from "lucide-react";
import { ChartColumn } from "lucide-react";
import { HandCoins } from "lucide-react";
import { Banknote } from "lucide-react";
import { ArrowRightLeft } from "lucide-react";
import { Scale } from "lucide-react";
import { ActivitySquare } from "lucide-react";
import { Boxes } from "lucide-react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatDate } from "@/utils";
function Leftbar() {
  return (
    <Sidebar>
      <div className="p-4">
        <SidebarHeader
          className="text-xl text-sidebar-primary-foreground font-mono
        border-b-2 border-(--devider-color) pb-4 flex-row"
        >
          <Boxes className="mr-2" />
          Lending Web
        </SidebarHeader>
        <SidebarContent className="mt-4">
          <SidebarMenu>
            <SidebarMenuItem className="font-heading text-xs p-2">
              <div>
                {
                  formatDate(new Date().toISOString())
                }
              </div>
                <div className="italic">Múi giờ: GMT+7 (Việt Nam)</div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard" className="font-heading">
                  <ChartColumn className="mr-2" />
                  Trang chủ
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/assets" className="font-heading">
                  <Landmark className="mr-2" />
                  Gửi/rút tài sản
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/borrowing" className="font-heading">
                  <FileText className="mr-2" />
                  Tạo đơn vay
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/payment" className="font-heading">
                  <HandCoins className="mr-2" />
                  Trả vay
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/lending" className="font-heading">
                  <Banknote className="mr-2" />
                  Cho vay
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/transfer" className="font-heading">
                  <ArrowRightLeft className="mr-2" />
                  Chuyển nhượng vay
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/activity" className="font-heading">
                  <ActivitySquare className="mr-2" />
                  Hoạt động
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/auction" className="font-heading">
                  <Scale className="mr-2" />
                  Đấu giá
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter />
      </div>
    </Sidebar>
  );
}

export default Leftbar;
