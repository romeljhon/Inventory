
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Business, Branch, Item, Category, InventoryHistory, Employee } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const ACTIVE_BUSINESS_STORAGE_KEY = 'inventory-active-business';
const ACTIVE_BRANCH_STORAGE_KEY = 'inventory-active-branch';

interface BusinessContextType {
  business: Business | null; // The active business
  businesses: Business[]; // All businesses for the user
  branches: Branch[];
  employees: Employee[];
  activeBranch: Branch | null;
  isLoading: boolean;
  isNewUser: boolean;
  setupBusiness: (businessName: string, initialBranchName: string) => Promise<Business | undefined>;
  addBranch: (branchName: string) => Promise<Branch | undefined>;
  deleteBranch: (branchId: string) => Promise<void>;
  updateBusiness: (businessId: string, newName: string) => Promise<void>;
  updateBranch: (branchId: string, newName: string) => Promise<void>;
  addEmployee: (employeeData: Omit<Employee, "id" | "createdAt">) => Promise<Employee | undefined>;
  updateEmployee: (employeeId: string, employeeData: Partial<Omit<Employee, "id" | "createdAt">>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
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
  const { data: ownedBusinesses, loading: ownedBusinessesLoading } = useCollection<Business>(ownedBusinessesQuery);

  // 2. Fetch businesses where the user is an employee
  const employeeBusinessesQuery = useMemo(() => 
    firestore && user?.email ? query(collection(firestore, 'businesses'), where('employees', 'array-contains', user.email)) : null,
    [firestore, user?.email]
  );
  const { data: employeeBusinesses, loading: employeeBusinessesLoading } = useCollection<Business>(employeeBusinessesQuery);

  // 3. Combine owned and employee businesses
  const businesses = useMemo(() => {
    const allBusinesses = new Map<string, Business>();
    (ownedBusinesses || []).forEach(b => allBusinesses.set(b.id, b));
    (employeeBusinesses || []).forEach(b => allBusinesses.set(b.id, b));
    return Array.from(allBusinesses.values());
  }, [ownedBusinesses, employeeBusinesses]);


  // 4. Fetch branches for the currently active business
  const branchesCollectionRef = useMemo(() =>
    firestore && activeBusinessId ? collection(firestore, 'businesses', activeBusinessId, 'branches') : null,
    [firestore, activeBusinessId]
  );
  const { data: branchesData, loading: branchesLoading } = useCollection<Branch>(branchesCollectionRef);
  const branches = useMemo(() => branchesData || [], [branchesData]);
  
  // 5. Fetch employees for the currently active business
  const employeesCollectionRef = useMemo(() =>
    firestore && activeBusinessId ? collection(firestore, 'businesses', activeBusinessId, 'employees') : null,
    [firestore, activeBusinessId]
  );
  const { data: employeesData, loading: employeesLoading } = useCollection<Employee>(employeesCollectionRef);
  const employees = useMemo(() => employeesData || [], [employeesData]);

  // --- Derived State ---
  
  const business = useMemo(() => businesses.find(b => b.id === activeBusinessId) || null, [businesses, activeBusinessId]);
  const activeBranch = useMemo(() => branches?.find(b => b.id === activeBranchId) || null, [branches, activeBranchId]);

  const isLoading = userLoading || isBusinessLogicLoading || ownedBusinessesLoading || employeeBusinessesLoading;

  // --- Business Logic Effects ---
  
  // Effect to determine if the user is new and handle initial routing
  useEffect(() => {
    // We wait until the initial check for businesses is complete
    if (userLoading || ownedBusinessesLoading || employeeBusinessesLoading) return;

    if (user) {
      if ((ownedBusinesses || []).length === 0 && (employeeBusinesses || []).length === 0) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } else {
      setIsNewUser(false);
    }
    setIsBusinessLogicLoading(false);
  }, [user, ownedBusinesses, employeeBusinesses, userLoading, ownedBusinessesLoading, employeeBusinessesLoading]);

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
        employees: [],
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

  const updateBusiness = useCallback(async (businessId: string, newName: string): Promise<void> => {
    if (!firestore) return;
    const businessDocRef = doc(firestore, 'businesses', businessId);
    await updateDoc(businessDocRef, { name: newName }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: businessDocRef.path,
        operation: 'update',
        requestResourceData: { name: newName },
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
  }, [firestore]);

  const updateBranch = useCallback(async (branchId: string, newName: string): Promise<void> => {
    if (!firestore || !business?.id) return;
    const branchDocRef = doc(firestore, 'businesses', business.id, 'branches', branchId);
    await updateDoc(branchDocRef, { name: newName }).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: branchDocRef.path,
        operation: 'update',
        requestResourceData: { name: newName },
      });
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
  }, [firestore, business?.id]);


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
    
