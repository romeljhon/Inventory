
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
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
  isUserLoading: boolean;
  setupBusiness: (businessName: string, initialBranchName: string) => Promise<void>;
  addBranch: (branchName: string) => Promise<Branch | undefined>;
  deleteBranch: (branchId: string) => Promise<void>;
  switchBranch: (branchId: string | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
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
  
  const { data: branchesData, loading: branchesLoading } = useCollection<Branch>(branchesCollectionRef);
  const branches = useMemo(() => branchesData || [], [branchesData]);

  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  
  const isLoading = userLoading || businessLoading || branchesLoading;
  
  const switchBranch = useCallback((branchId: string | null) => {
    setActiveBranchId(branchId);
    if (branchId) {
      localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId);
    } else {
      localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
        router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const storedActiveBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
    if (storedActiveBranchId && storedActiveBranchId !== 'null') {
      setActiveBranchId(storedActiveBranchId);
    }
  }, []);

  // Effect to set the default active branch if none is set
  useEffect(() => {
    if (!activeBranchId && branches && branches.length > 0) {
      const branchExists = branches.some(b => b.id === activeBranchId);
      if (!branchExists) {
        switchBranch(branches[0].id);
      }
    }
  }, [branches, activeBranchId, switchBranch]);

  const activeBranch = useMemo(() => {
    return branches?.find(b => b.id === activeBranchId) || null;
  }, [branches, activeBranchId]);

  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string) => {
    if (!firestore || !user?.uid) {
        console.error("Setup cannot proceed: Firestore not initialized or user not authenticated.");
        return;
    }

    try {
        // Create business document first
        const newBusinessRef = doc(collection(firestore, 'businesses'));
        const businessData = { 
            name: businessName,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
        };
        await setDoc(newBusinessRef, businessData);

        // Then create the initial branch sub-collection
        const newBranchRef = doc(collection(newBusinessRef, 'branches'));
        const branchData = { 
            name: initialBranchName,
            createdAt: serverTimestamp(),
        };
        await setDoc(newBranchRef, branchData);

    } catch (serverError: any) {
        console.error("Failed to setup business:", serverError);
        const permissionError = new FirestorePermissionError({
            path: `businesses/ (and /branches/)`,
            operation: 'create',
            requestResourceData: { businessName, initialBranchName },
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    
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
    
    const branchDocRef = doc(firestore, 'businesses', business.id, 'branches', branchId);
    
    // We can't do this in a batch write as reads cannot be part of a batch.
    // This is a simplified approach for the prototype. In a real app, you might use a Firebase Function.
    try {
        const collectionsToDelete = ['items', 'categories', 'history'];
        for (const subcollection of collectionsToDelete) {
            const subcollectionRef = collection(branchDocRef, subcollection);
            const snapshot = await getDocs(subcollectionRef);
            const deleteBatch = writeBatch(firestore);
            snapshot.forEach(doc => deleteBatch.delete(doc.ref));
            await deleteBatch.commit();
        }

        await deleteDoc(branchDocRef);

        if (activeBranch?.id === branchId) {
            switchBranch(null);
        }
    } catch (e) {
        const permissionError = new FirestorePermissionError({
            path: branchDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }, [firestore, business?.id, activeBranch?.id, switchBranch]);

  const contextValue = useMemo(() => ({
    business,
    branches,
    activeBranch,
    isLoading,
    isUserLoading: userLoading,
    setupBusiness,
    addBranch,
    deleteBranch,
    switchBranch
  }), [business, branches, activeBranch, isLoading, userLoading, setupBusiness, addBranch, deleteBranch, switchBranch]);

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
