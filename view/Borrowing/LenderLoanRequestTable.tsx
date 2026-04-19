"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
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

import { loanRequestStatusVariantMap, type LoanOffer } from "./types";


type LenderLoanRequestTableProps = {
  requests: LoanOffer[];
  title?: string;
  emptyText?: string;
  onCancelRequest?: (offerId: number) => void;
};

export function LenderLoanRequestTable({
  requests,
  title,
  emptyText,
  onCancelRequest,
}: LenderLoanRequestTableProps) {
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const columns = React.useMemo<ColumnDef<LoanOffer>[]>(
    () => [
      {
        accessorKey: "id",
        header: sortableHeader<LoanOffer>("ID"),
      },
      {
        accessorKey: "requester",
        header: sortableHeader<LoanOffer>("Người đề nghị"),
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{shortAddress(row.original.requester)}</span>
        ),
      },
      {
        accessorKey: "loanAmount",
        header: sortableHeader<LoanOffer>("Số tiền vay"),
      },
      {
        accessorKey: "interestRate",
        header: sortableHeader<LoanOffer>("Lãi suất (%)"),
      },
      {
        accessorKey: "duration",
        header: sortableHeader<LoanOffer>("Kỳ hạn"),
      },
      {
        accessorKey: "status",
        header: sortableHeader<LoanOffer>("Trạng thái"),
        cell: ({ row }) => {
          const status = row.original.status;
          return <Badge variant={loanRequestStatusVariantMap[status]}>{status}</Badge>;
        },
      },
      {
        accessorKey: "createdAt",
        header: sortableHeader<LoanOffer>("Ngày tạo"),
      },
      {
        id: "actions",
        header: () => <span className="text-foreground">Thao tác</span>,
        cell: ({ row }) => {
          const offer = row.original;
          const isCancelable = offer.status === "Chờ xử lý";

          return (
            <Button
              type="button"
              size="sm"
              onClick={() => onCancelRequest?.(offer.id)}
              disabled={!isCancelable}
              className="h-8 bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="size-4" />
              Hủy đề nghị
            </Button>
          );
        },
      },
    ],
    [onCancelRequest],
  );

  const table = useReactTable({
    data: requests,
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
    <DataTableCard title={title ?? "Danh sách offer của người cho vay"}>
      <DataTableToolbar
        searchPlaceholder="Tìm theo ID, người đề nghị, số tiền vay..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value: (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table.getColumn("status")?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            { value: "Chờ xử lý", label: "Chờ xử lý" },
            { value: "Tạo thành công", label: "Tạo thành công" },
            { value: "Thất bại", label: "Thất bại" },
            { value: "Đã hủy", label: "Đã hủy" },
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
        emptyMessage={emptyText ?? "Chưa có offer nào"}
      />

      <DataTablePagination table={table} />
    </DataTableCard>
  );
}