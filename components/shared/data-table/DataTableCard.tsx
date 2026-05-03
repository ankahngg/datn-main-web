import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils";

type DataTableCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DataTableCard({
  title,
  children,
  className,
  contentClassName,
}: DataTableCardProps) {
  return (
    <Card className={cn("bg-sidebar text-foreground", className)}>
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
