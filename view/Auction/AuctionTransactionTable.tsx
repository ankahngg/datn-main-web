""
import ActionButton from "@/components/shared/ActionButton";
import { sortableHeader, useDataTableState, DataTableCard, DataTableToolbar, DataTableContent } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenu } from "@/components/ui/dropdown-menu";
import { Auction, AuctionStatusVariantMap, AuctionStatusLabelMap } from "@/model/Auction";
import { auctionActionLabelMap, AuctionTransaction, AuctionTransactionAction } from "@/model/AuctionTransaction";
import { transactionStatusLabelMap, transactionStatusVariantMap } from "@/model/BankTransaction";
import { LoanTransferActionLabelMap } from "@/model/LoanTransfer";
import { formatUsdc, formatDate, shortAddress } from "@/utils";
import { ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { WalletCards } from "lucide-react";

import { useAccount } from "wagmi";

type Props = {
  data: AuctionTransaction[];
  onAuctionTransactionAction: (auctionTransactionAction: AuctionTransactionAction, auctionTransaction: AuctionTransaction) => void;
};

function  AuctionTransactionTable(props : Props) {
  const { address } = useAccount();
  const { data, onAuctionTransactionAction } = props;

  const columns: ColumnDef<AuctionTransaction>[] = [
    {
      accessorKey: "id",
      header: sortableHeader<AuctionTransaction>("ID"),
    },
    {
      accessorKey: "bidder",
      header: sortableHeader<AuctionTransaction>("Người đặt giá"),
        cell: ({ row }) => {
        return shortAddress(row.original.bidder);
      }
    },
    {
      accessorKey: "bidAmount",
      header: sortableHeader<AuctionTransaction>("Giá đặt"),
      cell: ({ row }) => {
        return formatUsdc(row.original.bidAmount);
      },
    },

    {
      accessorKey: "auctionAction",
      header: sortableHeader<AuctionTransaction>("Hành động"),
      cell: ({ row }) => {
        return auctionActionLabelMap[row.original.auctionAction];
      },
    },
    {
      accessorKey: "endTime",
      header: sortableHeader<AuctionTransaction>("Thời gian kết thúc mới"),
      cell: ({ row }) => {
        return formatDate(row.original.endTime);
      },
    },
    {
      accessorKey: "eventTimestamp",
      header: sortableHeader<AuctionTransaction>("Thời gian đặt"),
      cell: ({ row }) => {
        return formatDate(row.original.eventTimestamp);
      },
    },
    {
      accessorKey: "status",
      header: sortableHeader<AuctionTransaction>("Trạng thái"),
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
      header: "Hành động",
      cell: ({ row }) => {
        const auctionTx = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionButton />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-sidebar border border-border text-foreground"
            >
              <DropdownMenuLabel className="text-foreground">
                Hành động
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onAuctionTransactionAction("VIEW_DETAILS", auctionTx)}
                className="cursor-pointer"
              >
                <WalletCards className="size-4" />
                {LoanTransferActionLabelMap["VIEW_DETAILS"]}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  } = useDataTableState();

  const table = useReactTable({
    data: data,
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
    <DataTableCard title="Danh sách đấu giá">
      <DataTableToolbar
        searchPlaceholder="Tìm theo ID, người yêu cầu, giá..."
        searchValue={globalFilter}
        onSearchChange={setGlobalFilter}
        onClearFilters={() => {
          clearFilters();
          table.setPageIndex(0);
        }}
        statusFilter={{
          value:
            (table.getColumn("status")?.getFilterValue() as string) ?? "all",
          onChange: (value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? undefined : value),
          options: [
            { label: "Tất cả", value: "all" },
            ...Object.entries(AuctionStatusLabelMap).map(([value, label]) => ({
              label,
              value,
            })),
          ],
        }}
      />
      <DataTableContent
        table={table}
        columnsLength={columns.length}
        emptyMessage="Không có dữ liệu phù hợp."
      />
    </DataTableCard>
  );
}

export default AuctionTransactionTable;
