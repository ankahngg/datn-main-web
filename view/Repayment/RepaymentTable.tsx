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
import { Eye, MoreHorizontal, History, Wallet, XCircle } from "lucide-react";
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
  loanStatusLabelMap,
  loanStatusVariantMap,
  type LoanForRepayment,
  type RepaymentActionType,
} from "./types";

type RepaymentTableProps = {
  loans: LoanForRepayment[];
  isLoading?: boolean;
  onAction: (action: RepaymentActionType, loan: LoanForRepayment) => void;
};

export function RepaymentTable({
  loans,
  isLoading = false,
  onAction,
}: RepaymentTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const columns = React.useMemo<ColumnDef<LoanForRepayment>[]>(
    () => [
      {
        accessorKey: "lender",
        header: sortableHeader<LoanForRepayment>("Người cho vay"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">
            {shortAddress(row.original.lender)}
          </span>
        ),
      },
      {
        accessorKey: "loanAmount",
        header: sortableHeader<LoanForRepayment>("Số tiền vay"),
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.loanAmount}</span>
        ),
      },
      {
        accessorKey: "totalAmountHaveToPay",
        header: sortableHeader<LoanForRepayment>("Tổng phải trả"),
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.totalAmountHaveToPay}</span>
        ),
      },
      {
        accessorKey: "amountPaid",
        header: sortableHeader<LoanForRepayment>("Đã trả"),
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.amountPaid}</span>
        ),
      },
      {
        accessorKey: "loanStatus",
        header: sortableHeader<LoanForRepayment>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.loanStatus;
          return (
            <Badge variant={loanStatusVariantMap[status]}>
              {loanStatusLabelMap[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<LoanForRepayment>("Thời gian tạo"),
        cell: ({ row }) => (
          <span className="text-foreground">
            {new Date(row.original.timeCreated).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        accessorKey: "duration",
        header: sortableHeader<LoanForRepayment>("Thời hạn"),
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.duration}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="text-foreground">Hành động</span>,
        cell: ({ row }) => {
          const loan = row.original;
          const isRepayable = loan.loanStatus === "CREATED";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Mở menu thao tác</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-sidebar border border-border text-foreground"
              >
                <DropdownMenuLabel className="text-foreground">
                  Hành động
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onAction("VIEW_DETAILS", loan)}
                  className="cursor-pointer"
                >
                  <Eye className="size-4" />
                  Xem chi tiết
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onAction("VIEW_HISTORY", loan)}
                  className="cursor-pointer"
                >
                  <History className="size-4" />
                  Xem lịch sử
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onAction("REPAY", loan)}
                  disabled={!isRepayable}
                  className="cursor-pointer"
                >
                  <Wallet className="size-4" />
                  Trả vay
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onAction("END_LOAN", loan)}
                  disabled={!isRepayable}
                  variant="destructive"
                  className="cursor-pointer"
                >
                  <XCircle className="size-4" />
                  Kết thúc khoản vay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onAction]
  );

  const table = useReactTable({
    data: loans,
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
    <DataTableCard title="Danh sách khoản vay cần trả">
      <DataTableToolbar
        searchPlaceholder="Tìm theo người cho vay, số tiền..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value: (table.getColumn("loanStatus")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table
              .getColumn("loanStatus")
              ?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            { value: "CREATED", label: "Đã tạo" },
            { value: "PENDING_PAID", label: "Đang thanh toán" },
            { value: "PENDING_AUCTION", label: "Đang đấu giá" },
            { value: "AUCTION", label: "Đang bán đấu giá" },
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
        emptyMessage={isLoading ? "Đang tải dữ liệu..." : "Không có dữ liệu phù hợp."}
      />

      <DataTablePagination table={table} />
    </DataTableCard>
  );
}
