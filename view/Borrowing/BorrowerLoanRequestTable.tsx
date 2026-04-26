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
  sortableHeader,
  useDataTableState,
} from "@/components/shared/data-table";

import {
  loanOfferStatusLabelMap,
  loanRequestStatusVariantMap,
  type LoanOffer,
} from "./types";

type BorrowerLoanRequestTableProps = {
  requests: LoanOffer[];
  title?: string;
  emptyText?: string;
  onCancelRequest: (offerId: bigint) => void;
};

type CancelRequestActionProps = {
  offer: LoanOffer;
  onCancelRequest: (offerId: bigint) => void;
};

function CancelRequestAction({
  offer,
  onCancelRequest,
}: CancelRequestActionProps) {
  const isCancelable = offer.status === "CREATED";
  const canOpenDialog = isCancelable && Boolean(onCancelRequest);

  return (
    <Button
      type="button"
      size="sm"
      className="h-8 bg-red-500/10 text-red-300 hover:bg-red-500/20"
      disabled={!canOpenDialog}
      onClick={() => onCancelRequest(offer.offerId)}
    >
      <XCircle className="size-4" />
      Hủy đề nghị
    </Button>
  );
}

export function BorrowerLoanRequestTable({
  requests,
  title,
  emptyText,
  onCancelRequest,
}: BorrowerLoanRequestTableProps) {
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
          return (
            <Badge variant={loanRequestStatusVariantMap[status]}>
              {loanOfferStatusLabelMap[status]}
            </Badge>
          );
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
          return (
            <CancelRequestAction
              offer={row.original}
              onCancelRequest={onCancelRequest}
            />
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
    <DataTableCard title={title ?? "Danh sách offer của người tạo đơn"}>
      <DataTableToolbar
        searchPlaceholder="Tìm theo ID, số tiền vay, kỳ hạn..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        statusFilter={{
          value:
            (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { value: "all", label: "Tất cả trạng thái" },
            {
              value: "PENDING_CREATED",
              label: loanOfferStatusLabelMap.PENDING_CREATED,
            },
            { value: "CREATED", label: loanOfferStatusLabelMap.CREATED },
            {
              value: "PENDING_CANCELED",
              label: loanOfferStatusLabelMap.PENDING_CANCELED,
            },
            { value: "CANCELED", label: loanOfferStatusLabelMap.CANCELED },
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
