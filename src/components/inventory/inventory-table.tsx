"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, Minus, Plus, Trash2, Package } from "lucide-react";
import type { Item, Category } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/hooks/use-inventory";

interface InventoryTableProps {
  items: Item[];
  categories: Category[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  isLoading: boolean;
}

export function InventoryTable({
  items,
  categories,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  isLoading,
}: InventoryTableProps) {
  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || "N/A";
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }
  
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
        <Package className="h-12 w-12 text-muted-foreground/80" />
        <h3 className="text-xl font-semibold">No Items Found</h3>
        <p className="text-muted-foreground">
          Your inventory is empty. Try adding a new item to get started.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] sm:w-[30%]">Item</TableHead>
              <TableHead className="hidden sm:table-cell">Category</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                  <div className="hidden text-sm text-muted-foreground md:inline">
                    {item.description}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline">{getCategoryName(item.categoryId)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.quantity < LOW_STOCK_THRESHOLD && (
                     <Badge variant="destructive" className="mt-2">Low Stock</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Item</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Item</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
