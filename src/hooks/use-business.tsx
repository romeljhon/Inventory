
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import type { Business, Branch } from '@/lib/types';

interface BusinessContextType {
  business: Business | null;
  branches: Branch[];
  activeBranch: Branch | null;
  isLoading: boolean;
  setupBusiness: (businessName: string, initialBranchName: string) => Promise<void>;
  addBranch: (branchName: string) => Promise<Branch | undefined>;
  deleteBranch: (branchId: string) => void;
  switchBranch: (branchId: string | null) => void;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const BUSINESS_STORAGE_KEY = 'stock-sherpa-business-data';
const ACTIVE_BRANCH_STORAGE_KEY = 'stock-sherpa-active-branch';

export const BusinessProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedBusinessData = localStorage.getItem(BUSINESS_STORAGE_KEY);
      const storedActiveBranchId = localStorage.getItem(ACTIVE_BRANCH_STORAGE_KEY);

      if (storedBusinessData) {
        const parsedBusiness = JSON.parse(storedBusinessData) as Business;
        const parsedBranches = parsedBusiness.branches || [];
        
        setBusiness(parsedBusiness);
        setBranches(parsedBranches);

        if (storedActiveBranchId && storedActiveBranchId !== 'null') {
          const foundActiveBranch = parsedBranches.find((b: Branch) => b.id === storedActiveBranchId);
          setActiveBranch(foundActiveBranch || null);
        } else {
            setActiveBranch(null);
        }
      }
    } catch (error) {
      console.error("Failed to load business data from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupBusiness = useCallback(async (businessName: string, initialBranchName: string) => {
    const newBranch: Branch = { id: `branch-${Date.now()}`, name: initialBranchName };
    const newBusiness: Business = { 
      id: `biz-${Date.now()}`, 
      name: businessName,
      branches: [newBranch]
    };
    
    setBusiness(newBusiness);
    setBranches([newBranch]);
    setActiveBranch(newBranch);
    
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(newBusiness));
    localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, newBranch.id);
  }, []);

  const addBranch = useCallback(async (branchName: string): Promise<Branch | undefined> => {
    if (!business) return undefined;

    const newBranch: Branch = { id: `branch-${Date.now()}`, name: branchName };
    const updatedBranches = [...branches, newBranch];
    
    const updatedBusiness: Business = {
      ...business,
      branches: updatedBranches,
    };

    setBranches(updatedBranches);
    setBusiness(updatedBusiness);
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(updatedBusiness));
    
    return newBranch;
  }, [business, branches]);

  const deleteBranch = useCallback((branchId: string) => {
    if (!business) return;

    const updatedBranches = branches.filter(b => b.id !== branchId);
    const updatedBusiness: Business = {
        ...business,
        branches: updatedBranches,
    };

    setBranches(updatedBranches);
    setBusiness(updatedBusiness);
    localStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(updatedBusiness));

    // Also remove the inventory data for that branch
    localStorage.removeItem(`stock-sherpa-inventory-${branchId}`);

    if (activeBranch?.id === branchId) {
        setActiveBranch(null);
        localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, 'null');
    }
  }, [business, branches, activeBranch?.id]);

  const switchBranch = useCallback((branchId: string | null) => {
    if (branchId === null) {
      setActiveBranch(null);
      localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, 'null');
      return;
    }
    const branchToActivate = branches.find(b => b.id === branchId);
    if (branchToActivate) {
      setActiveBranch(branchToActivate);
      localStorage.setItem(ACTIVE_BRANCH_STORAGE_KEY, branchId);
    }
  }, [branches]);

  const contextValue = useMemo(() => ({
    business,
    branches,
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
