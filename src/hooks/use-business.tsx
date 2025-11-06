
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Business, Branch, Item, Category, InventoryHistory } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


const ACTIVE_BUSINESS_STORAGE_KEY = 'stock-sherpa-active-business';
const ACTIVE_BRANCH_STORAGE_KEY = 'stock-sherpa-active-branch';

interface BusinessContextType {
  business: Business | null; // The active business
  businesses: Business[]; // All businesses for the user
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  isUserLoading: boolean;
  setupBusiness: (businessName: string, initialBranchName: string) => Promise<Business | undefined>;
  addBranch: (branchName: string) => Promise<Branch | undefined>;
  deleteBranch: (branchId: string) => Promise<void>;
  switchBusiness: (businessId: string | null) => void;
  switchBranch: (branchId: string | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);

  const businessQuery = useMemo(() => 
    firestore && user?.uid ? query(collection(firestore, 'businesses'), where('ownerId', '==', user.uid)) : null,
    [firestore, user?.uid]
  );

  const { data: businessesData, loading: businessesLoading } = useCollection<Business>(businessQuery);
  const businesses = useMemo(() => businessesData || [], [businessesData]);
  
  const business = useMemo(() => businesses.find(b => b.id === activeBusinessId) || null, [businesses, activeBusinessId]);

  const branchesCollectionRef = useMemo(() => 
    firestore && activeBusinessId ? collection(firestore, 'businesses', activeBusinessId, 'branches') : null,
    [firestore, activeBusinessId]
  );
  
  const { data: branchesData, loading: branchesLoading } = useCollection<Branch>(branchesCollectionRef);
  const branches = useMemo(() => branchesData || [], [branchesData]);

  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  
  const isLoading = userLoading || businessesLoading || branchesLoading;
  
  const switchBusiness = useCallback((businessId: string | null) => {
    setActiveBusinessId(businessId);
    switchBranch(null); // Reset active branch when switching business
    if (businessId) {
      localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, businessId);
    } else {
      localStorage.removeItem(ACTIVE_BUSINESS_STORAGE_KEY);
    }
  }, []);

  const switchBranch = useCallback((branchId: string | null) => {
    setActiveBranchId(branchId);
    if (branchId) {
      localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId);
    } else {
      localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
        router.push('/login');
    }
     if (!isLoading && user && businesses.length === 0 && window.location.pathname !== '/setup') {
      router.push('/setup');
    }
  }, [isLoading, user, businesses, router]);

  useEffect(() => {
    const storedActiveBusinessId = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
    if (storedActiveBusinessId) {
        setActiveBusinessId(storedActiveBusinessId);
    }
    const storedActiveBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
    if (storedActiveBranchId && storedActiveBranchId !== 'null') {
      setActiveBranchId(storedActiveBranchId);
    } else {
        setActiveBranchId(null);
    }
  }, []);

  // Auto-select business if only one exists
  useEffect(() => {
    if (!isLoading && businesses.length === 1 && !activeBusinessId) {
        switchBusiness(businesses[0].id);
    }
  }, [isLoading, businesses, activeBusinessId, switchBusiness]);


  // Effect to validate stored active branch
  useEffect(() => {
    if (branches && branches.length > 0) {
      const storedActiveBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
      const branchExists = branches.some(b => b.id === storedActiveBranchId);
      if (!storedActiveBranchId || !branchExists) {
        if (storedActiveBranchId && !branchExists) {
            switchBranch(null);
        }
      }
    } else if (branches.length === 0) {
        switchBranch(null);
    }
  }, [branches, switchBranch]);

  const activeBranch = useMemo(() => {
    return branches?.find(b => b.id === activeBranchId) || null;
  }, [branches, activeBranchId]);

  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string): Promise<Business | undefined> => {
    if (!firestore || !user?.uid) {
        console.error("Setup cannot proceed: Firestore not initialized or user not authenticated.");
        return;
    }

    try {
        const newBusinessRef = doc(collection(firestore, 'businesses'));
        const businessData = { 
            name: businessName,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
        };
        await setDoc(newBusinessRef, businessData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: newBusinessRef.path,
            operation: 'create',
            requestResourceData: businessData,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw serverError;
        });

        const newBranchRef = doc(collection(newBusinessRef, 'branches'));
        const branchData = { 
            name: initialBranchName,
            createdAt: serverTimestamp(),
        };
        await setDoc(newBranchRef, branchData).catch(async (serverError) => {
           const permissionError = new FirestorePermissionError({
            path: newBranchRef.path,
            operation: 'create',
            requestResourceData: branchData,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw serverError;
        });

        return { id: newBusinessRef.id, ...businessData } as Business;

    } catch (error) {
        // Errors are handled in .catch blocks
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
    businesses,
    branches,
    activeBranch,
    isLoading,
    isUserLoading: userLoading,
    setupBusiness,
    addBranch,
    deleteBranch,
    switchBusiness,
    switchBranch
  }), [business, businesses, branches, activeBranch, isLoading, userLoading, setupBusiness, addBranch, deleteBranch, switchBusiness, switchBranch]);

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
