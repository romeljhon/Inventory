
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/hooks/use-business";
import { SidebarLayout } from "@/components/sidebar-layout";
import { InventoryView } from "@/components/inventory/inventory-view";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { business, activeBranch, isLoading } = useBusiness();
  const router = useRouter();

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
        {activeBranch ? (
          <InventoryView branch={activeBranch} />
        ) : (
          <Card>
            <CardHeader className="flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Branch Selected</CardTitle>
              <CardDescription>
                Please select a branch from the dashboard to view its
                inventory.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
}
