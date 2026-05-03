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
} from "@/components/ui/dialog";
import clsx from "clsx";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: React.ReactNode;
  txMessage?: string | null;
  txStatus?: "idle" | "success" | "error" | null;
  isSubmtting?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  content,
  txMessage,
  txStatus,
  isSubmtting,
  onConfirm,
}: ConfirmDialogProps) {
  const isSubmitting = Boolean(isSubmtting);
  const canRetry = txStatus !== "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-3 bg-background text-foreground">
          {txMessage && (
                          <p
                            className={clsx(
                              "mr-auto text-sm",
                              txStatus === "success" && "text-emerald-400",
                              txStatus === "error" && "text-red-400",
                            )}
                          >
                            {txMessage}
                          </p>
                        )}
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