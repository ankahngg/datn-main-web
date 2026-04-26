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

import {
  loanApplicationStatusLabelMap,
  loanStatusVariantMap,
  type LoanApplication,
} from "./types";



type LoanApplicationTableProps = {
  applications: LoanApplication[];
  onViewOffers?: (loanApplicationId: bigint) => void;
  onCancelApplication?: (loanApplicationId: bigint) => void;
  onViewLoan?: (loanId: bigint) => void;
};

export function LoanApplicationTable({
  applications,
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
              {loanApplicationStatusLabelMap[status]}
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
          const loanApplication = row.original;
          const loanApplicationId = loanApplication.applicationId;
          const offerCount = loanApplication.offerCount || 0;
          const isCreated = loanApplication.status === "CREATED";
          const isAccepted = loanApplication.status === "ACCEPTED";

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

                <DropdownMenuItem onClick={() => onViewOffers?.(loanApplicationId)} className="cursor-pointer">
                  <Eye className="size-4" />
                  Xem Offer vay ({offerCount})
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onCancelApplication?.(loanApplicationId)}
                  variant="destructive"
                  disabled={!isCreated}
                  className="cursor-pointer"
                >
                  <XCircle className="size-4" />
                  Hủy đơn vay
                </DropdownMenuItem>

                {isAccepted && (
                  <DropdownMenuItem onClick={() => onViewLoan?.(loanApplicationId)} className="cursor-pointer">
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
    [onCancelApplication, onViewLoan, onViewOffers]
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
            { value: "PENDING_CREATED", label: loanApplicationStatusLabelMap.PENDING_CREATED },
            { value: "CREATED", label: loanApplicationStatusLabelMap.CREATED },
            { value: "PENDING_ACCEPTED", label: loanApplicationStatusLabelMap.PENDING_ACCEPTED },
            { value: "ACCEPTED", label: loanApplicationStatusLabelMap.ACCEPTED },
            { value: "PENDING_CANCELED", label: loanApplicationStatusLabelMap.PENDING_CANCELED },
            { value: "CANCELED", label: loanApplicationStatusLabelMap.CANCELED },
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
