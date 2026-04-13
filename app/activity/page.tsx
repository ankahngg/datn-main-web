"use client";

import { useMemo, useState } from "react";

import WalletRequired from "@/components/wallet-required";
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

export type ActivityStatus = "success" | "processing" | "failed";

export type Activity = {
  id: number;
  name: string;
  startTime: string; // ISO string
  endTime?: string | null; // ISO string | null while processing
  status: ActivityStatus;
};

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 1,
    name: "Gửi tài sản vào pool",
    startTime: "2026-04-13T09:00:00Z",
    endTime: "2026-04-13T09:00:20Z",
    status: "success",
  },
  {
    id: 2,
    name: "Rút tài sản khỏi pool",
    startTime: "2026-04-13T09:05:00Z",
    endTime: null,
    status: "processing",
  },
  {
    id: 3,
    name: "Vay tài sản",
    startTime: "2026-04-13T09:10:00Z",
    endTime: "2026-04-13T09:10:30Z",
    status: "failed",
  },
  {
    id: 4,
    name: "Trả nợ khoản vay",
    startTime: "2026-04-13T09:20:00Z",
    endTime: "2026-04-13T09:20:10Z",
    status: "success",
  },
  {
    id: 5,
    name: "Chuyển tài sản giữa ví",
    startTime: "2026-04-13T09:25:00Z",
    endTime: null,
    status: "processing",
  },
];

const STATUS_LABEL: Record<ActivityStatus, string> = {
  success: "Thành công",
  processing: "Đang xử lý",
  failed: "Thất bại",
};

const statusVariantMap: Record<ActivityStatus, "success" | "warning" | "danger"> = {
  success: "success",
  processing: "warning",
  failed: "danger",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function ActivityPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar flex items-center gap-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            ID
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar flex items-center gap-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Tên giao dịch
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
      },
      {
        accessorKey: "startTime",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar flex items-center gap-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Thời gian bắt đầu
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
        cell: ({ row }) => formatDate(row.original.startTime),
      },
      {
        accessorKey: "endTime",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar flex items-center gap-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Thời gian kết thúc
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const activity = row.original;
          if (activity.status === "processing") {
            return (
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-sidebar-accent animate-ping" />
                <span className="text-xs text-muted-foreground">
                  Đang xử lý...
                </span>
              </span>
            );
          }
          return formatDate(activity.endTime);
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <Button
            size="sm"
            className="-ml-3 text-muted-foreground hover:text-foreground bg-sidebar flex items-center gap-1"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Trạng thái
            <ArrowUpDown className="ml-1 size-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge variant={statusVariantMap[status]}>
              {STATUS_LABEL[status]}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: MOCK_ACTIVITIES,
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
    <WalletRequired
      title="Hoạt động yêu cầu kết nối ví"
      message="Kết nối ví để xem và theo dõi các giao dịch đang chờ xác nhận."
    >
      <section className="space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading">Hoạt động</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách các giao dịch đang chờ xác nhận, thành công hoặc thất bại.
            </p>
          </div>
        </header>
        <Card className="bg-sidebar text-foreground">
          <CardHeader>
            <CardTitle className="text-foreground">Danh sách hoạt động</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Tìm kiếm chung (id, tên, thời gian, trạng thái)..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                }}
                className="w-full md:max-w-sm border-muted-foreground border-2"
              />

              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:justify-end">
                <Select
                  value={
                    (table.getColumn("status")?.getFilterValue() as string) ??
                    "all"
                  }
                  onValueChange={(value) => {
                    table
                      .getColumn("status")
                      ?.setFilterValue(value === "all" ? undefined : value);
                    table.setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="w-full border-muted-foreground md:w-48">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="border-muted-foreground bg-background/90 text-foreground">
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="processing">Đang xử lý</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="failed">Thất bại</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  className="bg-background text-foreground/80 hover:text-foreground hover:bg-background/90 md:ml-2"
                  size="sm"
                  onClick={() => {
                    setGlobalFilter("");
                    table.getColumn("status")?.setFilterValue(undefined);
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
                      <TableHead
                        key={header.id}
                        className="text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className={
                        row.original.status === "processing"
                          ? "text-foreground animate-pulse"
                          : "text-foreground"
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground text-sm"
                    >
                      Không có giao dịch nào phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Trang {table.getState().pagination.pageIndex + 1}/
                {Math.max(table.getPageCount(), 1)}
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={String(table.getState().pagination.pageSize)}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger className="border-muted-foreground">
                    <SelectValue placeholder="Số dòng" />
                  </SelectTrigger>
                  <SelectContent className="border-muted-foreground bg-background/90 text-foreground">
                    <SelectItem value="5">5 dòng</SelectItem>
                    <SelectItem value="10">10 dòng</SelectItem>
                    <SelectItem value="20">20 dòng</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  className="bg-background text-foreground/80 hover:text-foreground hover:bg-background/90"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  className="bg-background text-foreground/80 hover:text-foreground hover:bg-background/90"
                >
                  Sau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </WalletRequired>
  );
}
