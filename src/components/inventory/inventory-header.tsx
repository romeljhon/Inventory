"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Save, XCircle } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";

interface InventoryHeaderProps {
  onAddItem: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  hasPendingChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function InventoryHeader({
  onAddItem,
  searchTerm,
  onSearchTermChange,
  hasPendingChanges,
  onSave,
  onCancel
}: InventoryHeaderProps) {
  const { activeBranch } = useBusiness();
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {activeBranch?.name} Inventory
        </h1>
      </div>
      <div className="flex flex-1 items-center gap-2 md:max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
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
