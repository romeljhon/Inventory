
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useBusiness } from "@/hooks/use-business";
import { useInventory } from "@/hooks/use-inventory";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { format } from "date-fns";
import type { Item } from "@/lib/types";
import { Camera, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SnapshotsPage() {
  const { activeBranch } = useBusiness();
  const { categories, getInventorySnapshot, availableSnapshotDates, isLoading } =
    useInventory(activeBranch?.id);

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    availableSnapshotDates.length > 0 ? availableSnapshotDates[0] : undefined
  );
  
  const snapshotData: Item[] = useMemo(() => {
    if (!selectedDate) return [];
    return getInventorySnapshot(selectedDate);
  }, [selectedDate, getInventorySnapshot]);

  const handleDateChange = (dateString: string) => {
    setSelectedDate(dateString);
  };
  
  if (isLoading && !activeBranch) {
    return <div className="flex h-screen items-center justify-center">Loading snapshots...</div>;
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {!activeBranch ? (
           <Card>
            <CardHeader className="flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Branch Selected</CardTitle>
              <CardDescription>
                Please select a branch from the dashboard to view inventory snapshots.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header>
              <h1 className="text-3xl font-bold tracking-tight">
                Inventory Snapshots for {activeBranch.name}
              </h1>
              <p className="text-muted-foreground">
                View your inventory state from a previous date.
              </p>
            </header>

            <Card>
              <CardHeader>
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>View Historical Inventory</CardTitle>
                    <CardDescription>
                      Select a date to see a snapshot of your inventory at the end
                      of that day.
                    </CardDescription>
                  </div>
                  {availableSnapshotDates.length > 0 ? (
                    <Select
                      onValueChange={handleDateChange}
                      value={selectedDate}
                    >
                      <SelectTrigger className="w-full sm:w-[240px]">
                        <SelectValue placeholder="Select a date" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSnapshotDates.map((date) => (
                          <SelectItem key={date} value={date}>
                            {format(new Date(date), "PP")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                    <div className="text-center py-8">Loading snapshot...</div>
                ) : selectedDate && snapshotData.length > 0 ? (
                  <InventoryTable
                    items={snapshotData}
                    categories={categories}
                    pendingChanges={{}}
                    onEditItem={() => {}}
                    onDeleteItem={() => {}}
                    onUpdateQuantity={() => {}}
                    isLoading={isLoading}
                    isCompact={false}
                  />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                        <Camera className="h-12 w-12 text-muted-foreground/80" />
                        <h3 className="text-xl font-semibold">No Snapshots Available</h3>
                        <p className="text-muted-foreground">
                        There is no inventory history to display for this branch.
                        </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}

    