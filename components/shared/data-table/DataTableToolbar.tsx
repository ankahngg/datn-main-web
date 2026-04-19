import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = {
  value: string;
  label: string;
};

type DataTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onClearFilters: () => void;
  clearLabel?: string;
  statusFilter?: {
    value: string;
    placeholder?: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  };
  extraFilters?: React.ReactNode;
};

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onClearFilters,
  clearLabel = "Xóa bộ lọc",
  statusFilter,
  extraFilters,
}: DataTableToolbarProps) {
  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full border-2 border-muted-foreground md:max-w-sm"
        />
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          {statusFilter ? (
            <Select value={statusFilter.value} onValueChange={statusFilter.onChange}>
              <SelectTrigger className="w-full border-muted-foreground md:w-48">
                <SelectValue placeholder={statusFilter.placeholder ?? "Lọc trạng thái"} />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="border-muted-foreground bg-background/90 text-foreground"
              >
                {statusFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <Button
            className="bg-background text-foreground/80 hover:bg-background/90 hover:text-foreground"
            size="sm"
            onClick={onClearFilters}
          >
            {clearLabel}
          </Button>
        </div>
      </div>
      {extraFilters}
    </>
  );
}
