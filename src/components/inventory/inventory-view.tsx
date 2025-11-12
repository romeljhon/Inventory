
"use client";

import { useMemo, useState } from "react";
import type { Item, Branch, Recipe, Supplier } from "@/lib/types";
import { useInventory } from "@/hooks/use-inventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { CategoryPills } from "@/components/inventory/category-pills";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { ItemFormDialog } from "@/components/inventory/item-form-dialog";
import { DeleteItemAlert } from "@/components/inventory/delete-item-alert";
import { StartNewCountAlert } from "@/components/inventory/start-new-count-alert";
import { useToast } from "@/hooks/use-toast";
import { History, ArrowLeft, PackagePlus, Component } from "lucide-react";
import { downloadCSV } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";


interface InventoryViewProps {
    branch: Branch;
    suppliers: Supplier[];
}

export function InventoryView({ branch, suppliers }: InventoryViewProps) {
  const {
    items,
    recipes,
    categories,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    batchUpdateQuantities,
    isLoading,
  } = useInventory(branch.id);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [isNewCountAlertOpen, setIsNewCountAlertOpen] = useState(false);

  const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});
  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

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
  
  const displayedItems = useMemo(() => {
    if (!items || !recipes) return [];
    
    return items.map(item => {
      if (item.itemType === 'Product') {
        const stock = getProductStock(item.id, recipes, items);
        return { ...item, quantity: stock };
      }
      return item;
    });
  }, [items, recipes]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const originalItem = items.find(i => i.id === itemId);
    if (!originalItem) return;

    if (originalItem.itemType === 'Product') {
      toast({
        variant: 'destructive',
        title: 'Cannot Change Product Quantity',
        description: 'Quantity of products is determined by component stock and recipes. Please update component quantities instead.',
      });
      return;
    }

    const clampedNewQuantity = Math.max(0, newQuantity);

    setPendingChanges(prev => {
      const newChanges = { ...prev };
      // If the new quantity is the same as the original, remove it from pending changes
      if (clampedNewQuantity === originalItem.quantity) {
        delete newChanges[itemId];
      } else {
        newChanges[itemId] = clampedNewQuantity;
      }
      return newChanges;
    });
  };

  const handleSave = () => {
    const componentChanges = Object.fromEntries(
        Object.entries(pendingChanges).filter(([itemId, _]) => {
            const item = items.find(i => i.id === itemId);
            return item && item.itemType === 'Component';
        })
    );

    if (Object.keys(componentChanges).length === 0) {
        toast({
            title: "No component changes to save",
            description: "You can only manually change quantities for components.",
        });
        setPendingChanges({}); // Clear product changes
        return;
    }

    batchUpdateQuantities(componentChanges);
    setPendingChanges({});
    toast({
      title: "Changes Saved",
      description: "Your inventory has been successfully updated.",
    });
  };

  const handleCancel = () => {
    setPendingChanges({});
  };

  const itemsWithPendingChanges = useMemo(() => {
    if (!displayedItems) return [];
    if (!hasPendingChanges) return displayedItems;
    
    return displayedItems.map(item => 
      pendingChanges[item.id] !== undefined
        ? { ...item, quantity: pendingChanges[item.id] }
        : item
    );
  }, [displayedItems, pendingChanges, hasPendingChanges]);

  const filteredItems = useMemo(() => {
    return itemsWithPendingChanges
      .filter((item) => {
        if (activeCategory && item.categoryId !== activeCategory) {
          return false;
        }
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            item.name.toLowerCase().includes(search) ||
            (item.description && item.description.toLowerCase().includes(search))
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
  }, [itemsWithPendingChanges, searchTerm, activeCategory]);

  const productItems = useMemo(() => filteredItems.filter(item => item.itemType === 'Product'), [filteredItems]);
  const componentItems = useMemo(() => filteredItems.filter(item => item.itemType === 'Component'), [filteredItems]);

  const pendingChangesSummary = useMemo(() => {
    if (!hasPendingChanges || !items) return null;

    let quantityChange = 0;
    let valueChange = 0;

    for (const itemId in pendingChanges) {
      const originalItem = items.find(i => i.id === itemId);
      if (originalItem) {
        const newQuantity = pendingChanges[itemId];
        const qtyDiff = newQuantity - originalItem.quantity;
        quantityChange += qtyDiff;
        valueChange += qtyDiff * originalItem.value;
      }
    }
    return { quantityChange, valueChange };
  }, [pendingChanges, items, hasPendingChanges]);

  const handleOpenForm = (item: Item | null = null) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleSaveItem = (itemData: Omit<Item, 'id' | 'createdAt'>) => {
    if (editingItem) {
      updateItem(editingItem.id, itemData);
    } else {
      addItem(itemData);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };
  
  const handleOpenDeleteAlert = (id: string) => {
    setDeletingItemId(id);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingItemId) {
      deleteItem(deletingItemId);
    }
    setIsDeleteAlertOpen(false);
    setDeletingItemId(null);
  };

  const handleConfirmStartNewCount = () => {
    const newPendingChanges: Record<string, number> = {};
    if (!items) return;

    for (const item of items) {
      if (item.itemType === 'Component') {
        newPendingChanges[item.id] = 0;
      }
    }
    setPendingChanges(newPendingChanges);
    setIsNewCountAlertOpen(false);
    toast({
      title: "New Count Started",
      description: "All component quantities set to 0. Update with new counts and save.",
    });
  }

  const handleExport = () => {
    if (!filteredItems.length) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "There are no items in the current view to export.",
      });
      return;
    }

    const dataToExport = filteredItems.map(item => ({
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
    
    const branchName = branch.name.replace(/ /g, "_") || "inventory";
    const date = format(new Date(), "yyyy-MM-dd");
    downloadCSV(dataToExport, `${branchName}_inventory_${date}.csv`);
    
    toast({
      title: "Export Started",
      description: "Your inventory data is being downloaded.",
    });
  };

  return (
    <div className="space-y-6">
       <InventoryHeader
          branchName={branch.name}
          onAddItem={() => handleOpenForm()}
          onStartNewCount={() => setIsNewCountAlertOpen(true)}
          onExport={handleExport}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasPendingChanges={hasPendingChanges}
          onSave={handleSave}
          onCancel={handleCancel}
          pendingChangesSummary={pendingChangesSummary}
        />
        <div className="space-y-4">
            <CategoryPills
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PackagePlus />
                        Products
                    </CardTitle>
                    <CardDescription>
                    Finished goods available to sell. Quantities are calculated automatically from component stock based on recipes.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryTable
                        items={productItems}
                        originalItems={items}
                        categories={categories}
                        pendingChanges={pendingChanges}
                        onEditItem={handleOpenForm}
                        onDeleteItem={handleOpenDeleteAlert}
                        onUpdateQuantity={handleQuantityChange}
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
                    <CardDescription>
                    Raw materials and ingredients used to create products. You can edit quantities here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <InventoryTable
                        items={componentItems}
                        originalItems={items}
                        categories={categories}
                        pendingChanges={pendingChanges}
                        onEditItem={handleOpenForm}
                        onDeleteItem={handleOpenDeleteAlert}
                        onUpdateQuantity={handleQuantityChange}
                        isLoading={isLoading}
                        itemType="Component"
                    />
                </CardContent>
            </Card>
        </div>

        {hasPendingChanges && (
           <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="previous-inventory">
              <AccordionTrigger>
                <div className="flex items-center gap-2 text-base font-semibold">
                  <History className="h-5 w-5" />
                  View Previous Inventory State
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card className="mt-4">
                   <CardHeader>
                      <CardTitle>Previous Inventory</CardTitle>
                      <CardDescription>
                        This is a read-only view of your inventory before the current pending changes were made.
                      </CardDescription>
                    </CardHeader>
                  <CardContent>
                    <InventoryTable
                      items={items}
                      categories={categories}
                      pendingChanges={{}}
                      onEditItem={() => {}}
                      onDeleteItem={() => {}}
                      onUpdateQuantity={() => {}}
                      isLoading={isLoading}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      
      <ItemFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
        suppliers={suppliers}
        onAddCategory={addCategory}
      />
      
      <DeleteItemAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
      />

      <StartNewCountAlert
        isOpen={isNewCountAlertOpen}
        onOpenChange={setIsNewCountAlertOpen}
        onConfirm={handleConfirmStartNewCount}
      />
    </div>
  );
}
