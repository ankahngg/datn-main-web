import ActionButton from "@/components/shared/ActionButton";
import {
  DataTableCard,
  DataTableContent,
  DataTableToolbar,
  sortableHeader,
  useDataTableState,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  applicationStatusLabelMap,
  applicationStatusVariantMap,
  LoanApplication,
} from "@/model/LoanApplication";
import { LOAN_TRANSFER_ACTIONS, LoanTransferAction, LoanTransferActionLabelMap, UserLoanTransfer } from "@/model/LoanTransfer";
import { shortAddress, formatUsdc, formatDate } from "@/utils";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { WalletCards, XCircle } from "lucide-react";
import { useAccount } from "wagmi";

type Props = {
  data: UserLoanTransfer[];
  onTransferAction: (action: LoanTransferAction, transfer: UserLoanTransfer) => void;
};


function TransferApplicationTable(props: Props) {
  const { address } = useAccount();
  const { 
    data,
    onTransferAction,
  } = props;


  const columns : ColumnDef<UserLoanTransfer>[] = [

    {
      accessorKey: "transferId",
      header: sortableHeader<UserLoanTransfer>("ID"),
    },
    {
      accessorKey: "loanId",
      header: sortableHeader<UserLoanTransfer>("Khoản vay"),
    },
    {
      accessorKey: "price",
      header: sortableHeader<UserLoanTransfer>("Giá chuyển nhượng"),
      cell: ({ row }) => {
        return formatUsdc(row.original.price);
      },
    },
    {
      accessorKey: "acceptedPrice",
      header: sortableHeader<UserLoanTransfer>("Giá chốt chấp nhận"),
      cell: ({ row }) => {
        return row.original.acceptedPrice ? formatUsdc(row.original.acceptedPrice) : "-";
      },
    },
    {
      accessorKey: "status",
      header: sortableHeader<UserLoanTransfer>("Trạng thái"),
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
      header: sortableHeader<UserLoanTransfer>("Thời gian tạo"),
      cell: ({ row }) => {
        return formatDate(row.original.timeCreated);
      },
    },
    {
        header: "Hành động",
        cell: ({ row }) => {
          const transfer = row.original;
          const canCancel = transfer.status === "CREATED" && address?.toLowerCase() === transfer.seller.toLowerCase();
          return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <ActionButton />
                </DropdownMenuTrigger>

                 <DropdownMenuContent align="end" className="w-48 bg-sidebar border border-border text-foreground">
                    <DropdownMenuLabel className="text-foreground">Hành động</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onTransferAction("VIEW_DETAILS", transfer)}
                      className="cursor-pointer"
                    >
                        <WalletCards className="size-4" />
                      {LoanTransferActionLabelMap["VIEW_DETAILS"]}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => onTransferAction("CANCEL_TRANSFER", transfer)}
                      variant="destructive"
                      disabled={!canCancel}
                        className="cursor-pointer"
                    >
                        <XCircle className="size-4" />
                      {LoanTransferActionLabelMap["CANCEL_TRANSFER"]}
                    </DropdownMenuItem>

                 </DropdownMenuContent>
            </DropdownMenu>
          )

        }
    }
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
    <DataTableCard title="Danh sách đơn chuyển nhượng vay">
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
            { value: "all", label: "Tất cả trạng thái" },
            {
              value: "PENDING_CREATED",
              label: applicationStatusLabelMap.PENDING_CREATED,
            },
            { value: "CREATED", label: applicationStatusLabelMap.CREATED },
            {
              value: "PENDING_ACCEPTED",
              label: applicationStatusLabelMap.PENDING_ACCEPTED,
            },
            { value: "ACCEPTED", label: applicationStatusLabelMap.ACCEPTED },
            {
              value: "PENDING_CANCELED",
              label: applicationStatusLabelMap.PENDING_CANCELED,
            },
            { value: "CANCELED", label: applicationStatusLabelMap.CANCELED },
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

export default TransferApplicationTable;
