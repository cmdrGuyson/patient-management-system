"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface ConfirmActionProps {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  children: React.ReactNode;
}

export function ConfirmAction({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  children,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // keep dialog open on error
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      {description ? (
        <div className="text-sm text-muted-foreground">{description}</div>
      ) : null}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant={destructive ? "destructive" : "default"}
          disabled={loading}
        >
          {loading ? `${confirmText}...` : confirmText}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="flex-shrink-0 px-4 pt-4">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
