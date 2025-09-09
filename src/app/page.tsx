
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/hooks/use-business";
import { SidebarLayout } from "@/components/sidebar-layout";
import { InventoryView } from "@/components/inventory/inventory-view";

export default function Home() {
  const { business, activeBranch, isLoading } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !business) {
      router.push("/setup");
    }
  }, [business, isLoading, router]);

  if (isLoading || !business || !activeBranch) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading your business...</p>
      </div>
    );
  }

  return (
    <SidebarLayout>
      <InventoryView />
    </SidebarLayout>
  );
}
