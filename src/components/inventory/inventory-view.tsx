
"use client";

import { useMemo, useState, useCallback } from "react";
import type { Item } from "@/lib/types";
import { useInventory } from "@/hooks/use-inventory";
import { useBusiness } from "@/hooks/use-business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { CategoryPills } from "@/components/inventory/category-pills";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { ItemFormDialog } from "@/components/inventory/item-form-dialog";
import { DeleteItemAlert } from "@/components/inventory/delete-item-alert";
import { useToast } from "@/hooks/use-toast";

export function InventoryView() {
  const { activeBranch } = useBusiness();
  const {
    items,
    categories,
    history,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    batchUpdateQuantities,
    isLoading,
  } = useInventory(activeBranch?.id);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

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

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="space-y-6">
        <InventoryHeader
          onAddItem={() => handleOpenForm()}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          hasPendingChanges={hasPendingChanges}
          onSave={handleSave}
          onCancel={handleCancel}
          pendingChangesSummary={pendingChangesSummary}
        />
        <Card>
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              A list of all items in your inventory.
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
      </div>
      
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
    </div>
  );
}
