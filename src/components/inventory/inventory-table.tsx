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
import { Edit, Minus, Plus, Trash2, Package, ArrowRight, CalendarClock, CalendarX2, Component, PackagePlus } from "lucide-react";
import type { Item, Category } from "@/lib/types";
import { LOW_STOCK_THRESHOLD } from "@/hooks/use-inventory";
import { cn } from "@/lib/utils";
import { format, isBefore, isWithinInterval, addDays } from 'date-fns';
import { EditableQuantity } from "./editable-quantity";


interface InventoryTableProps {
  items: Item[];
  originalItems?: Item[];
  categories: Category[];
  pendingChanges: Record<string, number>;
  onEditItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  isLoading: boolean;
  isCompact?: boolean;
  itemType?: 'Product' | 'Component';
}

export function InventoryTable({
  items,
  originalItems,
  categories,
  pendingChanges,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  isLoading,
  isCompact = false,
  itemType,
}: InventoryTableProps) {
  const getCategory = (id: string) => {
    return categories.find((c) => c.id === id);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const getExpirationBadge = (expirationDate: string | undefined) => {
      if (!expirationDate) return null;

      const now = new Date();
      const expDate = new Date(expirationDate);
      const sevenDaysFromNow = addDays(now, 7);

      if (isBefore(expDate, now)) {
          return (
              <Badge variant="destructive" className="mt-1 flex w-fit items-center gap-1.5">
                  <CalendarX2 className="h-3.5 w-3.5" /> Expired
              </Badge>
          );
      }
      if (isWithinInterval(expDate, { start: now, end: sevenDaysFromNow })) {
          return (
              <Badge variant="secondary" className="mt-1 w-fit bg-yellow-500 text-black">
                  Expires Soon
              </Badge>
          );
      }
      return null;
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading inventory...</div>;
  }
  
  if (!items || items.length === 0) {
    let emptyStateIcon = <Package className="h-12 w-12 text-muted-foreground/80" />;
    let emptyStateTitle = "No Items Found";
    let emptyStateDescription = "There are no items to display for the current selection.";

    if (itemType === 'Product') {
        emptyStateIcon = <PackagePlus className="h-12 w-12 text-muted-foreground/80" />;
        emptyStateTitle = "No Products Found";
        emptyStateDescription = "Products are finished goods made from components via recipes.";
    } else if (itemType === 'Component') {
        emptyStateIcon = <Component className="h-12 w-12 text-muted-foreground/80" />;
        emptyStateTitle = "No Components Found";
        emptyStateDescription = "Components are the raw materials used to create products.";
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
        {emptyStateIcon}
        <h3 className="text-xl font-semibold">{emptyStateTitle}</h3>
        <p className="text-muted-foreground">{emptyStateDescription}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn(isCompact ? 'w-auto' : 'w-[40%] sm:w-[30%]')}>Item</TableHead>
              {!isCompact && <TableHead className="hidden sm:table-cell">Category</TableHead>}
              {!isCompact && <TableHead className="hidden md:table-cell text-right">Value</TableHead>}
              <TableHead className="text-center w-[120px] sm:w-[150px]">Quantity</TableHead>
              {!isCompact && <TableHead className="hidden lg:table-cell text-right">Total Value</TableHead>}
              {!isCompact && <TableHead className="text-right w-[80px] sm:w-auto">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const originalItem = originalItems?.find(i => i.id === item.id);
              const hasPendingChange = pendingChanges[item.id] !== undefined;
              const category = getCategory(item.categoryId);
              return (
              <TableRow key={item.id} className={cn("transition-colors hover:bg-muted/50", hasPendingChange && "bg-yellow-100/50 dark:bg-yellow-900/20")}>
                <TableCell>
                  <div className="font-medium">{item.name}</div>
                   {!isCompact && <div className="hidden text-sm text-muted-foreground md:inline">
                    {item.description}
                  </div>}
                  {item.expirationDate && !isCompact && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        <span>Expires: {format(new Date(item.expirationDate), "PP")}</span>
                    </div>
                  )}
                  {getExpirationBadge(item.expirationDate)}
                </TableCell>
                {!isCompact && <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" style={category ? { backgroundColor: category.color, color: 'white', borderColor: category.color } : {}}>
                    {category?.name || "N/A"}
                  </Badge>
                </TableCell>}
                {!isCompact && <TableCell className="hidden md:table-cell text-right">
                  {formatCurrency(item.value)}
                </TableCell>}
                <TableCell>
                  <div className={cn("flex flex-col items-center gap-1", isCompact ? "justify-center" : "justify-center")}>
                    <div className="flex items-center gap-1 sm:gap-2">
                        {!isCompact && <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={isCompact || item.itemType === 'Product' || !originalItems}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>}
                        <div className="flex flex-col items-center gap-1 font-semibold">
                           {hasPendingChange && originalItem ? (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-muted-foreground line-through">{originalItem.quantity}</span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                          ) : null}
                          <div className="flex items-center gap-1">
                              {isCompact || item.itemType === 'Product' || !originalItems || originalItems.length === 0 ? (
                                 <div className="py-1 px-2">{item.quantity}</div>
                              ) : (
                                 <EditableQuantity
                                    initialValue={item.quantity}
                                    onSave={(newQuantity) => onUpdateQuantity(item.id, newQuantity)}
                                />
                              )}
                            {item.unitType && <span className="text-xs text-muted-foreground">({item.unitType})</span>}
                          </div>
                        </div>
                        {!isCompact && <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isCompact || item.itemType === 'Product' || !originalItems}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>}
                    </div>
                    {item.itemType === 'Component' && item.quantity < LOW_STOCK_THRESHOLD && !isCompact && (
                         <Badge variant="destructive" className="mt-2 text-center w-full max-w-fit mx-auto">Low Stock</Badge>
                    )}
                  </div>
                </TableCell>
                {!isCompact && <TableCell className="hidden lg:table-cell text-right font-medium">
                  {formatCurrency(item.value * item.quantity)}
                </TableCell>}
                {!isCompact && <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditItem(item)}
                          disabled={!originalItems || originalItems.length === 0}
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
                           disabled={!originalItems || originalItems.length === 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Item</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>}
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
