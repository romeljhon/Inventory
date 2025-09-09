"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useInventory, LOW_STOCK_THRESHOLD } from "@/hooks/use-inventory";
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Boxes, Shapes, AlertCircle } from "lucide-react";
import { InventoryTable } from "@/components/inventory/inventory-table";

export default function DashboardPage() {
  const { items, categories, updateItem, deleteItem, updateItemQuantity, addCategory, isLoading } = useInventory();

  const stats = useMemo(() => {
    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = items.filter(
      (item) => item.quantity < LOW_STOCK_THRESHOLD
    ).length;
    const uniqueCategories = new Set(items.map((item) => item.categoryId)).size;
    return { totalItems, totalQuantity, lowStockItems, uniqueCategories };
  }, [items]);

  const chartData = useMemo(() => {
    const categoryCounts = items.reduce((acc, item) => {
      const categoryName =
        categories.find((c) => c.id === item.categoryId)?.name || "Uncategorized";
      acc[categoryName] = (acc[categoryName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value,
      fill: `hsl(var(--chart-${(Object.keys(categoryCounts).indexOf(name) % 5) + 1}))`,
    }));
  }, [items, categories]);
  
  const chartConfig = useMemo(() => {
    return chartData.reduce((acc, entry) => {
      acc[entry.name] = {
        label: entry.name,
        color: entry.fill,
      };
      return acc;
    }, {} as any);
  }, [chartData]);


  const lowStockItemsList = useMemo(
    () => items.filter((item) => item.quantity < LOW_STOCK_THRESHOLD),
    [items]
  );
  
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Total number of unique items in inventory
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

        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Item Distribution</CardTitle>
              <CardDescription>
                Number of items per category.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={({
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x =
                          cy + radius * Math.cos(-midAngle * RADIAN);
                        const y =
                          cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="hsl(var(--primary-foreground))"
                            textAnchor={x > cy ? "start" : "end"}
                            dominantBaseline="central"
                            className="text-xs font-bold"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                     <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-mt-4"
                      />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                  No data to display.
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                These items are running low and may need restocking soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryTable
                items={lowStockItemsList}
                categories={categories}
                onEditItem={() => {}} 
                onDeleteItem={() => {}}
                onUpdateQuantity={updateItemQuantity}
                isLoading={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
