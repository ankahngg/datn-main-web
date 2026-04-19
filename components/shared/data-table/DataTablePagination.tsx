import type { Table as TableType } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataTablePaginationProps<TData> = {
  table: TableType<TData>;
  pageSizeOptions?: number[];
};

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-muted-foreground">
        Trang {table.getState().pagination.pageIndex + 1}/{Math.max(table.getPageCount(), 1)}
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={String(table.getState().pagination.pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="border-muted-foreground">
            <SelectValue placeholder="Số dòng" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            className="border-muted-foreground bg-background/90 text-foreground"
          >
            {pageSizeOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option} dòng
              </SelectItem>
            ))}
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
  );
}
