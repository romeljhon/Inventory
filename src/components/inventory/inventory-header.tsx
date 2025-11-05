
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Save, XCircle, ArrowRight, RotateCw, Download, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface InventoryHeaderProps {
  branchName: string;
  onAddItem: () => void;
  onStartNewCount: () => void;
  onExport: () => void;
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
  branchName,
  onAddItem,
  onStartNewCount,
  onExport,
  searchTerm,
  onSearchTermChange,
  hasPendingChanges,
  onSave,
  onCancel,
  pendingChangesSummary
}: InventoryHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
       <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {branchName} Inventory
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
          <div className="flex items-center gap-2">
            <Button onClick={onAddItem} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onStartNewCount}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  <span>Start New Count</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={onExport}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export to CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}

    