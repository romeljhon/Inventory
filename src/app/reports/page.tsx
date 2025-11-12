
"use client";

import { SidebarLayout } from "@/components/sidebar-layout";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, BarChart } from "lucide-react";
import Link from "next/link";


export default function ReportsPage() {

  const reports = [
    {
      title: "Sales Report",
      description: "View sales performance, revenue, and top-selling products.",
      href: "/reports/sales",
      icon: AreaChart
    },
    {
      title: "Demand Forecasting",
      description: "Use AI to predict future product demand based on sales history.",
      href: "/reports/forecasting",
      icon: BarChart
    }
  ]
  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analyze your business performance and get AI-powered insights.</p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
                <Link href={report.href} key={report.title}>
                    <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1">
                        <CardHeader>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <report.icon className="h-6 w-6" />
                            </div>
                            <CardTitle>{report.title}</CardTitle>
                            <CardDescription>{report.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
