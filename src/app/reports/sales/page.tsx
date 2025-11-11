
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, DollarSign, Download, Hash, Package } from "lucide-react";
import { startOfDay, startOfWeek, startOfMonth, startOfYear, format } from "date-fns";
import type { InventoryHistory, Item } from "@/lib/types";
import { downloadCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from "firebase/firestore";

type TimeRange = "day" | "week" | "month" | "year" | "all";
type SaleData = {
  id: string;
  itemId: string;
  itemName: string;
  quantitySold: number;
  totalRevenue: number;
  timestamp: Date;
};

export default function SalesReportPage() {
  const { activeBranch } = useBusiness();
  const { history, items, isLoading } = useInventory(activeBranch?.id);
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };
  
  const getDate = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    // Attempt to parse if it's a string, otherwise return as is if it's already a Date
    if (typeof timestamp === 'string') {
        const parsedDate = new Date(timestamp);
        if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
        }
    }
    // Fallback for objects that might be serialized Timestamps or already dates
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's already a Date object, just return it.
    if (timestamp instanceof Date) {
        return timestamp;
    }
    
    // Return a new invalid date if all else fails, so `format` can handle it.
    return new Date('invalid');
  };

  const salesData = useMemo(() => {
    if (!history || !items) return [];

    return history
      .filter(log => log.type === 'quantity' && log.change < 0)
      .map(log => {
        const item = items.find(i => i.id === log.itemId);
        const quantitySold = Math.abs(log.change);
        const totalRevenue = item ? item.value * quantitySold : 0;
        
        return {
          id: log.id,
          itemId: log.itemId,
          itemName: log.itemName,
          quantitySold: quantitySold,
          totalRevenue: totalRevenue,
          timestamp: getDate(log.createdAt),
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [history, items]);

  const filteredSales = useMemo(() => {
    if (timeRange === "all") return salesData;
    
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "day":
        startDate = startOfDay(now);
        break;
      case "week":
        startDate = startOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
      default:
        return salesData;
    }
    
    return salesData.filter(sale => sale.timestamp >= startDate);
  }, [salesData, timeRange]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalItemsSold = filteredSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    const totalTransactions = filteredSales.length;

    return { totalRevenue, totalItemsSold, totalTransactions };
  }, [filteredSales]);

  const topSellingProducts = useMemo(() => {
    const productSales = filteredSales.reduce((acc, sale) => {
      if (!acc[sale.itemId]) {
        acc[sale.itemId] = {
          name: sale.itemName,
          quantitySold: 0,
          totalRevenue: 0,
        };
      }
      acc[sale.itemId].quantitySold += sale.quantitySold;
      acc[sale.itemId].totalRevenue += sale.totalRevenue;
      return acc;
    }, {} as Record<string, { name: string; quantitySold: number; totalRevenue: number }>);

    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [filteredSales]);
  
  const handleExport = () => {
    if (filteredSales.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to export",
        description: "There is no sales data for the selected period.",
      });
      return;
    }

    const dataToExport = filteredSales.map(sale => ({
      "Date": format(sale.timestamp, "yyyy-MM-dd HH:mm:ss"),
      "Product Name": sale.itemName,
      "Quantity Sold": sale.quantitySold,
      "Total Revenue": sale.totalRevenue,
    }));

    const branchName = activeBranch?.name.replace(/ /g, "_") || "branch";
    const date = format(new Date(), "yyyy-MM-dd");
    downloadCSV(dataToExport, `sales_report_${branchName}_${timeRange}_${date}.csv`);
  };

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
                Please select a branch to view its sales report.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sales Report for {activeBranch.name}</h1>
                <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch gap-2">
                    <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)} className="w-full sm:w-auto">
                        <TabsList className="w-full sm:w-auto grid grid-cols-5">
                            <TabsTrigger value="day">Today</TabsTrigger>
                            <TabsTrigger value="week">Week</TabsTrigger>
                            <TabsTrigger value="month">Month</TabsTrigger>
                            <TabsTrigger value="year">Year</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button onClick={handleExport} disabled={filteredSales.length === 0} className="w-full sm:w-auto">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalItemsSold}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Top-Selling Products</CardTitle>
                        <CardDescription>Products with the highest revenue for the selected period.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Qty Sold</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
                                ) : topSellingProducts.length > 0 ? (
                                    topSellingProducts.map(p => (
                                        <TableRow key={p.name}>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell className="text-right">{p.quantitySold}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(p.totalRevenue)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center h-24">No sales data for this period.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>A log of the most recent sales transactions.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[400px] overflow-y-auto">
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                 {isLoading ? (
                                    <TableRow><TableCell colSpan={2} className="text-center">Loading...</TableCell></TableRow>
                                ) : filteredSales.length > 0 ? (
                                    filteredSales.slice(0, 20).map(sale => (
                                        <TableRow key={sale.id}>
                                            <TableCell>
                                                <div className="font-medium">{sale.itemName}</div>
                                                <div className="text-sm text-muted-foreground">{format(sale.timestamp, "PP p")}</div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <div className="font-medium">{formatCurrency(sale.totalRevenue)}</div>
                                                 <div className="text-sm text-muted-foreground">{sale.quantitySold} item(s)</div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow><TableCell colSpan={2} className="text-center h-24">No sales data for this period.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}

    

    