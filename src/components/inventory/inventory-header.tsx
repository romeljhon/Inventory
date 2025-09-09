"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Save, XCircle, ArrowRight } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { Badge } from "@/components/ui/badge";

interface InventoryHeaderProps {
  onAddItem: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  hasPendingChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  pendingChangesSummary: {
    quantityChange: number;
    valueChange: number;
  } | null;
}

export function InventoryHeader({
  onAddItem,
  searchTerm,
  onSearchTermChange,
  hasPendingChanges,
  onSave,
  onCancel,
  pendingChangesSummary
}: InventoryHeaderProps) {
  const { activeBranch } = useBusiness();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {activeBranch?.name} Inventory
        </h1>
      </div>
      <div className="flex flex-1 flex-wrap items-center justify-end gap-2 md:max-w-2xl">
        <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        {hasPendingChanges && pendingChangesSummary ? (
          <div className="flex items-center gap-2 rounded-md border bg-muted p-2 text-sm">
             <span className="font-medium">Pending:</span>
             <Badge variant={pendingChangesSummary.quantityChange > 0 ? "default" : "destructive"}>
                Qty: {pendingChangesSummary.quantityChange > 0 ? '+' : ''}{pendingChangesSummary.quantityChange}
            </Badge>
             <Badge variant={pendingChangesSummary.valueChange > 0 ? "default" : "destructive"}>
                Value: {formatCurrency(pendingChangesSummary.valueChange)}
             </Badge>
          </div>
        ) : null}
        {hasPendingChanges ? (
          <>
            <Button onClick={onSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          </>
        ) : (
          <Button onClick={onAddItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        )}
      </div>
    </header>
  );
}
