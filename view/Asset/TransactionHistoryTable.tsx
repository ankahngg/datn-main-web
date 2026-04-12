"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import type { Transaction, TxStatus } from "./types";
import clsx from "clsx";

const statusVariantMap: Record<TxStatus, "success" | "warning" | "danger"> = {
  "Thành công": "success",
  "Đang xử lý": "warning",
  "Thất bại": "danger",
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 3,
  }).format(value);
}

type TransactionHistoryTableProps = {
  history: Transaction[];
};

export function TransactionHistoryTable({ history }: TransactionHistoryTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
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
    setGlobalFilter("");
    setAssetFilter("all");
    setTypeFilter("all");
    setColumnFilters([]);
  }, []);

  const columns = React.useMemo<ColumnDef<Transaction>[]>(
    () => [
        {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            ID
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
        }
        ,
      {
        accessorKey: "type",
        header: ({ column }) => (
          <Button
            
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Loại
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "asset",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tài sản
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Số lượng
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
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
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Thời gian
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Trạng thái
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
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
    <Card className="bg-sidebar text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Lịch sử</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* ///// Filters ///// */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Tìm theo loại, tài sản, thời gian..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full md:max-w-sm border-muted-foreground border-2"
          />
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center " >
            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
              onValueChange={(value) =>
                table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-full border-muted-foreground md:w-48">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent 
              position="popper"
              className="border-muted-foreground bg-background/90 text-foreground">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Thành công">Thành công</SelectItem>
                <SelectItem value="Đang xử lý">Đang xử lý</SelectItem>
                <SelectItem value="Thất bại">Thất bại</SelectItem>
              </SelectContent>
            </Select>

            {/* //// Clear Filters Button /// */}
            <Button
            className="bg-background text-foreground/80 hover:text-foreground hover:bg-background/90"
              size="sm"
              onClick={() => {
                clearFilters();
                table.setPageIndex(0);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

          {/* ///// Asset Filters ///// */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Tài sản:</span>
            <Button
              className={clsx(
                assetFilter === "all" ? "bg-background text-primary-foreground" : 
                "text-muted-foreground bg-background/50 hover:text-foreground hover:bg-background/90",
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
                assetFilter === asset ? "bg-background text-primary-foreground" : 
                "text-muted-foreground bg-background/50 hover:text-foreground hover:bg-background/90",
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

            {/* ///// Type Filters ///// */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Loại:</span>
            <Button
            className={clsx(
                typeFilter === "all" ? "bg-background text-primary-foreground" : 
                "text-muted-foreground bg-background/50 hover:text-foreground hover:bg-background/90",
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
                  typeFilter === "Gửi" ? "bg-background text-primary-foreground" : 
                  "text-muted-foreground bg-background/50 hover:text-foreground hover:bg-background/90",
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
                  typeFilter === "Rút" ? "bg-background text-primary-foreground" : 
                  "text-muted-foreground bg-background/50 hover:text-foreground hover:bg-background/90",
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

        {/* ///// Table ///// */}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="text-foreground">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Không có dữ liệu phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ///// Pagination ///// */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1}/{Math.max(table.getPageCount(), 1)}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className=" border-muted-foreground">
                <SelectValue placeholder="Số dòng" />
              </SelectTrigger>
              <SelectContent 
              position="popper"
              className="border-muted-foreground bg-background/90 text-foreground">
                <SelectItem value="5">5 dòng</SelectItem>
                <SelectItem value="10">10 dòng</SelectItem>
                <SelectItem value="20">20 dòng</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
