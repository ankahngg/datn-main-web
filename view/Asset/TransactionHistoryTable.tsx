"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

import type { Transaction, TxStatus } from "./types";
import clsx from "clsx";

const statusVariantMap: Record<TxStatus, "success" | "warning" | "danger"> = {
  "Thành công": "success",
  "Đang xử lý": "warning",
  "Thất bại": "danger",
};

function formatAmount(value: number | string) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(numericValue);
}

type TransactionHistoryTableProps = {
  history: Transaction[];
};

export function TransactionHistoryTable({ history }: TransactionHistoryTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters: clearTableFilters,
  } = useDataTableState();
  const [assetFilter, setAssetFilter] = React.useState<Transaction["asset"] | "all">("all");
  const [typeFilter, setTypeFilter] = React.useState<Transaction["type"] | "all">("all");

  const assetOptions = React.useMemo(
    () => Array.from(new Set(history.map((tx) => tx.asset))),
    [history]
  );

  const filteredHistory = React.useMemo(
    () =>
      history.filter((tx) => {
        const matchesAsset = assetFilter === "all" || tx.asset === assetFilter;
        const matchesType = typeFilter === "all" || tx.type === typeFilter;
        return matchesAsset && matchesType;
      }),
    [history, assetFilter, typeFilter]
  );

  const clearFilters = React.useCallback(() => {
    clearTableFilters();
    setAssetFilter("all");
    setTypeFilter("all");
  }, [clearTableFilters]);

  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<Transaction>("ID"),
      },
      {
        accessorKey: "type",
        header: sortableHeader<Transaction>("Loại"),
      },
      {
        accessorKey: "asset",
        header: sortableHeader<Transaction>("Tài sản"),
      },
      {
        accessorKey: "amount",
        header: sortableHeader<Transaction>("Số lượng"),
        cell: ({ row }) => {
          const amount = row.original.amount;
          const asset = row.original.asset;
          return (
            <span>
              {formatAmount(amount)} {asset}
            </span>
          );
        },
      },
      {
        accessorKey: "time",
        header: sortableHeader<Transaction>("Thời gian"),
      },
      {
        accessorKey: "status",
        header: sortableHeader<Transaction>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
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
        pageSize: 5,
      },
    },
  });

  return (
    <DataTableCard title="Lịch sử">
      <DataTableToolbar
        searchPlaceholder="Tìm theo loại, tài sản, thời gian..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) => table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            { value: "Thành công", label: "Thành công" },
            { value: "Đang xử lý", label: "Đang xử lý" },
            { value: "Thất bại", label: "Thất bại" },
          ],
        }}
        onClearFilters={() => {
          clearFilters();
          table.setPageIndex(0);
        }}
        extraFilters={
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Tài sản:</span>
              <Button
                className={clsx(
                  assetFilter === "all"
                    ? "bg-background text-primary-foreground"
                    : "bg-background/50 text-muted-foreground hover:bg-background/90 hover:text-foreground"
                )}
                variant={assetFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setAssetFilter("all");
                  table.setPageIndex(0);
                }}
              >
                Tất cả
              </Button>
              {assetOptions.map((asset) => (
                <Button
                  className={clsx(
                    assetFilter === asset
                      ? "bg-background text-primary-foreground"
                      : "bg-background/50 text-muted-foreground hover:bg-background/90 hover:text-foreground"
                  )}
                  key={asset}
                  variant={assetFilter === asset ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setAssetFilter(asset);
                    table.setPageIndex(0);
                  }}
                >
                  {asset}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Loại:</span>
              <Button
                className={clsx(
                  typeFilter === "all"
                    ? "bg-background text-primary-foreground"
                    : "bg-background/50 text-muted-foreground hover:bg-background/90 hover:text-foreground"
                )}
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTypeFilter("all");
                  table.setPageIndex(0);
                }}
              >
                Tất cả
              </Button>
              <Button
                className={clsx(
                  typeFilter === "Gửi"
                    ? "bg-background text-primary-foreground"
                    : "bg-background/50 text-muted-foreground hover:bg-background/90 hover:text-foreground"
                )}
                variant={typeFilter === "Gửi" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTypeFilter("Gửi");
                  table.setPageIndex(0);
                }}
              >
                Gửi
              </Button>
              <Button
                className={clsx(
                  typeFilter === "Rút"
                    ? "bg-background text-primary-foreground"
                    : "bg-background/50 text-muted-foreground hover:bg-background/90 hover:text-foreground"
                )}
                variant={typeFilter === "Rút" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTypeFilter("Rút");
                  table.setPageIndex(0);
                }}
              >
                Rút
              </Button>
            </div>
          </div>
        }
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
