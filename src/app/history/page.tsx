
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useInventory } from "@/hooks/use-inventory";
import { useBusiness } from "@/hooks/use-business";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Plus, Minus, Edit, Trash2, Download, Building, ShoppingCart } from "lucide-react";
import type { InventoryHistory } from "@/lib/types";
import { downloadCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";


export default function HistoryPage() {
  const { business, activeBranch, isLoading: isBusinessLoading } = useBusiness();
  const { toast } = useToast();
  const { history, isLoading: isInventoryLoading } = useInventory(activeBranch?.id);

  const getDate = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    return new Date(timestamp);
  };

  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => getDate(b.createdAt).getTime() - getDate(a.createdAt).getTime());
  }, [history]);

  const handleExport = () => {
    if (!sortedHistory.length) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "There is no history to export.",
      });
      return;
    }
    
    const dataToExport = sortedHistory.map(log => ({
      date: format(getDate(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
      item: log.itemName,
      action: getChangeDescription(log),
      change: log.change,
      new_quantity: log.newQuantity,
    }));

    const branchName = activeBranch?.name.replace(/ /g, "_") || "branch";
    const date = format(new Date(), "yyyy-MM-dd");
    downloadCSV(dataToExport, `${branchName}_history_${date}.csv`);

    toast({
      title: "Export Started",
      description: "Your history data is being downloaded.",
    });
  }

  const getChangeIcon = (log: InventoryHistory) => {
    switch (log.type) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'sale':
        return <ShoppingCart className="h-4 w-4 text-orange-500" />;
      case 'quantity':
        return log.change > 0 ? (
          <ArrowUp className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDown className="h-4 w-4 text-red-500" />
        );
      default:
        return null;
    }
  };

    const getChangeDescription = (log: InventoryHistory) => {
        switch (log.type) {
        case 'add':
            return `Added new item with an initial quantity of ${log.newQuantity}.`;
        case 'initial':
             return `Item added to inventory with an initial stock of ${log.change}.`;
        case 'delete':
            return `Deleted item from inventory.`;
        case 'update':
            return `Item details were updated. Quantity changed by ${log.change > 0 ? '+' : ''}${log.change}.`;
        case 'sale':
            return `Sale of ${Math.abs(log.change)} unit(s).`;
        case 'quantity':
            const absChange = Math.abs(log.change);
            if (log.change > 0) {
              return `Increased quantity by ${absChange}.`;
            } else {
              return `Decreased quantity by ${absChange}.`;
            }
        default:
            return 'Inventory updated.';
        }
    };

  const isLoading = isBusinessLoading || isInventoryLoading;

  if (isLoading && !activeBranch) {
    return <div className="flex h-screen items-center justify-center">Loading history...</div>;
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
                Please select a branch from the dashboard to view its history.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory History for {activeBranch.name}</h1>
                <Button onClick={handleExport} disabled={!sortedHistory || sortedHistory.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Export to CSV</span>
                    <span className="sm:hidden">Export</span>
                </Button>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Change Log</CardTitle>
                    <CardDescription>
                        A log of all changes made to the inventory in this branch.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="w-full overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Date</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="hidden sm:table-cell">Action</TableHead>
                                    <TableHead className="text-right">New Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Loading history...
                                        </TableCell>
                                    </TableRow>
                                ) : sortedHistory.length > 0 ? sortedHistory.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="font-medium">{format(getDate(log.createdAt), "PP")}</div>
                                            <div className="text-sm text-muted-foreground">{format(getDate(log.createdAt), "p")}</div>
                                        </TableCell>
                                        <TableCell className="font-medium">{log.itemName}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                {getChangeIcon(log)}
                                                <span>{getChangeDescription(log)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{log.newQuantity}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No history found for this branch.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