    // We optimistically update the UI, but will need to handle failure
    if (activeBranch?.id === branchId) {
        switchBranch(null);
    }
    
    try {
        // This is a simplification. In a real app, you might want to archive
        // this data or handle it more gracefully.
        const collectionsToDelete = ['items', 'categories', 'recipes', 'history'];
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

    } catch (e) {
        // If the delete fails, we should ideally revert the UI change
        // and show an error toast.
        console.error("Failed to delete branch:", e);
        const permissionError = new FirestorePermissionError({
            path: branchDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }, [firestore, business?.id, activeBranch?.id, switchBranch]);

  const addEmployee = useCallback(async (employeeData: Omit<Employee, "id" | "createdAt">): Promise<Employee | undefined> => {
    if (!firestore || !business?.id || !employeesCollectionRef) return;
    
    // In a real app, you would have a Cloud Function to find the user by email, get their UID,
    // and then create the employee document with that UID.
    // For now, we will add the email to the business's employee array and create a record.
    const businessDocRef = doc(firestore, 'businesses', business.id);

    await updateDoc(businessDocRef, {
        employees: arrayUnion(employeeData.email)
    });
    
    const newEmployeeData = {
      ...employeeData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(employeesCollectionRef, newEmployeeData)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: employeesCollectionRef.path,
          operation: 'create',
          requestResourceData: newEmployeeData,
        });
        errorEmitter.emit('permission-error', permissionError);
        return null;
      });
    
    if (!docRef) return undefined;
    
    return { id: docRef.id, ...newEmployeeData } as Employee;

  }, [firestore, business?.id, employeesCollectionRef]);

  const updateEmployee = useCallback(async (employeeId: string, employeeData: Partial<Omit<Employee, "id" | "createdAt">>) => {
    if (!employeesCollectionRef) return;
    const employeeDocRef = doc(employeesCollectionRef, employeeId);
    await updateDoc(employeeDocRef, employeeData).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: employeeDocRef.path,
        operation: 'update',
        requestResourceData: employeeData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [employeesCollectionRef]);
  
  const deleteEmployee = useCallback(async (employeeId: string) => {
    if (!firestore || !business?.id || !employeesCollectionRef) return;

    const employeeDocRef = doc(employeesCollectionRef, employeeId);
    const employee = (await getDoc(employeeDocRef)).data() as Employee;
    
    if (employee?.email) {
      const businessDocRef = doc(firestore, 'businesses', business.id);
      await updateDoc(businessDocRef, {
        employees: arrayRemove(employee.email)
      });
    }

    await deleteDoc(employeeDocRef).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: employeeDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, business?.id, employeesCollectionRef]);

  const contextValue = useMemo(() => ({
    business,
    businesses,
    branches,
    employees,
    activeBranch,
    isLoading,
    isNewUser,
    setupBusiness,
    addBranch,
    deleteBranch,
    updateBusiness,
    updateBranch,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    switchBusiness,
    switchBranch
  }), [
    business, 
    businesses, 
    branches, 
    employees,
    activeBranch, 
    isLoading, 
    isNewUser, 
    setupBusiness, 
    addBranch, 
    deleteBranch, 
    updateBusiness, 
    updateBranch,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    switchBusiness, 
    switchBranch
  ]);

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
