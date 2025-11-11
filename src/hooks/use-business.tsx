
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Business, Branch, Item, Category, InventoryHistory } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ACTIVE_BUSINESS_STORAGE_KEY = 'inventory-active-business';
const ACTIVE_BRANCH_STORAGE_KEY = 'inventory-active-branch';

interface BusinessContextType {
  business: Business | null; // The active business
  businesses: Business[]; // All businesses for the user
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  isNewUser: boolean;
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
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isBusinessLogicLoading, setIsBusinessLogicLoading] = useState(true);

  // --- Data Fetching ---

  // 1. Fetch businesses owned by the current user
  const ownedBusinessesQuery = useMemo(() =>
    firestore && user?.uid ? query(collection(firestore, 'businesses'), where('ownerId', '==', user.uid)) : null,
    [firestore, user?.uid]
  );
  const { data: ownedBusinessesData, loading: ownedBusinessesLoading } = useCollection<Business>(ownedBusinessesQuery);
  const ownedBusinesses = useMemo(() => ownedBusinessesData || [], [ownedBusinessesData]);

  // For now, businesses the user has access to is just the ones they own.
  // This could be expanded to include businesses they are an employee of.
  const businesses = ownedBusinesses;

  // 2. Fetch branches for the currently active business
  const branchesCollectionRef = useMemo(() =>
    firestore && activeBusinessId ? collection(firestore, 'businesses', activeBusinessId, 'branches') : null,
    [firestore, activeBusinessId]
  );
  const { data: branchesData, loading: branchesLoading } = useCollection<Branch>(branchesCollectionRef);
  const branches = useMemo(() => branchesData || [], [branchesData]);
  
  // --- Derived State ---
  
  const business = useMemo(() => businesses.find(b => b.id === activeBusinessId) || null, [businesses, activeBusinessId]);
  const activeBranch = useMemo(() => branches?.find(b => b.id === activeBranchId) || null, [branches, activeBranchId]);

  const isLoading = userLoading || isBusinessLogicLoading;

  // --- Business Logic Effects ---
  
  // Effect to determine if the user is new and handle initial routing
  useEffect(() => {
    // We wait until the initial check for businesses is complete
    if (userLoading || ownedBusinessesLoading) return;

    if (user) {
      if (ownedBusinesses.length === 0) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } else {
      setIsNewUser(false);
    }
    setIsBusinessLogicLoading(false);
  }, [user, ownedBusinesses, userLoading, ownedBusinessesLoading]);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const unauthenticatedPages = ['/login', '/signup', '/forgot-password', '/'];
    const path = window.location.pathname;

    if (!user && !unauthenticatedPages.includes(path)) {
      router.replace('/login');
    } else if (user && isNewUser && path !== '/setup') {
      router.replace('/setup');
    }
  }, [user, isNewUser, isLoading, router]);

  // Restore state from localStorage
  useEffect(() => {
    const storedBusinessId = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
    if (storedBusinessId && businesses.some(b => b.id === storedBusinessId)) {
      setActiveBusinessId(storedBusinessId);
    } else if (businesses.length > 0) {
      // Default to the first business if none is selected or stored one is invalid
      setActiveBusinessId(businesses[0].id);
    }

    const storedBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
    if (storedBranchId && branches.some(b => b.id === storedBranchId)) {
        setActiveBranchId(storedBranchId);
    } else {
        setActiveBranchId(null);
    }
  }, [businesses, branches]); // Re-run when businesses/branches load


  // --- Actions ---

  const switchBusiness = useCallback((businessId: string | null) => {
    setActiveBusinessId(businessId);
    setActiveBranchId(null); // Reset active branch when switching business
    if (businessId) {
      localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, businessId);
      localStorage.removeItem(ACTIVE_BRANCH_STORAGE_KEY);
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

  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string): Promise<Business | undefined> => {
    if (!firestore || !user?.uid) {
        console.error("Setup cannot proceed: Firestore not initialized or user not authenticated.");
        return;
    }

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
    const branchData = { name: initialBranchName, createdAt: serverTimestamp() };
    
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
        const collectionsToDelete = ['items', 'categories', 'recipes', 'history', 'employees'];
        for (const subcollection of collectionsToDelete) {
            const subcollectionRef = collection(branchDocRef, subcollection);
            const snapshot = await getDocs(subcollectionRef);
            if (!snapshot.empty) {
              const deleteBatch = writeBatch(firestore);
              snapshot.forEach(doc => deleteBatch.delete(doc.ref));
              await deleteBatch.commit();
            }
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
    isNewUser,
    setupBusiness,
    addBranch,
    deleteBranch,
    switchBusiness,
    switchBranch
  }), [business, businesses, branches, activeBranch, isLoading, isNewUser, setupBusiness, addBranch, deleteBranch, switchBusiness, switchBranch]);

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
