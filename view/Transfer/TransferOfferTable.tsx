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
import { LoanTransferOfferAction, LoanTransferOfferActionLabelMap, UserLoanTransferOffer } from "@/model/LoanTransferOffer";
import { shortAddress, formatUsdc, formatDate, isNotProcessing } from "@/utils";
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
    transferApplication: UserLoanTransfer;
  data: UserLoanTransferOffer[];
  onAction: (action: LoanTransferOfferAction, transfer: UserLoanTransferOffer) => void;
};


function TransferOfferTable(props: Props) {
    const {address} = useAccount();

  const { 
    transferApplication,
    data,
    onAction,
  } = props;


  const columns : ColumnDef<UserLoanTransferOffer>[] = [

    {
      accessorKey: "offerId",
      header: sortableHeader<UserLoanTransferOffer>("ID"),
    },
    {
      accessorKey: "requester",
      header: sortableHeader<UserLoanTransferOffer>("Người yêu cầu"),
    },
    {
      accessorKey: "price",
      header: sortableHeader<UserLoanTransferOffer>("Giá chuyển nhượng"),
      cell: ({ row }) => {
        return formatUsdc(row.original.price);
      },
    },
    {
      accessorKey: "status",
      header: sortableHeader<UserLoanTransferOffer>("Trạng thái"),
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
      header: sortableHeader<UserLoanTransferOffer>("Thời gian tạo"),
      cell: ({ row }) => {
        return formatDate(row.original.timeCreated);
      },
    },
    {
        header: "Hành động",
        cell: ({ row }) => {
          const rowData = row.original;
          const canCancel = rowData.status === "CREATED" && isNotProcessing(transferApplication.status) 
          && rowData.requester.toLowerCase() === address?.toLowerCase();
          const canAccept = rowData.status === "CREATED" && isNotProcessing(transferApplication.status) 
          && transferApplication.seller.toLowerCase() === address?.toLowerCase();
       
          return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <ActionButton />
                </DropdownMenuTrigger>

                 <DropdownMenuContent align="end" className="w-48 bg-sidebar border border-border text-foreground">
                    <DropdownMenuLabel className="text-foreground">Hành động</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => onAction("ACCEPT_OFFER", rowData)}
                      className="cursor-pointer"
                        disabled={!canAccept}
                    >
                        <WalletCards className="size-4" />
                      {LoanTransferOfferActionLabelMap["ACCEPT_OFFER"]}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem
                      onClick={() => onAction("CANCEL_OFFER", rowData)}
                      variant="destructive"
                      disabled={!canCancel}
                        className="cursor-pointer"
                    >
                        <XCircle className="size-4" />
                        {LoanTransferOfferActionLabelMap["CANCEL_OFFER"]}
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
    <DataTableCard title="Danh sách đề nghị mua chuyển nhượng">
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

export default TransferOfferTable;
