
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SaleCompletionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (paymentMethod: string) => void;
  subtotal: number;
  discount: number;
  total: number;
}

export function SaleCompletionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  subtotal,
  discount,
  total,
}: SaleCompletionDialogProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const paymentMethods = ["Cash", "Card", "GCash", "Maya"];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalize Sale</DialogTitle>
          <DialogDescription>
            Confirm the payment method to complete the transaction.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-red-500">-{formatCurrency(discount)}</span>
                    </div>
                )}
                 <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
            <div>
                <p className="text-sm font-medium mb-2">Select Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map(method => (
                        <Button
                            key={method}
                            variant="outline"
                            onClick={() => onConfirm(method)}
                        >
                            {method}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
