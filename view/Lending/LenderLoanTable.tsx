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
import { Eye, History, MoreHorizontal, NotepadText, Scale } from "lucide-react";
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
  sortableHeader,
  useDataTableState,
} from "@/components/shared/data-table";
import { addDateDuration, isNotProcessing, shortAddress } from "@/utils";
import { formatUnits } from "viem";
import { UserLoan, UserLoanStatusLabelMap, UserLoanStatusVariantMap } from "@/model/Loan";


type LendingTableProps = {
  loans: UserLoan[];
  isLoading?: boolean;
  onAction: (action: string, loan: UserLoan) => void;
};

export function LenderLoanTable({ loans, isLoading = false, onAction }: LendingTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const columns = React.useMemo<ColumnDef<UserLoan>[]>(
    () => [
      {
        accessorKey: "borrower",
        header: sortableHeader<UserLoan>("Người vay"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">
            {shortAddress(row.original.borrower)}
          </span>
        ),
      },
      {
        accessorKey: "loanAmount",
        header: sortableHeader<UserLoan>("Số tiền vay"),
        cell: ({ row }) => <span className="text-foreground">{formatUnits(row.original.loanAmount, 6)}</span>,
      },
      {
        accessorKey: "totalAmountHaveToPay",
        header: sortableHeader<UserLoan>("Tổng phải trả"),
        cell: ({ row }) => <span className="text-foreground">{formatUnits(row.original.totalAmountHaveToPay, 6)}</span>,
      },
      {
        accessorKey: "amountPaid",
        header: sortableHeader<UserLoan>("Đã trả"),
        cell: ({ row }) => <span className="text-foreground">{formatUnits(row.original.amountPaid, 6)}</span>,
      },
      {
        accessorKey: "loanStatus",
        header: sortableHeader<UserLoan>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return <Badge variant={UserLoanStatusVariantMap[status]}>{UserLoanStatusLabelMap[status]}</Badge>;
        },
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<UserLoan>("Thời gian tạo"),
        cell: ({ row }) => (
          <span className="text-foreground">
            {new Date(row.original.timeCreated).toLocaleDateString("vi-VN")}
          </span>
        ),
      },
      {
        accessorKey: "duration",
        header: sortableHeader<UserLoan>("Thời hạn"),
        cell: ({ row }) => <span className="text-foreground">{row.original.duration.toString()}</span>,
      },
      {
        id: "actions",
        header: () => <span className="-ml-3 bg-sidebar text-muted-foreground text-sm">Hành động</span>,
        cell: ({ row }) => {
          const loan = row.original;
          // const canAuction = isNotProcessing(loan.status) && addDateDuration(loan.timeCreated, loan.duration) < new Date().toISOString();
          const canAuction = isNotProcessing(loan.status);
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Mở menu thao tác</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-sidebar border border-border text-foreground">
                <DropdownMenuLabel className="text-foreground">Hành động</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAction("VIEW_DETAILS", loan)} className="cursor-pointer">
                  <Eye className="size-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction("VIEW_HISTORY", loan)} className="cursor-pointer">
                  <History className="size-4" />
                  Xem lịch sử vay
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction("VIEW_APPLICATION", loan)} className="cursor-pointer">
                  <NotepadText className="size-4"/>
                  Xem đơn vay
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction("START_AUCTION", loan)} className="cursor-pointer"
                  variant="destructive"
                  disabled={!canAuction}
                  >
                  <Scale className="size-4"/>
                  Đấu giá khoản vay
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onAction],
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
    <DataTableCard title="Danh sách khoản cho vay">
      <DataTableToolbar
        searchPlaceholder="Tìm theo người vay, số tiền..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value: (table.getColumn("loanStatus")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table.getColumn("loanStatus")?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            { value: "PENDING_CREATED", label: UserLoanStatusLabelMap.PENDING_CREATED },
            { value: "CREATED", label: UserLoanStatusLabelMap.CREATED },
            { value: "PENDING_PAID", label: UserLoanStatusLabelMap.PENDING_PAID },
            { value: "PAID", label: UserLoanStatusLabelMap.PAID },
            { value: "PENDING_AUCTION", label: UserLoanStatusLabelMap.PENDING_AUCTION },
            { value: "AUCTION", label: UserLoanStatusLabelMap.AUCTION },
            { value: "PENDING_LIQUIDATION", label: UserLoanStatusLabelMap.PENDING_LIQUIDATION },
            { value: "LIQUIDATED", label: UserLoanStatusLabelMap.LIQUIDATED },
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
        emptyMessage={isLoading ? "Đang tải dữ liệu..." : "Không có khoản cho vay phù hợp."}
      />

      <DataTablePagination table={table} />
    </DataTableCard>
  );
}