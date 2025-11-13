
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc, collection, addDoc, deleteDoc, writeBatch, getDocs, query, where, serverTimestamp, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Business, Branch, Item, Category, InventoryHistory, Employee } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlanId, planLimits } from '@/lib/plans';
import { isBefore, subMonths } from 'date-fns';
import { useToast } from './use-toast';

const ACTIVE_BUSINESS_STORAGE_KEY = 'inventory-active-business';
const ACTIVE_BRANCH_STORAGE_KEY = 'inventory-active-branch';
const SUPER_ADMIN_EMAIL = 'romeljhonsalvaleon27@gmail.com';


interface BusinessContextType {
  business: Business | null; // The active business
  businesses: Business[]; // All businesses for the user
  branches: Branch[];
  employees: Employee[];
  activeBranch: Branch | null;
  isLoading: boolean;
  isNewUser: boolean;
  isSuperAdmin: boolean;
  userRole: 'Owner' | 'Admin' | 'Staff' | null;
  setupBusiness: (businessName: string, initialBranchName: string) => Promise<Business | undefined>;
  addBranch: (branchName: string) => Promise<Branch | undefined>;
  deleteBranch: (branchId: string) => Promise<void>;
  updateBusiness: (businessId: string, newName: string) => Promise<void>;
  updateBranch: (branchId: string, newName: string) => Promise<void>;
  updateTier: (businessId: string, newTier: PlanId) => Promise<void>;
  addEmployee: (employeeData: Omit<Employee, "id" | "createdAt">) => Promise<Employee | undefined>;
  updateEmployee: (employeeId: string, employeeData: Partial<Omit<Employee, "id" | "createdAt">>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  incrementUsage: (field: 'items' | 'sales' | 'purchaseOrders' | 'aiScans' | 'branches', count?: number) => Promise<void>;
  switchBusiness: (businessId: string | null) => void;
  switchBranch: (branchId: string | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [activeBusinessId, setActiveBusinessId] = useState<string | null>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isBusinessLogicLoading, setIsBusinessLogicLoading] = useState(true);

  const isSuperAdmin = useMemo(() => user?.email === SUPER_ADMIN_EMAIL, [user]);

  // --- Data Fetching ---

  // 1. Fetch businesses where the user has a role
  const businessesWithRoleQuery = useMemo(() => {
    if (!firestore || !user?.uid) return null;
    // Super admin should not be limited by roles
    if (isSuperAdmin) return collection(firestore, 'businesses');
    return query(collection(firestore, 'businesses'), where(`roles.${user.uid}`, 'in', ['Owner', 'Admin', 'Staff']))
  }, [firestore, user?.uid, isSuperAdmin]);
  const { data: businesses, loading: businessesLoading } = useCollection<Business>(businessesWithRoleQuery);

  // 2. Fetch branches for the currently active business
  const branchesCollectionRef = useMemo(() =>
    firestore && activeBusinessId ? collection(firestore, 'businesses', activeBusinessId, 'branches') : null,
    [firestore, activeBusinessId]
  );
  const { data: branchesData, loading: branchesLoading } = useCollection<Branch>(branchesCollectionRef);
  const branches = useMemo(() => branchesData || [], [branchesData]);
  
  // 3. Fetch employees for the currently active business
  const employeesCollectionRef = useMemo(() =>
    firestore && activeBusinessId ? collection(firestore, 'businesses', activeBusinessId, 'employees') : null,
    [firestore, activeBusinessId]
  );
  const { data: employeesData, loading: employeesLoading } = useCollection<Employee>(employeesCollectionRef);
  const employees = useMemo(() => employeesData || [], [employeesData]);

  // --- Derived State ---
  
  const business = useMemo(() => (businesses || []).find(b => b.id === activeBusinessId) || null, [businesses, activeBusinessId]);
  const activeBranch = useMemo(() => branches?.find(b => b.id === activeBranchId) || null, [branches, activeBranchId]);
  
  const userRole = useMemo(() => {
    if (!user || !business || !business.roles) return null;
    return business.roles[user.uid] || null;
  }, [user, business]);

  const isLoading = userLoading || isBusinessLogicLoading || businessesLoading;

  // --- Business Logic Effects ---
  
  // Effect to determine if the user is new and handle initial routing
  useEffect(() => {
    if (userLoading || businessesLoading) return;

    if (user) {
      if (!isSuperAdmin && (!businesses || businesses.length === 0)) {
        setIsNewUser(true);
      } else {
        setIsNewUser(false);
      }
    } else {
      setIsNewUser(false);
    }
    setIsBusinessLogicLoading(false);
  }, [user, businesses, userLoading, businessesLoading, isSuperAdmin]);

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
  
  // Usage reset logic
  useEffect(() => {
      if (!firestore || !business || !business.usage || !business.usage.lastReset) return;

      const lastResetDate = typeof business.usage.lastReset === 'string'
          ? new Date(business.usage.lastReset)
          : (business.usage.lastReset as any).toDate();

      const oneMonthAgo = subMonths(new Date(), 1);

      if (isBefore(lastResetDate, oneMonthAgo)) {
          console.log("Usage metrics are over a month old. Resetting...");
          const businessDocRef = doc(firestore, 'businesses', business.id);
          const resetPayload = {
              'usage.items': 0,
              'usage.sales': 0,
              'usage.purchaseOrders': 0,
              'usage.aiScans': 0,
              'usage.branches': 1, // Always have at least 1 branch
              'usage.lastReset': serverTimestamp()
          };
          updateDoc(businessDocRef, resetPayload).catch(e => console.error("Failed to reset usage metrics:", e));
      }

  }, [firestore, business]);


  // Restore state from localStorage and auto-select branch for non-owners
  useEffect(() => {
    if (!businesses) return;

    const storedBusinessId = localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY);
    if (storedBusinessId && businesses.some(b => b.id === storedBusinessId)) {
      setActiveBusinessId(storedBusinessId);
    } else if (businesses.length > 0) {
      setActiveBusinessId(businesses[0].id);
    }
    
    // Once business and user roles are determined
    if (business && user && userRole) {
      if (userRole === 'Owner' || userRole === 'Admin') {
          const storedBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);
          if (storedBranchId && branches.some(b => b.id === storedBranchId)) {
              setActiveBranchId(storedBranchId);
          } else {
              setActiveBranchId(null);
          }
      } else { // For 'Staff'
          const employeeRecord = employees.find(e => e.id === user.uid);
          if (employeeRecord && employeeRecord.branchId) {
            // Auto-select their assigned branch
            setActiveBranchId(employeeRecord.branchId);
            localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, employeeRecord.branchId);
          }
      }
    }

  }, [businesses, business, user, userRole, employees, branches]);


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

  const incrementUsage = useCallback(async (field: 'items' | 'sales' | 'purchaseOrders' | 'aiScans' | 'branches', count: number = 1) => {
    if (!firestore || !business?.id) return;
    const businessDocRef = doc(firestore, 'businesses', business.id);
    const updatePayload = {
      [`usage.${field}`]: increment(count)
    };
    await updateDoc(businessDocRef, updatePayload).catch(e => console.error(`Failed to increment usage for ${field}`, e));
  }, [firestore, business?.id]);


  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string): Promise<Business | undefined> => {
    if (!firestore || !user?.uid) {
        console.error("Setup cannot proceed: Firestore not initialized or user not authenticated.");
        return;
    }

    const newBusinessRef = doc(collection(firestore, 'businesses'));
    const businessData = { 
        name: businessName,
        ownerId: user.uid,
        roles: {
          [user.uid]: 'Owner'
        },
        createdAt: serverTimestamp(),
        tier: 'free' as const,
        usage: {
          items: 0,
          sales: 0,
          purchaseOrders: 0,
          aiScans: 0,
          branches: 1,
          lastReset: serverTimestamp(),
        }
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

   const updateTier = useCallback(async (businessId: string, newTier: PlanId): Promise<void> => {
    if (!firestore) return;
    const businessDocRef = doc(firestore, 'businesses', businessId);
    const updatePayload = { 
      tier: newTier,
      'usage.lastReset': serverTimestamp()
    };
    
    await updateDoc(businessDocRef, updatePayload).catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: businessDocRef.path,
        operation: 'update',
        requestResourceData: updatePayload,
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
    if (!branchesCollectionRef || !business) return undefined;
    
    const limits = planLimits[business.tier];
    if (branches.length >= limits.branches) {
      toast({
        variant: "destructive",
        title: "Branch Limit Reached",
        description: `You have reached the limit of ${limits.branches} branches for the ${limits.name} plan.`,
      });
      router.push('/subscription');
      return undefined;
    }

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

    await incrementUsage('branches');
    
    return { ...branchData, id: docRef.id } as Branch;
  }, [branchesCollectionRef, business, branches, toast, router, incrementUsage]);

  const deleteBranch = useCallback(async (branchId: string) => {
    if (!firestore || !business?.id) return;
    
    const branchDocRef = doc(firestore, 'businesses', business.id, 'branches', branchId);
    
    if (activeBranch?.id === branchId) {
        switchBranch(null);
    }
    
    try {
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
        await incrementUsage('branches', -1);

    } catch (e) {
        console.error("Failed to delete branch:", e);
        const permissionError = new FirestorePermissionError({
            path: branchDocRef.path,
            operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  }, [firestore, business?.id, activeBranch?.id, switchBranch, incrementUsage]);

  const addEmployee = useCallback(async (employeeData: Omit<Employee, "id" | "createdAt">): Promise<Employee | undefined> => {
    // This function will need a major refactor to work with the new `roles` map.
    // We'd need to find the user's UID by their email, which requires a backend function.
    // For now, this will add to the `employees` collection and the `roles` map.
    if (!firestore || !business?.id || !employeesCollectionRef) return;
    
    // This is a placeholder for getting UID from email. In a real app, use a Cloud Function.
    const newEmployeeUid = `uid-for-${employeeData.email.replace(/[@.]/g, '-')}`;

    const businessDocRef = doc(firestore, 'businesses', business.id);
    const newEmployeeRef = doc(employeesCollectionRef, newEmployeeUid);

    const batch = writeBatch(firestore);
    
    // 1. Update the roles map on the business document
    batch.update(businessDocRef, {
      [`roles.${newEmployeeUid}`]: employeeData.role
    });
    
    // 2. Create the employee document
    const newEmployeeData = { ...employeeData, createdAt: serverTimestamp() };
    batch.set(newEmployeeRef, newEmployeeData);
    
    await batch.commit().catch(serverError => {
       const permissionError = new FirestorePermissionError({
          path: businessDocRef.path, // Or newEmployeeRef.path
          operation: 'update', // This is a batch, so it's tricky
          requestResourceData: { role: employeeData.role, ...newEmployeeData },
        });
        errorEmitter.emit('permission-error', permissionError);
    });

    return { id: newEmployeeRef.id, ...newEmployeeData } as Employee;

  }, [firestore, business?.id, employeesCollectionRef]);

  const updateEmployee = useCallback(async (employeeId: string, employeeData: Partial<Omit<Employee, "id" | "createdAt">>) => {
     if (!firestore || !business?.id || !employeesCollectionRef) return;

    const businessDocRef = doc(firestore, 'businesses', business.id);
    const employeeDocRef = doc(employeesCollectionRef, employeeId);

    const batch = writeBatch(firestore);

    // If role is being changed, update the roles map
    if (employeeData.role) {
      batch.update(businessDocRef, {
        [`roles.${employeeId}`]: employeeData.role
      });
    }

    // Update the employee document itself
    batch.update(employeeDocRef, employeeData);

    await batch.commit().catch(async (serverError) => {
       const permissionError = new FirestorePermissionError({
        path: employeeDocRef.path, // or businessDocRef
        operation: 'update',
        requestResourceData: employeeData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, business?.id, employeesCollectionRef]);
  
  const deleteEmployee = useCallback(async (employeeId: string) => {
    if (!firestore || !business?.id || !employeesCollectionRef) return;

    const businessDocRef = doc(firestore, 'businesses', business.id);
    const employeeDocRef = doc(employeesCollectionRef, employeeId);
    
    const batch = writeBatch(firestore);

    // 1. Remove the role from the business document
    batch.update(businessDocRef, {
      [`roles.${employeeId}`]: deleteDoc // Firestore field deletion
    });

    // 2. Delete the employee document
    batch.delete(employeeDocRef);

    await batch.commit().catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: employeeDocRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  }, [firestore, business?.id, employeesCollectionRef]);

  const contextValue = useMemo(() => ({
    business,
    businesses: businesses || [],
    branches,
    employees,
    activeBranch,
    isLoading,
    isNewUser,
    isSuperAdmin,
    userRole: userRole as 'Owner' | 'Admin' | 'Staff' | null,
    setupBusiness,
    addBranch,
    deleteBranch,
    updateBusiness,
    updateBranch,
    updateTier,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    incrementUsage,
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
    isSuperAdmin,
    userRole,
    setupBusiness, 
    addBranch, 
    deleteBranch, 
    updateBusiness, 
    updateBranch,
    updateTier,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    incrementUsage,
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
