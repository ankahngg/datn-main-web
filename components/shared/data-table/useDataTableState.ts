import * as React from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export function useDataTableState() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const clearFilters = React.useCallback(() => {
    setGlobalFilter("");
    setColumnFilters([]);
  }, []);

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearFilters,
  };
}
