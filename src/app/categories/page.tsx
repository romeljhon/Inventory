
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/categories/category-form";
import { PlusCircle, Edit, Trash2, Building } from "lucide-react";
import type { Category } from "@/lib/types";
import { DeleteCategoryAlert } from "@/components/categories/delete-category-alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function CategoriesPage() {
  const { activeBranch } = useBusiness();
  const { categories, addCategory, updateCategory, deleteCategory } =
    useInventory(activeBranch?.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);


  const handleOpenForm = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaveCategory = (data: Partial<Category>) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data.name || '', data.showInSales);
    }
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteCategory(deletingCategory.id);
    }
    setIsDeleteAlertOpen(false);
    setDeletingCategory(null);
  };
  
  const handleToggleShowInSales = (category: Category) => {
    updateCategory(category.id, { showInSales: !category.showInSales });
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
                Please select a branch from the dashboard to manage its
                categories.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Manage Categories for {activeBranch.name}</h1>
              <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category List</CardTitle>
                <CardDescription>
                  View and manage item categories. Use the toggle to control which categories appear on the sales page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category Name</TableHead>
                        <TableHead className="w-[150px]">Show in Sales</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="font-medium">{category.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                               <Switch
                                  id={`show-in-sales-${category.id}`}
                                  checked={category.showInSales}
                                  onCheckedChange={() => handleToggleShowInSales(category)}
                                  aria-label="Show in sales"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenForm(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteCategory(category)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            No categories found for this branch.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                </DialogHeader>
                <CategoryForm
                    category={editingCategory}
                    onSave={handleSaveCategory}
                    onCancel={() => setIsFormOpen(false)}
                />
                </DialogContent>
            </Dialog>

             <DeleteCategoryAlert
              isOpen={isDeleteAlertOpen}
              onOpenChange={setIsDeleteAlertOpen}
              onConfirm={handleConfirmDelete}
              categoryName={deletingCategory?.name || ''}
            />
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
