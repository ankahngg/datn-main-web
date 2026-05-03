"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
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

import { payActionLabelMap, payActionVariantMap } from "./types";
import type { LoanPayTransactionResponse } from "@/service/modules/loan";

function formatAmount(value: bigint | number | string) {
  const numericValue = typeof value === "bigint" ? Number(value) / 1e6 : Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 6,
  }).format(numericValue);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function truncateAddress(address: string, startChars = 6, endChars = 4) {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

type PaymentHistoryTableProps = {
  history: LoanPayTransactionResponse[];
};

export function PaymentHistoryTable({ history }: PaymentHistoryTableProps) {
  const { sorting, setSorting, columnFilters, setColumnFilters, globalFilter, setGlobalFilter, clearFilters: clearTableFilters } = useDataTableState();
  const [actionFilter, setActionFilter] = React.useState<LoanPayTransactionResponse["action"] | "all">("all");

  const actionOptions = React.useMemo(
    () => Array.from(new Set(history.map((tx) => tx.action))),
    [history]
  );

  const filteredHistory = React.useMemo(
    () =>
      history.filter((tx) => {
        const matchesAction = actionFilter === "all" || tx.action === actionFilter;
        return matchesAction;
      }),
    [history, actionFilter]
  );

  const clearFilters = React.useCallback(() => {
    clearTableFilters();
    setActionFilter("all");
  }, [clearTableFilters]);

  const columns = React.useMemo<ColumnDef<LoanPayTransactionResponse>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<LoanPayTransactionResponse>("ID"),
      },
      {
        accessorKey: "action",
        header: sortableHeader<LoanPayTransactionResponse>("Hành động"),
        cell: ({ row }) => {
          const action = row.original.action;
          return <Badge variant={payActionVariantMap[action]}>{payActionLabelMap[action]}</Badge>;
        },
      },
      {
        accessorKey: "amount",
        header: sortableHeader<LoanPayTransactionResponse>("Số tiền"),
        cell: ({ row }) => {
          const amount = row.original.amount;
          return <span>{formatAmount(amount)} USDC</span>;
        },
      },
      {
        accessorKey: "amountPaid",
        header: sortableHeader<LoanPayTransactionResponse>("Đã thanh toán"),
        cell: ({ row }) => {
          const amountPaid = row.original.amountPaid;
          return <span>{formatAmount(amountPaid)} USDC</span>;
        },
      },
      {
        accessorKey: "totalAmountHaveToPay",
        header: sortableHeader<LoanPayTransactionResponse>("Tổng phải trả"),
        cell: ({ row }) => {
          const total = row.original.totalAmountHaveToPay;
          return <span>{formatAmount(total)} USDC</span>;
        },
      },
      {
        accessorKey: "txHash",
        header: sortableHeader<LoanPayTransactionResponse>("TX Hash"),
        cell: ({ row }) => {
          const txHash = row.original.txHash;
          return (
            <span className="font-mono text-xs text-muted-foreground">
              {truncateAddress(txHash, 6, 4)}
            </span>
          );
        },
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<LoanPayTransactionResponse>("Thời gian"),
        cell: ({ row }) => {
          const time = row.original.timeCreated;
          return <span className="text-sm text-foreground">{formatDate(time)}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredHistory,
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
        pageSize: 10,
      },
    },
  });

  return (
    <DataTableCard title="Lịch sử giao dịch">
      <DataTableToolbar
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        searchPlaceholder="Tìm theo ID, TX Hash, thời gian..."
        onClearFilters={clearFilters}
        statusFilter={
          actionOptions.length > 0
            ? {
                value: actionFilter as string,
                placeholder: "Tất cả hành động",
                options: [
                  { value: "all", label: "Tất cả hành động" },
                  ...actionOptions.map((action) => ({
                    value: action,
                    label: payActionLabelMap[action],
                  })),
                ],
                onChange: (value) => setActionFilter(value as LoanPayTransactionResponse["action"] | "all"),
              }
            : undefined
        }
      />
      <DataTableContent
        table={table}
        columnsLength={columns.length}
        emptyMessage="Chưa có lịch sử thanh toán"
      />
      <DataTablePagination table={table} />
    </DataTableCard>
  );
}
