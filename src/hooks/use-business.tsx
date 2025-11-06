
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp, getFirestore } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Business, Branch, Item, Category, InventoryHistory } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const ACTIVE_BRANCH_STORAGE_KEY = 'stock-sherpa-active-branch';

interface BusinessContextType {
  business: Business | null;
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  setupBusiness: (businessName: string, initialBranchName: string) => Promise<void>;
  addBranch: (branchName: string) => Promise<Branch | undefined>;
  deleteBranch: (branchId: string) => Promise<void>;
  switchBranch: (branchId: string | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  
  const businessQuery = useMemo(() => 
    firestore && user?.uid ? query(collection(firestore, 'businesses'), where('ownerId', '==', user.uid)) : null,
    [firestore, user?.uid]
  );

  const { data: businesses, loading: businessLoading } = useCollection<Business>(businessQuery);
  
  const business = useMemo(() => (businesses && businesses.length > 0 ? businesses[0] : null), [businesses]);

  const branchesCollectionRef = useMemo(() => 
    firestore && business?.id ? collection(firestore, 'businesses', business.id, 'branches') : null,
    [firestore, business?.id]
  );
  
  const { data: branches, loading: branchesLoading } = useCollection<Branch>(branchesCollectionRef);

  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  
  const isLoading = userLoading || businessLoading || branchesLoading;

  useEffect(() => {
    const storedActiveBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
    if (storedActiveBranchId && storedActiveBranchId !== 'null') {
      setActiveBranchId(storedActiveBranchId);
    }
  }, []);

  const activeBranch = useMemo(() => {
    if (branches && branches.length > 0 && !activeBranchId) {
      // If no branch is active, default to the first one
      switchBranch(branches[0].id);
      return branches[0];
    }
    return branches?.find(b => b.id === activeBranchId) || null;
  }, [branches, activeBranchId]);

  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string) => {
    if (!firestore || !user) return;
    
    const db = getFirestore();
    const batch = writeBatch(db);

    const businessData: Omit<Business, 'id'> = { 
      name: businessName,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    };
    
    // Create a ref for a new business document
    const newBusinessRef = doc(collection(db, 'businesses'));
    batch.set(newBusinessRef, businessData);

    const branchData: Omit<Branch, 'id'> = { 
      name: initialBranchName,
      createdAt: serverTimestamp(),
    };

    // Create a ref for a new branch document inside the new business
    const newBranchRef = doc(collection(newBusinessRef, 'branches'));
    batch.set(newBranchRef, branchData);
    
    batch.commit().then(() => {
      switchBranch(newBranchRef.id);
    }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
          path: newBusinessRef.path,
          operation: 'create',
          requestResourceData: businessData,
      });
      errorEmitter.emit('permission-error', permissionError);
      console.error("Failed to setup business", serverError);
    });
    
  }, [firestore, user]);

  const addBranch = useCallback(async (branchName: string): Promise<Branch | undefined> => {
    if (!branchesCollectionRef) return undefined;

    const branchData: Omit<Branch, 'id'> = { name: branchName, createdAt: serverTimestamp() };
    const docRef = await addDoc(branchesCollectionRef, branchData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: branchesCollectionRef.path,
          operation: 'create',
          requestResourceData: branchData,
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
      });

    if (!docRef) return undefined;
    
    return { ...branchData, id: docRef.id } as Branch;
  }, [branchesCollectionRef]);

  const deleteBranch = useCallback(async (branchId: string) => {
    if (!firestore || !business?.id) return;
    
    try {
      const batch = writeBatch(firestore);
      
      const branchDocRef = doc(firestore, 'businesses', business.id, 'branches', branchId);
      batch.delete(branchDocRef);

      // Recursively delete subcollections (items, categories, history)
      const itemsRef = collection(branchDocRef, 'items');
      const categoriesRef = collection(branchDocRef, 'categories');
      const historyRef = collection(branchDocRef, 'history');
      
      const [itemsSnapshot, categoriesSnapshot, historySnapshot] = await Promise.all([
        getDocs(itemsRef),
        getDocs(categoriesRef),
        getDocs(historyRef)
      ]);
      
      itemsSnapshot.forEach(doc => batch.delete(doc.ref));
      categoriesSnapshot.forEach(doc => batch.delete(doc.ref));
      historySnapshot.forEach(doc => batch.delete(doc.ref));

      await batch.commit();

      if (activeBranch?.id === branchId) {
        switchBranch(null);
      }
    } catch (e) {
      console.error("Failed to delete branch and its data", e);
       const permissionError = new FirestorePermissionError({
          path: `/businesses/${business.id}/branches/${branchId}`,
          operation: 'delete',
        });
      errorEmitter.emit('permission-error', permissionError);
    }
  }, [firestore, business?.id, activeBranch?.id]);

  const switchBranch = useCallback((branchId: string | null) => {
    setActiveBranchId(branchId);
    if (branchId) {
      localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId);
    } else {
      localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
    }
  }, []);

  const contextValue = useMemo(() => ({
    business,
    branches: branches || [],
    activeBranch,
    isLoading,
    setupBusiness,
    addBranch,
    deleteBranch,
    switchBranch
  }), [business, branches, activeBranch, isLoading, setupBusiness, addBranch, deleteBranch, switchBranch]);

  return (
    <BusinessContext.Provider value={contextValue}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};
