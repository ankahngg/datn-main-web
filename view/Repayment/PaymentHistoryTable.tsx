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


import { LoanPayTransaction } from "@/model/LoanPayTransaction";
import { formatDate, formatUsdc, shortAddress } from "@/utils";
import { transactionStatusVariantMap, transactionStatusLabelMap } from "@/model/BankTransaction";
import { UserLoanStatusVariantMap, UserLoanStatusLabelMap, payActionLabelMap, payActionVariantMap } from "@/model/Loan";

type PaymentHistoryTableProps = {
  history: LoanPayTransaction[];
};

export function PaymentHistoryTable({ history }: PaymentHistoryTableProps) {
  const { sorting, setSorting, columnFilters, setColumnFilters, globalFilter, setGlobalFilter, clearFilters} = useDataTableState();
  

  const columns = React.useMemo<ColumnDef<LoanPayTransaction>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<LoanPayTransaction>("ID"),
      },
      {
        accessorKey: "action",
        header: sortableHeader<LoanPayTransaction>("Hành động"),
        cell: ({ row }) => {
          const action = row.original.action;
          return <Badge variant={payActionVariantMap[action]}>{payActionLabelMap[action]}</Badge>;
        },
      },
      {
        accessorKey: "amount",
        header: sortableHeader<LoanPayTransaction>("Số tiền"),
        cell: ({ row }) => {
          const amount = row.original.amount;
          return <span>{formatUsdc(amount)} USDC</span>;
        },
      },
      {
        accessorKey: "amountPaid",
        header: sortableHeader<LoanPayTransaction>("Đã thanh toán"),
        cell: ({ row }) => {
          const amountPaid = row.original.amountPaid;
          return <span>{formatUsdc(amountPaid)} USDC</span>;
        },
      },
      {
        accessorKey: "remainingAmount",
        header: sortableHeader<LoanPayTransaction>("Còn lại"),
        cell: ({ row }) => {
          const total = row.original.remainingAmount;
          return <span>{formatUsdc(total)} USDC</span>;
        },
      },
      
      {
        accessorKey: "txHash",
        header: sortableHeader<LoanPayTransaction>("TX Hash"),
        cell: ({ row }) => {
          const txHash = row.original.txHash;
          return (
            <span className="font-mono text-xs ">
              {
                shortAddress(txHash)
              }
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: sortableHeader<LoanPayTransaction>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={transactionStatusVariantMap[status]}>
              {transactionStatusLabelMap[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<LoanPayTransaction>("Thời gian"),
        cell: ({ row }) => {
          const time = row.original.timeCreated;
          return <span className="text-sm text-foreground">{formatDate(time)}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: history,
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
        statusFilter={{
          value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value),

          options: [
            { label: "Tất cả", value: "all" },
            ...Object.entries(transactionStatusLabelMap).map(([value, label]) => ({
              label,
              value,
            })),
          ]
        }
        }
        onClearFilters={() => {
          clearFilters();
          table.setPageIndex(0);
        }}
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
