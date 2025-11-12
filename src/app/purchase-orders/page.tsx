
"use client";

// This is a placeholder file for the purchase orders page.
// The full implementation will be done in subsequent steps.

import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function PurchaseOrdersPage() {
    return (
        <SidebarLayout>
             <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                 <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Purchase Orders
                    </h1>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Purchase Orders</CardTitle>
                        <CardDescription>
                        Create, track, and manage your purchase orders to suppliers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/80" />
                            <h3 className="text-xl font-semibold">Coming Soon</h3>
                            <p className="text-muted-foreground">
                            The full purchase order management system is under construction.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </SidebarLayout>
    )
}
