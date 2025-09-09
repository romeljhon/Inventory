
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useInventory } from "@/hooks/use-inventory";
import { useBusiness } from "@/hooks/use-business";
import { SidebarLayout } from "@/components/sidebar-layout";
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
import { ArrowDown, ArrowUp, Plus, Minus, Edit, Trash2 } from "lucide-react";
import type { InventoryHistory } from "@/lib/types";

export default function HistoryPage() {
  const { business, activeBranch, isLoading: isBusinessLoading } = useBusiness();
  const router = useRouter();
  const { history, isLoading: isInventoryLoading } = useInventory(activeBranch?.id);

  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [history]);

  const getChangeIcon = (log: InventoryHistory) => {
    switch (log.type) {
      case 'add':
      case 'initial':
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
            return `Initial stock count of ${log.quantity}.`;
        case 'delete':
            return `Deleted item from inventory.`;
        case 'update':
            return `Item details updated. Quantity changed by ${log.change > 0 ? '+' : ''}${log.change}.`;
        case 'quantity':
            return `Quantity changed by ${log.change > 0 ? '+' : ''}${log.change}.`;
        default:
            return '';
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
