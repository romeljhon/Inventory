
"use client";

import { useMemo, useState } from "react";
import type { Item } from "@/lib/types";
import { useInventory } from "@/hooks/use-inventory";
import { useBusiness } from "@/hooks/use-business";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryHeader } from "@/components/inventory/inventory-header";
import { CategoryPills } from "@/components/inventory/category-pills";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { ItemFormDialog } from "@/components/inventory/item-form-dialog";
import { DeleteItemAlert } from "@/components/inventory/delete-item-alert";

export function InventoryView() {
  const { activeBranch } = useBusiness();
  const {
    items,
    categories,
    addItem,
    updateItem,
    deleteItem,
    addCategory,
    updateItemQuantity,
    isLoading,
  } = useInventory(activeBranch?.id);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items
      .filter((item) => {
        if (activeCategory && item.categoryId !== activeCategory) {
          return false;
        }
        if (searchTerm) {
          const search = searchTerm.toLowerCase();
          return (
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, searchTerm, activeCategory]);

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
              categories={categories}
              onEditItem={handleOpenForm}
              onDeleteItem={handleOpenDeleteAlert}
              onUpdateQuantity={updateItemQuantity}
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
