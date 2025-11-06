
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
  Timestamp,
} from "firebase/firestore";
import { startOfDay, parseISO, isAfter } from "date-fns";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Item, Category, InventoryHistory } from "@/lib/types";
import { useBusiness } from "./use-business";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export const LOW_STOCK_THRESHOLD = 10;

const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 10);
    const lightness = 40 + Math.floor(Math.random() * 10);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function useInventory(branchId: string | undefined) {
  const firestore = useFirestore();
  const { business } = useBusiness();

  const branchRef = useMemo(() =>
    firestore && business?.id && branchId ? doc(firestore, 'businesses', business.id, 'branches', branchId) : null,
    [firestore, business?.id, branchId]
  );
  
  const itemsCollection = useMemo(() => branchRef ? collection(branchRef, 'items') : null, [branchRef]);
  const categoriesCollection = useMemo(() => branchRef ? collection(branchRef, 'categories') : null, [branchRef]);
  const historyCollection = useMemo(() => branchRef ? collection(branchRef, 'history') : null, [branchRef]);
  
  const { data: itemsData, loading: itemsLoading } = useCollection<Item>(
    itemsCollection ? query(itemsCollection, orderBy('createdAt', 'desc')) : null
  );
  const { data: categoriesData, loading: categoriesLoading } = useCollection<Category>(categoriesCollection);
  const { data: historyData, loading: historyLoading } = useCollection<InventoryHistory>(
     historyCollection ? query(historyCollection, orderBy('createdAt', 'desc')) : null
  );

  // Memoize data to prevent unnecessary re-renders
  const items = useMemo(() => itemsData || [], [itemsData]);
  const categories = useMemo(() => categoriesData || [], [categoriesData]);
  const history = useMemo(() => historyData || [], [historyData]);

  const isLoading = itemsLoading || categoriesLoading || historyLoading;

  const addHistory = useCallback(async (log: Omit<InventoryHistory, 'id' | 'createdAt' | 'branchId'>) => {
    if (!historyCollection) return;
    const newHistory: Omit<InventoryHistory, 'id'|'branchId'> = {
        ...log,
        createdAt: serverTimestamp(),
    };
    addDoc(historyCollection, newHistory).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: historyCollection.path,
            operation: 'create',
            requestResourceData: newHistory,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [historyCollection]);

  const addItem = useCallback(async (itemData: Omit<Item, "id" | "createdAt">) => {
    if (!itemsCollection) return;
    const newItemData = {
        ...itemData,
        createdAt: serverTimestamp(),
      };
    addDoc(itemsCollection, newItemData).then(docRef => {
        addHistory({
            itemId: docRef.id,
            itemName: itemData.name,
            change: itemData.quantity,
            newQuantity: itemData.quantity,
            type: 'add'
        });
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemsCollection.path,
            operation: 'create',
            requestResourceData: newItemData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [itemsCollection, addHistory]);

  const updateItem = useCallback(async (id: string, updatedData: Partial<Omit<Item, "id" | "createdAt">>) => {
    if (!itemsCollection || !items) return;
    const itemDoc = doc(itemsCollection, id);
    const oldItem = items.find(i => i.id === id);
    
    updateDoc(itemDoc, updatedData).then(() => {
        if (oldItem && updatedData.quantity !== undefined && oldItem.quantity !== updatedData.quantity) {
            addHistory({
                itemId: id,
                itemName: updatedData.name || oldItem.name,
                change: updatedData.quantity - oldItem.quantity,
                newQuantity: updatedData.quantity,
                type: 'update'
            });
        }
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemDoc.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
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
          addHistory({
              itemId: itemId,
              itemName: oldItem.name,
              change: newQuantity - oldItem.quantity,
              newQuantity: newQuantity,
              type: 'quantity'
          });
      }
    }
    batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemsCollection.path,
            operation: 'update',
            requestResourceData: updates,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}, [firestore, itemsCollection, items, addHistory]);


  const deleteItem = useCallback(async (id: string) => {
    if (!itemsCollection || !items) return;
    const deletedItem = items.find(item => item.id === id);
    if (!deletedItem) return;
    
    const itemDoc = doc(itemsCollection, id);
    deleteDoc(itemDoc).then(() => {
        addHistory({
            itemId: id,
            itemName: deletedItem.name,
            change: -deletedItem.quantity,
            newQuantity: 0,
            type: 'delete'
        });
    }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: itemDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [itemsCollection, items, addHistory]);

  const addCategory = useCallback(async (name: string): Promise<Category> => {
    if (!categoriesCollection || !categories) {
        return { id: `local-${Date.now()}`, name, color: getRandomColor() };
    }
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return existingCategory;
    }
    
    const newCategoryData = { name, color: getRandomColor() };
    const docRef = await addDoc(categoriesCollection, newCategoryData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: categoriesCollection.path,
                operation: 'create',
                requestResourceData: newCategoryData,
            });
            errorEmitter.emit('permission-error', permissionError);
            return null;
        });

    if (!docRef) return { id: `local-${Date.now()}`, name, color: newCategoryData.color };
    
    return { ...newCategoryData, id: docRef.id };
  }, [categoriesCollection, categories]);

  const updateCategory = useCallback(async (id: string, name: string, color: string) => {
    if (!categoriesCollection) return;
    const categoryDoc = doc(categoriesCollection, id);
    updateDoc(categoryDoc, { name, color }).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: categoryDoc.path,
            operation: 'update',
            requestResourceData: { name, color },
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [categoriesCollection]);

  const deleteCategory = useCallback(async (id: string) => {
     if (!firestore || !itemsCollection || !categoriesCollection || !items) return;
     
     const batch = writeBatch(firestore);
     
     const categoryDoc = doc(categoriesCollection, id);
     batch.delete(categoryDoc);
     
     const itemsToUpdate = items.filter(item => item.categoryId === id);
     itemsToUpdate.forEach(item => {
         const itemDoc = doc(itemsCollection, item.id);
         batch.update(itemDoc, { categoryId: '' });
     });
     
     batch.commit().catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: categoryDoc.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
     });

  }, [firestore, items, itemsCollection, categoriesCollection]);

  const availableSnapshotDates = useMemo(() => {
    if (!history || history.length === 0) return [];
    const dates = new Set(
      history
        .filter(log => log.createdAt) // Filter out logs without a createdAt timestamp
        .map(log => {
            const date = log.createdAt instanceof Timestamp ? log.createdAt.toDate() : parseISO(log.createdAt as string);
            return startOfDay(date).toISOString();
        })
    );
    return Array.from(dates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [history]);

 const getInventorySnapshot = useCallback((date: string): Item[] => {
    const targetDate = new Date(date);
    const endOfTargetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    if (!history || !items) return [];

    const relevantHistory = history
      .filter(log => {
          if (!log.createdAt) return false;
          const logDate = log.createdAt instanceof Timestamp ? log.createdAt.toDate() : parseISO(log.createdAt as string);
          return !isAfter(logDate, endOfTargetDay);
      })
      .sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : parseISO(a.createdAt as string);
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : parseISO(b.createdAt as string);
          return dateA.getTime() - dateB.getTime();
      });

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
    items,
    categories,
    history,
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
