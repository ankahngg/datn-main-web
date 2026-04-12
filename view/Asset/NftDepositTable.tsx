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

import type { NftDeposit, NftDepositStatus } from "./types";

const nftDepositStatusVariantMap: Record<NftDepositStatus, "success" | "outline"> = {
  "Đã deposit": "success",
  "Đã rút": "outline",
};

type NftDepositTableProps = {
  deposits: NftDeposit[];
};

function shortAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function NftDepositTable({ deposits }: NftDepositTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const clearFilters = React.useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
  }, []);

  const columns = React.useMemo<ColumnDef<NftDeposit>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            ID
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "nftAddress",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            NFT address
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{shortAddress(row.original.nftAddress)}</span>
        ),
      },
      {
        accessorKey: "tokenId",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Token ID
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{row.original.tokenId}</span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tên NFT
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "depositedAt",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Thời gian deposit
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Trạng thái
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
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
    <Card className="bg-sidebar text-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Danh sách NFT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Tìm theo địa chỉ, token, bộ sưu tập, thời gian..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full border-2 border-muted-foreground md:max-w-sm"
          />
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
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
              className="border-muted-foreground bg-background/90 text-zinc-100"
              position="popper">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Đã deposit">Đã deposit</SelectItem>
                <SelectItem value="Đã rút">Đã rút</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="bg-background text-foreground/80 hover:bg-background/90 hover:text-foreground"
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

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {table.getState().pagination.pageIndex + 1}/{Math.max(table.getPageCount(), 1)}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-32.5 border-muted-foreground">
                <SelectValue placeholder="Số dòng" />
              </SelectTrigger>
              <SelectContent 
              position="popper"
              className="border-muted-foreground bg-background/90 text-zinc-100">
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
