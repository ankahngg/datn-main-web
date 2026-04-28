import { ReactNode } from "react";
import { Label } from "../ui/label";

export function DetailCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-sidebar/80 p-4 shadow-sm">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2 text-sm text-foreground">{value}</div>
    </div>
  );
}