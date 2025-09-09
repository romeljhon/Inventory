"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Plus, Search } from "lucide-react";

interface InventoryHeaderProps {
  onAddItem: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export function InventoryHeader({
  onAddItem,
  searchTerm,
  onSearchTermChange,
}: InventoryHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <Icons.logo className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Stock Sherpa
        </h1>
      </div>
      <div className="flex flex-1 items-center gap-2 md:max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddItem} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Item</span>
        </Button>
      </div>
    </header>
  );
}
