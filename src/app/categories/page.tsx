"use client";

import { useState } from "react";
import Link from "next/link";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useBusiness } from "@/hooks/use-business";
import { useInventory } from "@/hooks/use-inventory";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Building, Shapes } from "lucide-react";
import { CategoryForm } from "@/components/categories/category-form";
import { DeleteCategoryAlert } from "@/components/categories/delete-category-alert";
import type { Category } from "@/lib/types";

export default function CategoriesPage() {
  const { activeBranch } = useBusiness();
  const { categories, addCategory, updateCategory, deleteCategory, isLoading } =
    useInventory(activeBranch?.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const handleOpenForm = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleSaveCategory = (data: Partial<Omit<Category, "id">>) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data.name || "New Category", data.showInSales);
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
                Please select a branch to manage categories.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Manage Categories for {activeBranch.name}
              </h1>
              <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category List</CardTitle>
                <CardDescription>
                  Organize your items by creating and managing categories.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading categories...</p>
                ) : categories && categories.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Visible in Sales</TableHead>
                          <TableHead className="w-[100px] text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                               <div
                                className="h-4 w-4 rounded-full border"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </TableCell>
                             <TableCell className="hidden sm:table-cell">
                               {category.showInSales ? 'Yes' : 'No'}
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
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                    <Shapes className="h-12 w-12 text-muted-foreground/80" />
                    <h3 className="text-xl font-semibold">No Categories Yet</h3>
                    <p className="text-muted-foreground">
                      Click "Add Category" to create your first one.
                    </p>
                     <Button onClick={() => handleOpenForm()} className="mt-2">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
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
        categoryName={deletingCategory?.name || ""}
      />
    </SidebarLayout>
  );
}
