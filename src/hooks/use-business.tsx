
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Business, Branch, Item, Category, InventoryHistory } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';

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
  
  // For this prototype, we'll assume one business per user.
  // The business ID could be the user's UID in a real multi-tenant app.
  const businessId = user ? `business-for-${user.uid}` : null;
  
  const { data: businesses, loading: businessLoading } = useCollection<Business>(
    firestore && user?.uid ? query(collection(firestore, 'businesses'), where('ownerId', '==', user.uid)) : null
  );
  
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
    return branches?.find(b => b.id === activeBranchId) || null;
  }, [branches, activeBranchId]);

  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string) => {
    if (!firestore || !user) return;
    
    // We can't use the `business` object here because it might not be loaded yet.
    // The user has no business, so we create one.
    const businessDocRef = doc(firestore, 'businesses', businessId!);
    
    const businessData: Omit<Business, 'id'> = { 
      name: businessName,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
    };

    const branchCollectionRef = collection(businessDocRef, 'branches');
    const branchData: Omit<Branch, 'id'> = { 
      name: initialBranchName,
      createdAt: serverTimestamp(),
    };
    
    try {
      const batch = writeBatch(firestore);
      batch.set(businessDocRef, businessData);
      
      const newBranchDoc = doc(branchCollectionRef);
      batch.set(newBranchDoc, branchData);
      
      await batch.commit();

      switchBranch(newBranchDoc.id);
      
    } catch(e) {
      console.error("Failed to setup business", e);
    }
    
  }, [firestore, user, businessId]);

  const addBranch = useCallback(async (branchName: string): Promise<Branch | undefined> => {
    if (!branchesCollectionRef) return undefined;

    const branchData: Omit<Branch, 'id'> = { name: branchName, createdAt: serverTimestamp() };
    const docRef = await addDoc(branchesCollectionRef, branchData);
    
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
    }
  }, [firestore, business?.id, activeBranch?.id]);

  const switchBranch = useCallback((branchId: string | null) => {
    setActiveBranchId(branchId);
    localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId || 'null');
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
