
"use client";

import { useMemo, useState } from "react";
import type { Item, Branch } from "@/lib/types";
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
import { History, ArrowLeft } from "lucide-react";
import { downloadCSV } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";


interface InventoryViewProps {
    branch: Branch;
    onBack: () => void;
}

export function InventoryView({ branch, onBack }: InventoryViewProps) {
  const {
    items,
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

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const originalItem = items.find(i => i.id === itemId);
    if (!originalItem) return;

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
    batchUpdateQuantities(pendingChanges);
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
    if (!items) return [];
    if (!hasPendingChanges) return items;
    return items.map(item => 
      pendingChanges[item.id] !== undefined
        ? { ...item, quantity: pendingChanges[item.id] }
        : item
    );
  }, [items, pendingChanges, hasPendingChanges]);

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
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [itemsWithPendingChanges, searchTerm, activeCategory]);

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
    // Also include items that are already 0 if you want them to be part of the count
     for (const item of items) {
      newPendingChanges[item.id] = 0;
    }
    setPendingChanges(newPendingChanges);
    setIsNewCountAlertOpen(false);
    toast({
      title: "New Count Started",
      description: "All item quantities set to 0. Update with new counts and save.",
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
      category: categories.find(c => c.id === item.categoryId)?.name || "Uncategorized",
      quantity: item.quantity,
      unitType: item.unitType,
      value: item.value,
      totalValue: item.quantity * item.value,
      expirationDate: item.expirationDate ? format(new Date(item.expirationDate), "yyyy-MM-dd") : "",
      createdAt: format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss"),
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
          onBack={onBack}
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
        <Card>
          <CardHeader>
            <CardTitle>Inventory List</CardTitle>
            <CardDescription>
              A list of all items in your inventory for this branch.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryPills
              categories={categories}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
            <InventoryTable
              items={filteredItems}
              originalItems={items}
              categories={categories}
              pendingChanges={pendingChanges}
              onEditItem={handleOpenForm}
              onDeleteItem={handleOpenDeleteAlert}
              onUpdateQuantity={handleQuantityChange}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

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
                      isCompact={false}
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
