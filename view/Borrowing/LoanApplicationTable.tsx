"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, WalletCards, XCircle } from "lucide-react";
import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DataTableCard,
  DataTableContent,
  DataTablePagination,
  DataTableToolbar,
  shortAddress,
  sortableHeader,
  useDataTableState,
} from "@/components/shared/data-table";

import { loanStatusVariantMap, type LoanApplication } from "./types";



type LoanApplicationTableProps = {
  applications: LoanApplication[];
  offerCountByLoanId?: Record<number, number>;
  onViewOffers?: (loanId: number) => void;
  onCancelApplication?: (loanId: number) => void;
  onViewLoan?: (loanId: number) => void;
};

export function LoanApplicationTable({
  applications,
  offerCountByLoanId,
  onViewOffers,
  onCancelApplication,
  onViewLoan,
}: LoanApplicationTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const columns = React.useMemo<ColumnDef<LoanApplication>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<LoanApplication>("ID"),
      },
      {
        accessorKey: "borrower",
        header: sortableHeader<LoanApplication>("Người vay"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">
            {shortAddress(row.original.borrower)}
          </span>
        ),
      },
      {
        accessorKey: "collateralAsset",
        header: sortableHeader<LoanApplication>("Tài sản thế chấp"),
      },
      {
        id: "assetName",
        header: sortableHeader<LoanApplication>("Tên tài sản"),
        cell: ({ row }) => {
          const { collateralAsset, nftName } = row.original;
          if (collateralAsset === "NFT") {
            return <span className="text-foreground">{nftName || "N/A"}</span>;
          }
          return <span className="text-foreground">{collateralAsset === "ETH" ? "ethereum" : collateralAsset}</span>;
        },
      },
      {
        accessorKey: "collateralAmount",
        header: sortableHeader<LoanApplication>("Số lượng thế chấp"),
      },
      {
        accessorKey: "status",
        header: sortableHeader<LoanApplication>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={loanStatusVariantMap[status]}>
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: sortableHeader<LoanApplication>("Ngày tạo"),
      },
      {
        id: "actions",
        header: () => <span className="text-foreground">Thao tác</span>,
        cell: ({ row }) => {
          const loan = row.original;
          const loanId = loan.id;
          const offerCount = offerCountByLoanId?.[loanId] ?? 0;
          const isAccepted = loan.status === "Đã chấp nhận";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button  size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Mở menu thao tác</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-sidebar border border-border text-foreground">
                <DropdownMenuLabel className="text-foreground">Hành động</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => onViewOffers?.(loanId)} className="cursor-pointer">
                  <Eye className="size-4" />
                  Xem Offer vay ({offerCount})
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onCancelApplication?.(loanId)}
                  variant="destructive"
                  disabled={isAccepted}
                  className="cursor-pointer"
                >
                  <XCircle className="size-4" />
                  Hủy đơn vay
                </DropdownMenuItem>

                {isAccepted && (
                  <DropdownMenuItem onClick={() => onViewLoan?.(loanId)} className="cursor-pointer">
                    <WalletCards className="size-4" />
                    Xem khoản vay
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [offerCountByLoanId, onCancelApplication, onViewLoan, onViewOffers]
  );

  const table = useReactTable({
    data: applications,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <DataTableCard title="Danh sách đơn vay của bạn">
      <DataTableToolbar
        searchPlaceholder="Tìm theo ID, người vay, tài sản..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            { value: "Chờ xử lý", label: "Chờ xử lý" },
            { value: "Đợi chấp nhận", label: "Đợi chấp nhận" },
            { value: "Đã chấp nhận", label: "Đã chấp nhận" },
          ],
        }}
        onClearFilters={() => {
          clearFilters();
          table.setPageIndex(0);
        }}
      />

      <DataTableContent
        table={table}
        columnsLength={columns.length}
        emptyMessage="Không có dữ liệu phù hợp."
      />

      <DataTablePagination table={table} />
    </DataTableCard>
  );
}
