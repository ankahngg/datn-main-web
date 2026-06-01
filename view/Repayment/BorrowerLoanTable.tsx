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
  sortableHeader,
  useDataTableState,
} from "@/components/shared/data-table";


import { formatDate, formatUsdc, shortAddress } from "@/utils";
import { useAccount } from "wagmi";
import { is } from "zod/v4/locales";
import { UserLoan, UserLoanStatusLabelMap, UserLoanStatusVariantMap } from "@/model/Loan";
import { RepaymentActionType } from "@/model/enum";

type RepaymentTableProps = {
  loans: UserLoan[];
  isLoading?: boolean;
  onAction: (action: RepaymentActionType, loan: UserLoan) => void;
};

export function BorrowerLoanTable({
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

  const {address} = useAccount();

  const columns = React.useMemo<ColumnDef<UserLoan>[]>(
    () => [
      {
        accessorKey: "loanId",
        header: sortableHeader<UserLoan>("ID"),
      },
      {
        accessorKey: "lender",
        header: sortableHeader<UserLoan>("Người cho vay"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">
            {shortAddress(row.original.lender)}
          </span>
        ),
      },
      {
        accessorKey: "loanAmount",
        header: sortableHeader<UserLoan>("Số tiền vay"),
        cell: ({ row }) => {
          return formatUsdc(row.original.loanAmount);
        }
        ,
      },
      {
        accessorKey: "totalAmountHaveToPay",
        header: sortableHeader<UserLoan>("Tổng phải trả"),
        cell: ({ row }) => {
          return formatUsdc(row.original.totalAmountHaveToPay);
        }
      },
      {
        accessorKey: "amountPaid",
        header: sortableHeader<UserLoan>("Đã trả"),
        cell: ({ row }) => {
          return formatUsdc(row.original.amountPaid);
        }
      },
      {
        accessorKey: "status",
        header: sortableHeader<UserLoan>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={UserLoanStatusVariantMap[status]}>
              {UserLoanStatusLabelMap[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<UserLoan>("Thời gian tạo"),
        cell: ({ row }) => {
          return formatDate(row.original.timeCreated);
        }
        ,
      },
      {
        accessorKey: "duration",
        header: sortableHeader<UserLoan>("Thời hạn"),
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.duration}</span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="text-foreground">Hành động</span>,
        cell: ({ row }) => {
          const loan = row.original;
          // Chỉ cho phép khi nào khoản vay đang ở trạng thái CREATED và người dùng hiện tại là người vay
          const isPayable = loan.status === "CREATED" && address?.toLowerCase() === loan.borrower.toLowerCase();

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
                  disabled={!isPayable}
                  className="cursor-pointer"
                >
                  <Wallet className="size-4" />
                  Trả vay
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction("END_LOAN", loan)}
                  disabled={!isPayable}
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
          value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table
              .getColumn("status")
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
