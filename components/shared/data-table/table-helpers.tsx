import { ArrowUpDown } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

export function sortableHeader<TData>(label: string) {
  return ({ column }: { column: Column<TData, unknown> }) => (
    <Button
      size="sm"
      className="-ml-3 bg-sidebar text-muted-foreground hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1 size-4" />
    </Button>
  );
}

