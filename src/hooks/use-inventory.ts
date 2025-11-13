
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
import { startOfDay, parseISO, isAfter, endOfDay, isBefore } from "date-fns";
import { useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Item, Category, InventoryHistory, Recipe, PurchaseOrder, PurchaseOrderItem, Sale } from "@/lib/types";
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

type ProcessSalePayload = {
  items: (Item & { saleQuantity: number })[];
  discount: number;
  total: number;
  paymentMethod: string;
};

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
  const recipesCollection = useMemo(() => branchRef ? collection(branchRef, 'recipes') : null, [branchRef]);
  const poCollection = useMemo(() => branchRef ? collection(branchRef, 'purchaseOrders') : null, [branchRef]);
  const salesCollection = useMemo(() => branchRef ? collection(branchRef, 'sales') : null, [branchRef]);
  
  const { data: itemsData, loading: itemsLoading } = useCollection<Item>(
    itemsCollection ? query(itemsCollection, orderBy('createdAt', 'desc')) : null
  );
  const { data: categoriesData, loading: categoriesLoading } = useCollection<Category>(categoriesCollection);
  const { data: historyData, loading: historyLoading } = useCollection<InventoryHistory>(
     historyCollection ? query(historyCollection, orderBy('createdAt', 'desc')) : null
  );
  const { data: recipesData, loading: recipesLoading } = useCollection<Recipe>(
    recipesCollection ? query(recipesCollection, orderBy('createdAt', 'desc')) : null
  );

  // Memoize data to prevent unnecessary re-renders
  const items = useMemo(() => itemsData || [], [itemsData]);
  const categories = useMemo(() => categoriesData || [], [categoriesData]);
  const history = useMemo(() => historyData || [], [historyData]);
  const recipes = useMemo(() => recipesData || [], [recipesData]);

  const isLoading = itemsLoading || categoriesLoading || historyLoading || recipesLoading;

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
    
    // Create a mutable copy of the updatedData to potentially add a server timestamp.
    const dataToUpdate = { ...updatedData };
    
    updateDoc(itemDoc, dataToUpdate).then(() => {
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
            requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  }, [itemsCollection, addHistory, items]);
  
  const processSale = useCallback(async (payload: ProcessSalePayload) => {
    if (!firestore || !itemsCollection || !salesCollection || !items) return;
    const batch = writeBatch(firestore);

    const componentDeductions: Record<string, number> = {};

    for (const cartItem of payload.items) {
      const recipe = recipes.find(r => r.productId === cartItem.id);
      const cartItemIsComponent = items.find(i => i.id === cartItem.id)?.itemType === 'Component';
      
      if (recipe) {
        for (const component of recipe.components) {
          const totalDeduction = component.quantity * cartItem.saleQuantity;
          componentDeductions[component.itemId] = (componentDeductions[component.itemId] || 0) + totalDeduction;
        }
      } else if (cartItemIsComponent) {
        componentDeductions[cartItem.id] = (componentDeductions[cartItem.id] || 0) + cartItem.saleQuantity;
      }
    }

    // Apply component deductions
    for (const componentId in componentDeductions) {
      const componentItem = items.find(i => i.id === componentId);
      if (componentItem) {
        const newQuantity = Math.max(0, componentItem.quantity - componentDeductions[componentId]);
        const itemDoc = doc(itemsCollection, componentId);
        batch.update(itemDoc, { quantity: newQuantity });

        addHistory({
          itemId: componentId,
          itemName: componentItem.name,
          change: -componentDeductions[componentId],
          newQuantity: newQuantity,
          type: 'quantity', // Using 'quantity' for component deductions from a sale
        });
      }
    }

    // Create a new sale document
    const saleData: Omit<Sale, 'id'> = {
      items: payload.items.map(i => ({ itemId: i.id, name: i.name, quantity: i.saleQuantity, price: i.value })),
      subtotal: payload.items.reduce((acc, i) => acc + (i.value * i.saleQuantity), 0),
      discount: payload.discount,
      total: payload.total,
      paymentMethod: payload.paymentMethod,
      createdAt: serverTimestamp(),
    };
    const saleDocRef = doc(salesCollection);
    batch.set(saleDocRef, saleData);

    await batch.commit().catch(async (serverError) => {
        // This is a simplified error context for the entire batch.
        const permissionError = new FirestorePermissionError({
            path: salesCollection.path, // Use sales collection path for context
            operation: 'create',
            requestResourceData: payload,
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [firestore, itemsCollection, salesCollection, items, recipes, addHistory]);

  const batchUpdateQuantities = useCallback(async (updates: Record<string, number>) => {
    if (!firestore || !itemsCollection || !items) return;
    const batch = writeBatch(firestore);

    for (const itemId in updates) {
      const originalItem = items.find(i => i.id === itemId);
      if (originalItem) {
        const newQuantity = Math.max(0, updates[itemId]);
        if (originalItem.quantity !== newQuantity) {
          const itemDoc = doc(itemsCollection, itemId);
          batch.update(itemDoc, { quantity: newQuantity });
          addHistory({
            itemId: itemId,
            itemName: originalItem.name,
            change: newQuantity - originalItem.quantity,
            newQuantity: newQuantity,
            type: 'quantity',
          });
        }
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
    if (!firestore || !itemsCollection || !items || !recipesCollection) return;
    
    const deletedItem = items.find(item => item.id === id);
    if (!deletedItem) return;

    const batch = writeBatch(firestore);
    
    const itemDoc = doc(itemsCollection, id);
    batch.delete(itemDoc);
    
    // If the deleted item is a product, also delete its recipe
    if (deletedItem.itemType === 'Product') {
        const recipeToDelete = recipes.find(r => r.productId === id);
        if (recipeToDelete) {
            const recipeDoc = doc(recipesCollection, recipeToDelete.id);
            batch.delete(recipeDoc);
        }
    }

    batch.commit().then(() => {
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
  }, [firestore, itemsCollection, items, recipes, recipesCollection, addHistory]);

  const addCategory = useCallback(async (name: string, showInSales: boolean = false): Promise<Category> => {
    if (!categoriesCollection || !categories) {
        return { id: `local-${Date.now()}`, name, color: getRandomColor(), showInSales };
    }
    const existingCategory = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existingCategory) {
        return existingCategory;
    }
    
    const newCategoryData = { name, color: getRandomColor(), showInSales };
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

    if (!docRef) return { id: `local-${Date.now()}`, name, color: newCategoryData.color, showInSales };
    
    return { ...newCategoryData, id: docRef.id };
  }, [categoriesCollection, categories]);

  const updateCategory = useCallback(async (id: string, data: Partial<Omit<Category, 'id'>>) => {
    if (!categoriesCollection) return;
    const categoryDoc = doc(categoriesCollection, id);
    updateDoc(categoryDoc, data).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: categoryDoc.path,
            operation: 'update',
            requestResourceData: data,
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

   const addRecipe = useCallback(async (recipeData: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (!recipesCollection) return;
    const newRecipeData = {
      ...recipeData,
      createdAt: serverTimestamp(),
    };
    addDoc(recipesCollection, newRecipeData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: recipesCollection.path,
        operation: 'create',
        requestResourceData: newRecipeData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [recipesCollection]);

  const updateRecipe = useCallback(async (id: string, updatedData: Partial<Omit<Recipe, 'id' | 'createdAt'>>) => {
    if (!recipesCollection) return;
    const recipeDoc = doc(recipesCollection, id);
    updateDoc(recipeDoc, updatedData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: recipeDoc.path,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [recipesCollection]);

  const deleteRecipe = useCallback(async (id: string) => {
    if (!recipesCollection) return;
    const recipeDoc = doc(recipesCollection, id);
    deleteDoc(recipeDoc).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: recipeDoc.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [recipesCollection]);

  const addPurchaseOrder = useCallback(async (poData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    if (!poCollection) return;
    const newPOData = {
      ...poData,
      createdAt: serverTimestamp(),
    };
    addDoc(poCollection, newPOData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: poCollection.path,
        operation: 'create',
        requestResourceData: newPOData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [poCollection]);

  const updatePurchaseOrder = useCallback(async (id: string, updatedData: Partial<Omit<PurchaseOrder, 'id' | 'createdAt'>>) => {
    if (!poCollection) return;
    const poDoc = doc(poCollection, id);
    updateDoc(poDoc, updatedData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: poDoc.path,
        operation: 'update',
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [poCollection]);

  const deletePurchaseOrder = useCallback(async (id: string) => {
    if (!poCollection) return;
    const poDoc = doc(poCollection, id);
    deleteDoc(poDoc).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: poDoc.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [poCollection]);

  const receivePurchaseOrder = useCallback(async (poId: string, poItems: PurchaseOrderItem[]) => {
    if (!firestore || !itemsCollection || !poCollection || !items) return;

    const batch = writeBatch(firestore);

    // Update quantities for each item in the PO
    for (const poItem of poItems) {
      const itemDocRef = doc(itemsCollection, poItem.itemId);
      const currentItem = items.find(i => i.id === poItem.itemId);
      if (currentItem) {
        const newQuantity = currentItem.quantity + poItem.quantity;
        batch.update(itemDocRef, { quantity: newQuantity });
        addHistory({
            itemId: poItem.itemId,
            itemName: poItem.itemName,
            change: poItem.quantity,
            newQuantity: newQuantity,
            type: 'po-receive',
        });
      }
    }

    // Update the PO status to 'Received'
    const poDocRef = doc(poCollection, poId);
    batch.update(poDocRef, { status: 'Received', receivedDate: serverTimestamp() });

    await batch.commit().catch(async (serverError) => {
        // This is a simplified error context. A real app might need more detail.
        const permissionError = new FirestorePermissionError({
            path: poCollection.path,
            operation: 'update',
        });
        errorEmitter.emit('permission-error', permissionError);
    });

  }, [firestore, poCollection, itemsCollection, items, addHistory]);

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
    const endOfTargetDay = endOfDay(new Date(date));
    if (!history || !items) return [];

    // Filter logs to only include those up to the end of the target day, sorted oldest to newest
    const relevantLogs = history
      .map(log => ({
        ...log,
        createdAtDate: log.createdAt instanceof Timestamp ? log.createdAt.toDate() : new Date(log.createdAt as string)
      }))
      .filter(log => isBefore(log.createdAtDate, endOfTargetDay))
      .sort((a, b) => a.createdAtDate.getTime() - b.createdAtDate.getTime());

    const snapshotItems = new Map<string, Item>();
    const allItemsFromHistory = new Map<string, Omit<Item, 'quantity'>>();

    // First pass: get the static data for all items that ever existed up to the snapshot date
    for (const item of items) {
      const createdAt = item.createdAt instanceof Timestamp ? item.createdAt.toDate() : new Date(item.createdAt as string);
      if (isBefore(createdAt, endOfTargetDay)) {
        const { quantity, ...rest } = item;
        allItemsFromHistory.set(item.id, rest);
      }
    }

    // Second pass: replay history to calculate quantities
    for (const log of relevantLogs) {
      if (log.type === 'add' || log.type === 'initial') {
        const baseItem = allItemsFromHistory.get(log.itemId);
        if (baseItem) {
          snapshotItems.set(log.itemId, {
            ...baseItem,
            quantity: log.newQuantity,
          });
        }
      } else if (log.type === 'quantity' || log.type === 'update') {
        const item = snapshotItems.get(log.itemId);
        if (item) {
          item.quantity = log.newQuantity;
          snapshotItems.set(log.itemId, item);
        }
      } else if (log.type === 'delete') {
        snapshotItems.delete(log.itemId);
      }
    }

    return Array.from(snapshotItems.values());
  }, [history, items]);


  return {
    items,
    categories,
    recipes,
    history,
    addItem,
    updateItem,
    batchUpdateQuantities,
    processSale,
    deleteItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    receivePurchaseOrder,
    isLoading,
    availableSnapshotDates,
    getInventorySnapshot,
  };
}
