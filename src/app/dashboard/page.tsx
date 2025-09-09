"use client";

import { useMemo, useEffect } from "react";
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
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Boxes, Shapes, AlertCircle, DollarSign } from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";

export default function DashboardPage() {
  const { business, activeBranch, isLoading: isBusinessLoading } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (!isBusinessLoading && !business) {
      router.push("/setup");
    }
  }, [business, isBusinessLoading, router]);
  
  const { items, categories, updateItemQuantity, isLoading: isInventoryLoading } = useInventory(activeBranch?.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
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

  const lowStockItemsList = useMemo(
    () => items?.filter((item) => item.quantity < LOW_STOCK_THRESHOLD) || [],
    [items]
  );
  
  const isLoading = isBusinessLoading || isInventoryLoading;

  if (isLoading || !business || !activeBranch) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard for {activeBranch.name}</h1>
            </div>
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

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Inventory Value by Category</CardTitle>
              <CardDescription>
                Total inventory value for each category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryValueData.length > 0 ? (
                 <ChartContainer config={chartConfig} className="w-full h-[250px]">
                    <BarChart
                      data={categoryValueData}
                      layout="vertical"
                      margin={{ left: 10, right: 30 }}
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
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  No data to display. Add items to your inventory to see them here.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                These items may need restocking soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={lowStockItemsList}
                categories={categories || []}
                onEditItem={() => {}} 
                onDeleteItem={() => {}}
                onUpdateQuantity={updateItemQuantity}
                isLoading={false}
                isCompact={true}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
