
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  startOfDay,
  parseISO,
  isAfter,
} from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Item, Category, InventoryHistory } from "@/lib/types";

export const LOW_STOCK_THRESHOLD = 10;

const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 10);
    const lightness = 40 + Math.floor(Math.random() * 10);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function useInventory(branchId: string | undefined) {
  const firestore = useFirestore();

  const businessId = "business-for-user"; // In a real app this would come from the user session/business context

  const branchRef = useMemo(() =>
    firestore && businessId && branchId ? doc(firestore, 'businesses', businessId, 'branches', branchId) : null,
    [firestore, businessId, branchId]
  );
  
  const itemsCollection = useMemo(() => branchRef ? collection(branchRef, 'items') : null, [branchRef]);
  const categoriesCollection = useMemo(() => branchRef ? collection(branchRef, 'categories') : null, [branchRef]);
  const historyCollection = useMemo(() => branchRef ? collection(branchRef, 'history') : null, [branchRef]);
  
  const { data: items, loading: itemsLoading } = useCollection<Item>(
    itemsCollection ? query(itemsCollection, orderBy('createdAt', 'desc')) : null
  );
  const { data: categories, loading: categoriesLoading } = useCollection<Category>(categoriesCollection);
  const { data: history, loading: historyLoading } = useCollection<InventoryHistory>(
     historyCollection ? query(historyCollection, orderBy('createdAt', 'desc')) : null
  );

  const isLoading = itemsLoading || categoriesLoading || historyLoading;

  const addHistory = useCallback(async (log: Omit<InventoryHistory, 'id' | 'createdAt' | 'branchId'>) => {
    if (!historyCollection) return;
    const newHistory: Omit<InventoryHistory, 'id'> = {
        ...log,
        createdAt: serverTimestamp(),
        branchId: branchId!,
    };
    await addDoc(historyCollection, newHistory);
  }, [historyCollection, branchId]);

  const addItem = useCallback(async (itemData: Omit<Item, "id" | "createdAt">) => {
    if (!itemsCollection) return;
    const newItemData = {
        ...itemData,
        createdAt: serverTimestamp(),
      };
    const docRef = await addDoc(itemsCollection, newItemData);
    
    await addHistory({
        itemId: docRef.id,
        itemName: itemData.name,
        change: itemData.quantity,
        newQuantity: itemData.quantity,
        type: 'add'
    });
  }, [itemsCollection, addHistory]);

  const updateItem = useCallback(async (id: string, updatedData: Partial<Omit<Item, "id" | "createdAt">>) => {
    if (!itemsCollection || !items) return;
    const itemDoc = doc(itemsCollection, id);
    const oldItem = items.find(i => i.id === id);
    
    await updateDoc(itemDoc, updatedData);
    
    if (oldItem && updatedData.quantity !== undefined && oldItem.quantity !== updatedData.quantity) {
        await addHistory({
            itemId: id,
            itemName: updatedData.name || oldItem.name,
            change: updatedData.quantity - oldItem.quantity,
            newQuantity: updatedData.quantity,
            type: 'update'
        });
    }

  }, [itemsCollection, addHistory, items]);
  
  const batchUpdateQuantities = useCallback(async (updates: Record<string, number>) => {
    if (!firestore || !itemsCollection || !items) return;
    const batch = writeBatch(firestore);

    for (const itemId in updates) {
      const itemDoc = doc(itemsCollection, itemId);
      const newQuantity = Math.max(0, updates[itemId]);
      batch.update(itemDoc, { quantity: newQuantity });
      
      const oldItem = items.find(i => i.id === itemId);
      if (oldItem && oldItem.quantity !== newQuantity) {
          // This should ideally be batched too, but Firestore batching doesn't allow reads.
          // For a high-throughput system, this history logging would be done via a Cloud Function.
          await addHistory({
              itemId: itemId,
              itemName: oldItem.name,
              change: newQuantity - oldItem.quantity,
              newQuantity: newQuantity,
              type: 'quantity'
          });
      }
    }
    await batch.commit();
}, [firestore, itemsCollection, items, addHistory]);


  const deleteItem = useCallback(async (id: string) => {
    if (!itemsCollection || !items) return;
    const deletedItem = items.find(item => item.id === id);
    if (!deletedItem) return;
    
    const itemDoc = doc(itemsCollection, id);
    await deleteDoc(itemDoc);

    await addHistory({
        itemId: id,
        itemName: deletedItem.name,
        change: -deletedItem.quantity,
        newQuantity: 0,
        type: 'delete'
    });
  }, [itemsCollection, items, addHistory]);

  const addCategory = useCallback(async (name: string): Promise<Category> => {
    if (!categoriesCollection || !categories) {
        // This is a fallback if the collection isn't ready, but it won't be saved to DB.
        return { id: `local-${Date.now()}`, name, color: getRandomColor() };
    }
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return existingCategory;
    }
    
    const newCategoryData = {
      name,
      color: getRandomColor(),
    };
    const docRef = await addDoc(categoriesCollection, newCategoryData);
    return { ...newCategoryData, id: docRef.id };
  }, [categoriesCollection, categories]);

  const updateCategory = useCallback(async (id: string, name: string, color: string) => {
    if (!categoriesCollection) return;
    const categoryDoc = doc(categoriesCollection, id);
    await updateDoc(categoryDoc, { name, color });
  }, [categoriesCollection]);

  const deleteCategory = useCallback(async (id: string) => {
     if (!firestore || !itemsCollection || !categoriesCollection) return;
     
     const batch = writeBatch(firestore);
     
     const categoryDoc = doc(categoriesCollection, id);
     batch.delete(categoryDoc);
     
     // Un-categorize items that belonged to this category
     const itemsToUpdate = items?.filter(item => item.categoryId === id) || [];
     itemsToUpdate.forEach(item => {
         const itemDoc = doc(itemsCollection, item.id);
         batch.update(itemDoc, { categoryId: '' });
     });
     
     await batch.commit();

  }, [firestore, items, itemsCollection, categoriesCollection]);

  const availableSnapshotDates = useMemo(() => {
    if (!history || history.length === 0) return [];
    const dates = new Set(
      history.map(log =>
        startOfDay(parseISO(log.createdAt as unknown as string)).toISOString()
      )
    );
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [history]);

 const getInventorySnapshot = useCallback((date: string): Item[] => {
    const targetDate = new Date(date);
    const endOfTargetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    if (!history || !items) return [];

    const relevantHistory = history
      .filter(log => !isAfter(parseISO(log.createdAt as unknown as string), endOfTargetDay))
      .sort((a, b) => new Date(a.createdAt as unknown as string).getTime() - new Date(b.createdAt as unknown as string).getTime());

    const itemMap = new Map<string, Item>();
    const quantityMap = new Map<string, number>();

    for (const log of relevantHistory) {
      const baseItem = items.find(i => i.id === log.itemId);
      
      const itemDetails = baseItem || itemMap.get(log.itemId) || {
        id: log.itemId,
        name: log.itemName,
        description: "",
        quantity: 0,
        categoryId: "",
        createdAt: log.createdAt,
        value: 0
      };

      if (log.type === 'delete') {
         quantityMap.set(log.itemId, 0);
      } else {
         quantityMap.set(log.itemId, log.newQuantity);
      }
      
      itemMap.set(log.itemId, { ...itemDetails, quantity: quantityMap.get(log.itemId) || 0 });
    }

    return Array.from(itemMap.values()).filter(item => item.quantity > 0 || quantityMap.has(item.id));
}, [history, items]);


  return {
    items: items || [],
    categories: categories || [],
    history: history || [],
    addItem,
    updateItem,
    batchUpdateQuantities,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    isLoading,
    availableSnapshotDates,
    getInventorySnapshot,
  };
}
