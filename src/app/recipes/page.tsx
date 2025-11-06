
"use client";

import { useState } from "react";
import Link from "next/link";
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
import { PlusCircle, Edit, Trash2, Building, BookCopy } from "lucide-react";

export default function RecipesPage() {
  const { activeBranch } = useBusiness();
  const [isFormOpen, setIsFormOpen] = useState(false);

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
                Please select a branch from the dashboard to manage its
                recipes.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Manage Recipes for {activeBranch.name}</h1>
              <Button onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Recipe
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recipe List</CardTitle>
                <CardDescription>
                  Define the components for your products.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                    <BookCopy className="h-12 w-12 text-muted-foreground/80" />
                    <h3 className="text-xl font-semibold">No Recipes Yet</h3>
                    <p className="text-muted-foreground">
                    Click "Add Recipe" to define the components for a product.
                    </p>
                    <Button onClick={() => setIsFormOpen(true)} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Recipe
                    </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
