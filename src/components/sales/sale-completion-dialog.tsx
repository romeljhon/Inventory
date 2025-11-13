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
import { useState } from "react";

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
  const [selected, setSelected] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const paymentMethods = ["Cash", "Card", "GCash", "Maya"];

  const handleSelect = (method: string) => {
    setSelected(method);
    onConfirm(method);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-xl p-6">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold">Finalize Sale</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Confirm the payment method to complete the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
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
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Select Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method}
                  variant={selected === method ? "default" : "outline"}
                  className={`w-full py-4 ${
                    selected === method
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30"
                  }`}
                  onClick={() => handleSelect(method)}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => onOpenChange(false)}
          >
            Cancel Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
