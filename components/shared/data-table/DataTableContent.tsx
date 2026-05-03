import { flexRender, type Table as TableType } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableContentProps<TData> = {
  table: TableType<TData>;
  columnsLength: number;
  emptyMessage: string;
  highlightRowId?: string;
};

export function DataTableContent<TData>({
  table,
  columnsLength,
  emptyMessage,
  highlightRowId,
}: DataTableContentProps<TData>) {
  console.log("Rendering DataTableContent with highlightRowId:", highlightRowId);
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="text-muted-foreground">
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
          table.getRowModel().rows.map((row) => {
            console.log("Rendering row:", row.id, "highlightRowId:", highlightRowId);
            if (highlightRowId && row.id === highlightRowId) {
              return (
                <TableRow
                  key={row.id}
                  className="text-foreground hover:bg-foreground/5 hilight-row"
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
              );
            }
            return (
              <TableRow
                key={row.id}
                className="text-foreground hover:bg-foreground/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={columnsLength}
              className="h-24 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
