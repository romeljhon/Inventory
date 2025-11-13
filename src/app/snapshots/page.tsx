"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useBusiness } from "@/hooks/use-business";
import { useInventory } from "@/hooks/use-inventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { format } from "date-fns";
import type { Item, Recipe } from "@/lib/types";
import { Camera, Building, Download, Component, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { downloadCSV } from "@/lib/utils";

export default function SnapshotsPage() {
  const { activeBranch } = useBusiness();
  const { categories, recipes, getInventorySnapshot, availableSnapshotDates, isLoading } =
    useInventory(activeBranch?.id);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    availableSnapshotDates.length > 0 ? availableSnapshotDates[0] : undefined
  );
  
  const snapshotRawData: Item[] = useMemo(() => {
    if (!selectedDate) return [];
    return getInventorySnapshot(selectedDate);
  }, [selectedDate, getInventorySnapshot]);

  const getProductStock = (productId: string, allRecipes: Recipe[], allItems: Item[]): number => {
    const recipe = allRecipes.find(r => r.productId === productId);
    if (!recipe) {
      const item = allItems.find(i => i.id === productId);
      return item?.quantity ?? 0;
    }
    
    if (!recipe.components || recipe.components.length === 0) {
      return 0;
    }

    const possibleQuantities = recipe.components.map(component => {
      const componentItem = allItems.find(i => i.id === component.itemId);
      if (!componentItem) return 0;
      if (component.quantity === 0) return Infinity; // Avoid division by zero
      return Math.floor(componentItem.quantity / component.quantity);
    });

    return Math.min(...possibleQuantities);
  };

  const snapshotData = useMemo(() => {
      return snapshotRawData.map(item => {
          if (item.itemType === 'Product') {
              const stock = getProductStock(item.id, recipes, snapshotRawData);
              return {...item, quantity: stock};
          }
          return item;
      })
  }, [snapshotRawData, recipes]);


  const productItems = useMemo(() => snapshotData.filter(item => item.itemType === 'Product'), [snapshotData]);
  const componentItems = useMemo(() => snapshotData.filter(item => item.itemType === 'Component'), [snapshotData]);


  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString);
  };
  
  const handleExport = () => {
    if (!snapshotData.length || !selectedDate) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "There is no snapshot data for the selected date to export.",
      });
      return;
    }

    const dataToExport = snapshotData.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      type: item.itemType,
      category: categories.find(c => c.id === item.categoryId)?.name || "Uncategorized",
      quantity: item.quantity,
      unitType: item.unitType,
      value: item.value,
      totalValue: item.quantity * item.value,
      expirationDate: item.expirationDate ? format(new Date(item.expirationDate), "yyyy-MM-dd") : "",
      createdAt: format(new Date(item.createdAt as string), "yyyy-MM-dd HH:mm:ss"),
    }));
    
    const branchName = activeBranch?.name.replace(/ /g, "_") || "inventory";
    const date = format(new Date(selectedDate), "yyyy-MM-dd");
    downloadCSV(dataToExport, `${branchName}_snapshot_${date}.csv`);
    
    toast({
      title: "Export Started",
      description: `The inventory snapshot from ${format(new Date(selectedDate), "PP")} is being downloaded.`,
    });
  };

  if (isLoading && !activeBranch) {
    return <div className="flex h-screen items-center justify-center">Loading snapshots...</div>;
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {!activeBranch ? (
           <Card>
            <CardHeader className="flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Branch Selected</CardTitle>
              <CardDescription>
                Please select a branch from the dashboard to view inventory snapshots.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header>
              <h1 className="text-3xl font-bold tracking-tight">
                Inventory Snapshots for {activeBranch.name}
              </h1>
              <p className="text-muted-foreground">
                View your inventory state from a previous date.
              </p>
            </header>

            <Card>
              <CardHeader>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>View Historical Inventory</CardTitle>
                    <CardDescription>
                      Select a date to see a snapshot of your inventory at the end
                      of that day.
                    </CardDescription>
                  </div>
                   <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                    {availableSnapshotDates.length > 0 ? (
                      <Select
                        onValueChange={handleDateChange}
                        value={selectedDate}
                      >
                        <SelectTrigger className="w-full sm:w-[240px]">
                          <SelectValue placeholder="Select a date" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSnapshotDates.map((date) => (
                            <SelectItem key={date} value={date}>
                              {format(new Date(date), "PP")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                    <Button onClick={handleExport} disabled={!snapshotData || snapshotData.length === 0} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                   </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    <div className="text-center py-8">Loading snapshot...</div>
                ) : selectedDate && snapshotData.length > 0 ? (
                  <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackagePlus />
                                Products
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <InventoryTable
                                items={productItems}
                                categories={categories}
                                pendingChanges={{}}
                                onEditItem={() => {}}
                                onDeleteItem={() => {}}
                                onUpdateQuantity={() => {}}
                                isLoading={isLoading}
                                itemType="Product"
                            />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Component />
                                Components
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <InventoryTable
                                items={componentItems}
                                categories={categories}
                                pendingChanges={{}}
                                onEditItem={() => {}}
                                onDeleteItem={() => {}}
                                onUpdateQuantity={() => {}}
                                isLoading={isLoading}
                                itemType="Component"
                            />
                        </CardContent>
                    </Card>
                  </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                        <Camera className="h-12 w-12 text-muted-foreground/80" />
                        <h3 className="text-xl font-semibold">No Snapshots Available</h3>
                        <p className="text-muted-foreground">
                        There is no inventory history to display for this branch.
                        </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
