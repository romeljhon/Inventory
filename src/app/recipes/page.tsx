
"use client";

import { useState } from "react";
import Link from "next/link";
import { useBusiness } from "@/hooks/use-business";
import { useInventory } from "@/hooks/use-inventory";
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
import { PlusCircle, Edit, Trash2, Building, BookCopy } from "lucide-react";
import { RecipeFormDialog } from "@/components/recipes/recipe-form-dialog";
import type { Recipe } from "@/lib/types";

export default function RecipesPage() {
  const { activeBranch } = useBusiness();
  const { items, recipes, addRecipe, updateRecipe, deleteRecipe, isLoading } = useInventory(activeBranch?.id);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const products = items?.filter(item => item.itemType === 'Product') || [];
  const components = items?.filter(item => item.itemType === 'Component') || [];

  const handleOpenForm = (recipe: Recipe | null = null) => {
    setEditingRecipe(recipe);
    setIsFormOpen(true);
  };
  
  const handleSaveRecipe = (data: Omit<Recipe, 'id' | 'createdAt'>) => {
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, data);
    } else {
      addRecipe(data);
    }
    setIsFormOpen(false);
    setEditingRecipe(null);
  };
  
  const handleDeleteRecipe = (id: string) => {
    if (confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipe(id);
    }
  };

  const getComponentNames = (recipe: Recipe) => {
     if (!recipe.components || !items) return "No components";
     return recipe.components
        .map(c => {
            const item = items.find(i => i.id === c.itemId);
            return item ? `${c.quantity} x ${item.name}` : '';
        })
        .filter(Boolean)
        .join(', ');
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
              <Button onClick={() => handleOpenForm()}>
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
                {isLoading ? (
                    <p>Loading recipes...</p>
                ) : recipes && recipes.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Components</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recipes.map(recipe => (
                           <TableRow key={recipe.id}>
                                <TableCell className="font-medium">{recipe.productName}</TableCell>
                                <TableCell className="text-muted-foreground">{getComponentNames(recipe)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenForm(recipe)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:text-destructive"
                                      onClick={() => handleDeleteRecipe(recipe.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                        <BookCopy className="h-12 w-12 text-muted-foreground/80" />
                        <h3 className="text-xl font-semibold">No Recipes Yet</h3>
                        <p className="text-muted-foreground">
                        Click "Add Recipe" to define the components for a product.
                        </p>
                        <Button onClick={() => handleOpenForm()} className="mt-2">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Recipe
                        </Button>
                    </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <RecipeFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveRecipe}
        recipe={editingRecipe}
        products={products}
        components={components}
      />

    </SidebarLayout>
  );
}
