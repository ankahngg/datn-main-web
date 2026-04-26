"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ConfirmDialogProps = {
  trigger: React.ReactElement;
  title: string;
  content: React.ReactNode;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  trigger,
  title,
  content,
  txMessage,
  txStatus,
  isSubmtting,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = React.useState(false);
  
  const isSubmitting = Boolean(isSubmtting) 
  const canRetry = txStatus !== "success";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>

        {txMessage ? (
          <div
            className={
              txStatus === "success"
                ? "rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500"
                : txStatus === "error"
                  ? "rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
                  : "rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
            }
          >
            {txMessage}
          </div>
        ) : null}

        <DialogFooter className="pt-3 bg-background text-foreground">
          <Button
           
            className="red-btn"
            onClick={() => {
              onConfirm();
            }}
            disabled={isSubmitting || !canRetry}
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}