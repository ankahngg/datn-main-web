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



import { formatDate, shortAddress } from "@/utils";
import { nftStatusLabelMap, nftStatusVariantMap, UserNft } from "@/model/User";


type NftTableProps = {
  data: UserNft[];
};

export function UserNftTable({ data: nfts }: NftTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const columns = React.useMemo<ColumnDef<UserNft>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<UserNft>("ID"),
      },
      {
        accessorKey: "nftAddress",
        header: sortableHeader<UserNft>("NFT address"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{shortAddress(row.original.nftAddress)}</span>
        ),
      },
      {
        accessorKey: "tokenId",
        header: sortableHeader<UserNft>("Token ID"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{row.original.tokenId}</span>
        ),
      },
      {
        accessorKey: "name",
        header: sortableHeader<UserNft>("Tên NFT"),
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<UserNft>("Thời gian"),
        cell: ({ row }) => {
          return formatDate(row.original.timeCreated);
        },
      },
      {
        accessorKey: "status",
        header: sortableHeader<UserNft>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return <Badge variant={nftStatusVariantMap[status]}>{
            nftStatusLabelMap[status]
          }</Badge>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: nfts,
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
