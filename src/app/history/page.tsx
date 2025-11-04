
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowDown, ArrowUp, Plus, Minus, Edit, Trash2, Download } from "lucide-react";
import type { InventoryHistory } from "@/lib/types";
import { downloadCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


export default function HistoryPage() {
  const { business, activeBranch, isLoading: isBusinessLoading } = useBusiness();
  const { toast } = useToast();
  const router = useRouter();
  const { history, isLoading: isInventoryLoading } = useInventory(activeBranch?.id);

  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      date: format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
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
            return `Added new item with an initial quantity of ${log.quantity}.`;
        case 'initial':
             return `Item added to inventory with an initial stock of ${log.quantity}.`;
        case 'delete':
            return `Deleted item from inventory.`;
        case 'update':
            return `Item details were updated. Quantity changed by ${log.change > 0 ? '+' : ''}${log.change}.`;
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

  if (isBusinessLoading || isInventoryLoading || !activeBranch) {
    return <div className="flex h-screen items-center justify-center">Loading history...</div>;
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Inventory History for {activeBranch.name}</h1>
            <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
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
                                <TableHead className="w-[20%]">Date</TableHead>
                                <TableHead className="w-[30%]">Item</TableHead>
                                <TableHead className="w-[40%]">Action</TableHead>
                                <TableHead className="text-right w-[10%]">New Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedHistory.length > 0 ? sortedHistory.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="font-medium">{format(new Date(log.createdAt), "PP")}</div>
                                        <div className="text-sm text-muted-foreground">{format(new Date(log.createdAt), "p")}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">{log.itemName}</TableCell>
                                    <TableCell>
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
      </div>
    </SidebarLayout>
  );
}
