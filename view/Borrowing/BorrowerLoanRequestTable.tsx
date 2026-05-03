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
import { CheckCircle, MoreHorizontal, XCircle } from "lucide-react";
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
import { applicationStatusVariantMap, applicationStatusLabelMap } from "@/model/LoanApplication";
import { LoanOffer } from "@/model/LoanOffer";
import { formatUsdc } from "@/utils";



type BorrowerLoanRequestTableProps = {
  requests: LoanOffer[];
  title?: string;
  emptyText?: string;
  onCancelRequest: (offerId: bigint) => void;
  onAcceptRequest?: (offerId: bigint) => void;
  canAcceptRequest?: (offer: LoanOffer) => boolean;
  hilightRowId?: string;
};

export function BorrowerLoanRequestTable({
  requests,
  title,
  emptyText,
  onCancelRequest,
  onAcceptRequest,
  canAcceptRequest,
  hilightRowId,
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
        accessorKey: "offerId",
        header: sortableHeader<LoanOffer>("ID"),
      },
      {
        accessorKey: "loanAmount",
        header: sortableHeader<LoanOffer>("Số tiền vay"),
        cell: ({ row }) => {           
          return formatUsdc(row.original.loanAmount);
        }
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
            <Badge variant={applicationStatusVariantMap[status]}>
              {applicationStatusLabelMap[status]}
            </Badge>
          );
        },
      },
      {
        accessorKey: "timeCreated",
        header: sortableHeader<LoanOffer>("Ngày tạo"),
      },
      {
        id: "actions",
        header: () => <span className="text-foreground">Thao tác</span>,
        cell: ({ row }) => {
          const offer = row.original;
          const isAcceptable = canAcceptRequest ? canAcceptRequest(offer) : true;
          const isCancelable = offer.status === "CREATED";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Mo menu thao tac</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-sidebar border border-border text-foreground">
                <DropdownMenuLabel className="text-foreground">Hành động</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {onAcceptRequest && (
                  <DropdownMenuItem
                    onClick={() => onAcceptRequest(offer.offerId)}
                    disabled={!isAcceptable}
                    className="cursor-pointer"
                  >
                    <CheckCircle className="size-4" />
                    Chấp nhận vay
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onCancelRequest(offer.offerId)}
                  variant="destructive"
                  disabled={!isCancelable}
                  className="cursor-pointer"
                >
                  <XCircle className="size-4" />
                  Hủy đề nghị
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canAcceptRequest, onAcceptRequest, onCancelRequest],
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
              label: applicationStatusLabelMap.PENDING_CREATED,
            },
            { value: "CREATED", label: applicationStatusLabelMap.CREATED },
            {
              value: "PENDING_CANCELED",
              label: applicationStatusLabelMap.PENDING_CANCELED,
            },
            { value: "CANCELED", label: applicationStatusLabelMap.CANCELED },
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
        highlightRowId={hilightRowId}
      />

      <DataTablePagination table={table} />
    </DataTableCard>
  );
}
