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
  shortAddress,
  sortableHeader,
  useDataTableState,
} from "@/components/shared/data-table";

import type { NftDeposit, NftDepositStatus } from "./types";

const nftDepositStatusVariantMap: Record<NftDepositStatus, "success" | "danger"> = {
  "Đã gửi": "success",
  "Đã rút": "danger",
};

type NftDepositTableProps = {
  deposits: NftDeposit[];
};

export function NftDepositTable({ deposits }: NftDepositTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const columns = React.useMemo<ColumnDef<NftDeposit>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<NftDeposit>("ID"),
      },
      {
        accessorKey: "nftAddress",
        header: sortableHeader<NftDeposit>("NFT address"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{shortAddress(row.original.nftAddress)}</span>
        ),
      },
      {
        accessorKey: "tokenId",
        header: sortableHeader<NftDeposit>("Token ID"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{row.original.tokenId}</span>
        ),
      },
      {
        accessorKey: "name",
        header: sortableHeader<NftDeposit>("Tên NFT"),
      },
      {
        accessorKey: "depositedAt",
        header: sortableHeader<NftDeposit>("Thời gian deposit"),
      },
      {
        accessorKey: "status",
        header: sortableHeader<NftDeposit>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return <Badge variant={nftDepositStatusVariantMap[status]}>{status}</Badge>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: deposits,
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
    <DataTableCard title="Danh sách NFT">
      <DataTableToolbar
        searchPlaceholder="Tìm theo địa chỉ, token, bộ sưu tập, thời gian..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) => table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            { value: "Đã gửi", label: "Đã gửi" },
            { value: "Đã rút", label: "Đã rút" },
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
