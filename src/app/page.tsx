
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/hooks/use-business";
import { SidebarLayout } from "@/components/sidebar-layout";
import { InventoryView } from "@/components/inventory/inventory-view";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building } from "lucide-react";
import type { Branch } from "@/lib/types";

export default function Home() {
  const { business, branches, isLoading } = useBusiness();
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (!isLoading && !business) {
      router.push("/setup");
    }
  }, [business, isLoading, router]);
  
  if (isLoading || !business) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading your business...</p>
      </div>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {selectedBranch ? (
          <InventoryView branch={selectedBranch} onBack={() => setSelectedBranch(null)} />
        ) : (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Select a Branch</h1>
            <p className="text-muted-foreground mb-6">Click on a branch to view its inventory.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {branches.map(branch => (
                <Card 
                  key={branch.id} 
                  className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
                  onClick={() => setSelectedBranch(branch)}
                >
                  <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <CardDescription>View Inventory</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
