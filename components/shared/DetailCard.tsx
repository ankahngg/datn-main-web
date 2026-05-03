import { ReactNode } from "react";
import { Label } from "../ui/label";
import { cn } from "@/utils";

export interface DetailCardProps {
  label: string;
  value: ReactNode;
  helperText?: ReactNode;
  className?: string;
  valueClassName?: string;
  helperClassName?: string;
}

export function DetailCard({
  label,
  value,
  helperText,
  className = "",
  valueClassName = "",
  helperClassName = "",
}: DetailCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-sidebar/80 p-4 shadow-sm", className)}>
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className={cn("mt-2 text-sm text-foreground", valueClassName)}>{value}</div>
      {helperText && (
        <p className={cn("mt-1 text-xs text-muted-foreground", helperClassName)}>{helperText}</p>
      )}
    </div>
  );
}