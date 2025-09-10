
"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInventory, LOW_STOCK_THRESHOLD } from "@/hooks/use-inventory";
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Boxes, Shapes, AlertCircle, DollarSign, Building, PlusCircle, TrendingUp } from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";
import type { Branch } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays, startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";


type TimeRange = "day" | "week" | "month" | "year" | "all";

function BranchDashboard({ branch, onBack }: { branch: Branch, onBack: () => void }) {
  const { items, categories, history, isLoading: isInventoryLoading } = useInventory(branch?.id);
  const [timeRange, setTimeRange] = useState<TimeRange>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    if (timeRange === "all") return history;
    
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
        return history;
    }
    
    return history.filter(log => new Date(log.createdAt) >= startDate);
  }, [history, timeRange]);

  const stats = useMemo(() => {
    if (!items) return { totalItems: 0, totalQuantity: 0, totalValue: 0, lowStockItems: 0, uniqueCategories: 0 };
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.quantity * item.value, 0);
    const lowStockItems = items.filter(
      (item) => item.quantity < LOW_STOCK_THRESHOLD
    ).length;
    const uniqueCategories = new Set(items.map((item) => item.categoryId)).size;
    return { totalItems, totalQuantity, totalValue, lowStockItems, uniqueCategories };
  }, [items]);

  const categoryValueData = useMemo(() => {
    if (!items || !categories) return [];
    const categoryValues = items.reduce((acc, item) => {
      const categoryName =
        categories.find((c) => c.id === item.categoryId)?.name || "Uncategorized";
      const itemValue = item.quantity * item.value;
      acc[categoryName] = (acc[categoryName] || 0) + itemValue;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryValues).map(([name, value]) => ({
      name,
      value,
    })).sort((a,b) => b.value - a.value);
  }, [items, categories]);
  
  const fastestSellingItems = useMemo(() => {
    if (!filteredHistory) return [];

    const sales = filteredHistory.reduce((acc, log) => {
      if (log.type === 'quantity' && log.change < 0) {
        acc[log.itemId] = (acc[log.itemId] || 0) + Math.abs(log.change);
      }
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(sales)
      .map(([itemId, quantitySold]) => {
        const item = items.find(i => i.id === itemId);
        return {
          name: item?.name || 'Unknown Item',
          quantitySold,
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

  }, [filteredHistory, items]);

  const chartConfig = useMemo(() => {
    if (!categoryValueData) return {};
    return categoryValueData.reduce((acc, entry, index) => {
      acc[entry.name] = {
        label: entry.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`,
      };
      return acc;
    }, {} as any);
  }, [categoryValueData]);
  
    const fastestSellingChartConfig = {
    quantitySold: {
      label: "Quantity Sold",
      color: "hsl(var(--chart-1))",
    },
  };


  const lowStockItemsList = useMemo(
    () => items?.filter((item) => item.quantity < LOW_STOCK_THRESHOLD) || [],
    [items]
  );
  
  if (isInventoryLoading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard for {branch.name}</h1>
          </div>
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total value of all inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Unique items in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Sum of quantities of all items
            </p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Shapes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCategories}</div>
             <p className="text-xs text-muted-foreground">
              Number of active item categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items with quantity below {LOW_STOCK_THRESHOLD}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Inventory Value by Category</CardTitle>
            <CardDescription>
              Total inventory value for each category.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {categoryValueData.length > 0 ? (
               <ChartContainer config={chartConfig} className="w-full h-full">
                  <BarChart
                    data={categoryValueData}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                    accessibilityLayer
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      width={100}
                      tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(value as number)}
                          indicator="dot"
                        />
                      }
                    />
                    <Bar dataKey="value" radius={4}>
                       {categoryValueData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No data to display. Add items to see charts.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Fastest Selling Items
            </CardTitle>
            <CardDescription>Top 5 items by quantity sold for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {fastestSellingItems.length > 0 ? (
              <ChartContainer config={fastestSellingChartConfig} className="w-full h-full">
                <BarChart
                  data={fastestSellingItems}
                  layout="vertical"
                  margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                  accessibilityLayer
                >
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={100}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    
                  />
                  <XAxis dataKey="quantitySold" type="number" hide />
                   <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="quantitySold" fill="hsl(var(--chart-1))" radius={4}>
                     {fastestSellingItems.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No sales data available for this period.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>
            These items may need restocking soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryTable
            items={lowStockItemsList}
            originalItems={lowStockItemsList}
            categories={categories || []}
            pendingChanges={{}}
            onEditItem={() => {}} 
            onDeleteItem={() => {}}
            onUpdateQuantity={() => {}}
            isLoading={false}
            isCompact={true}
          />
        </CardContent>
      </Card>
    </>
  )
}

export default function DashboardPage() {
  const { business, branches, addBranch, switchBranch, isLoading: isBusinessLoading } = useBusiness();
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    if (!isBusinessLoading && !business) {
      router.push("/setup");
    }
  }, [business, isBusinessLoading, router]);

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  const handleBackToBranches = () => {
    setSelectedBranch(null);
  };

  const handleAddBranch = async () => {
    const branchName = prompt("Enter the name for the new branch:");
    if (branchName) {
      const newBranch = await addBranch(branchName);
      if (newBranch) {
          switchBranch(newBranch.id);
          setSelectedBranch(newBranch);
      }
    }
  };
  
  const isLoading = isBusinessLoading;

  if (isLoading || !business) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {selectedBranch ? (
          <BranchDashboard branch={selectedBranch} onBack={handleBackToBranches} />
        ) : (
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Select a Branch</h1>
            <p className="text-muted-foreground mb-6">Click on a branch to view its dashboard, or add a new one.</p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {branches.map(branch => (
                <Card 
                  key={branch.id} 
                  className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
                  onClick={() => handleSelectBranch(branch)}
                >
                  <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <Building className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <CardDescription>View Dashboard</CardDescription>
                  </CardHeader>
                </Card>
              ))}
               <Card 
                  className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 border-2 border-dashed bg-muted/20 hover:border-primary/50 hover:bg-muted/50"
                  onClick={handleAddBranch}
                >
                  <CardHeader className="flex flex-col items-center justify-center text-center p-6 h-full">
                     <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <PlusCircle className="h-8 w-8 text-primary" />
                     </div>
                    <CardTitle className="text-lg">Add New Branch</CardTitle>
                    <CardDescription>Create a new location</CardDescription>
                  </CardHeader>
                </Card>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}


    

    