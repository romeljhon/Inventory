
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ReceivePurchaseOrderAlertProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  poNumber: string;
}

export function ReceivePurchaseOrderAlert({
  isOpen,
  onOpenChange,
  onConfirm,
  poNumber,
}: ReceivePurchaseOrderAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Receive Purchase Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark PO <strong className="mx-1">{poNumber}</strong> as "Received" and add the item quantities to your inventory. This cannot be easily undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm}>
            Yes, Receive Order
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    