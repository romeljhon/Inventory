
"use client";

import { useState, useMemo } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { useBusiness } from "@/hooks/use-business";
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
import { PlusCircle, Edit, Trash2, Users, Building, Truck } from "lucide-react";
import Link from "next/link";
import { useCollection } from "@/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { Supplier } from "@/lib/types";
import { SupplierFormDialog } from "@/components/purchasing/supplier-form-dialog";
import { DeleteSupplierAlert } from "@/components/purchasing/delete-supplier-alert";

export default function SuppliersPage() {
  const { business, isLoading: isBusinessLoading } = useBusiness();
  const firestore = useFirestore();

  const suppliersCollectionRef = useMemo(() => 
    firestore && business?.id ? collection(firestore, 'businesses', business.id, 'suppliers') : null,
    [firestore, business?.id]
  );

  const { data: suppliers, loading: suppliersLoading } = useCollection<Supplier>(suppliersCollectionRef);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const handleOpenForm = (supplier: Supplier | null = null) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleSaveSupplier = async (data: Omit<Supplier, "id" | "createdAt">) => {
    if (!suppliersCollectionRef) return;

    if (editingSupplier) {
      const supplierDocRef = doc(firestore, suppliersCollectionRef.path, editingSupplier.id);
      await updateDoc(supplierDocRef, data);
    } else {
      await addDoc(suppliersCollectionRef, { ...data, createdAt: serverTimestamp() });
    }
    setIsFormOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingSupplier && suppliersCollectionRef) {
      const supplierDocRef = doc(firestore, suppliersCollectionRef.path, deletingSupplier.id);
      await deleteDoc(supplierDocRef);
    }
    setIsDeleteAlertOpen(false);
    setDeletingSupplier(null);
  };
  
  const isLoading = isBusinessLoading || suppliersLoading;

  if (!business && !isLoading) {
     return (
       <SidebarLayout>
         <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <Card>
              <CardHeader className="flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Building className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">No Business Selected</CardTitle>
                <CardDescription>
                  Please select a business to manage its suppliers.
                </CardDescription>
                <Link href="/dashboard" className="mt-4">
                    <Button>Go to Dashboard</Button>
                </Link>
              </CardHeader>
            </Card>
         </div>
       </SidebarLayout>
     );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Suppliers
          </h1>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier List for {business?.name}</CardTitle>
            <CardDescription>
              Add, edit, or remove suppliers for your business.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading suppliers...</p>
            ) : suppliers && suppliers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>
                        <TableCell>{supplier.contactName}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenForm(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteSupplier(supplier)}
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
                <Truck className="h-12 w-12 text-muted-foreground/80" />
                <h3 className="text-xl font-semibold">No Suppliers Yet</h3>
                <p className="text-muted-foreground">
                  Click "Add Supplier" to add your first supplier.
                </p>
                <Button onClick={() => handleOpenForm()} className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Supplier
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SupplierFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
      />

      <DeleteSupplierAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
        supplierName={deletingSupplier?.name || ""}
      />
    </SidebarLayout>
  );
}
