
"use client";

import { useState, useMemo } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Edit, Trash2, Building, ShoppingBag, MoreHorizontal, Truck, CheckCircle, Ban, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PurchaseOrder, Supplier } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { useCollection } from "@/firebase";
import { useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { PurchaseOrderFormDialog } from "@/components/purchasing/po-form-dialog";
import { DeletePurchaseOrderAlert } from "@/components/purchasing/po-delete-alert";
import { ReceivePurchaseOrderAlert } from "@/components/purchasing/po-receive-alert";

const statusConfig = {
  Draft: { color: "bg-gray-500", icon: FileText },
  Ordered: { color: "bg-blue-500", icon: Truck },
  "Partially Received": { color: "bg-yellow-500", icon: Truck },
  Received: { color: "bg-green-500", icon: CheckCircle },
  Cancelled: { color: "bg-red-500", icon: Ban },
};

export default function PurchaseOrdersPage() {
  const { business, activeBranch } = useBusiness();
  const firestore = useFirestore();
  const { 
    items, 
    addPurchaseOrder, 
    updatePurchaseOrder, 
    deletePurchaseOrder,
    receivePurchaseOrder,
    isLoading: isInventoryLoading 
  } = useInventory(activeBranch?.id);

  const components = useMemo(() => items.filter(i => i.itemType === 'Component'), [items]);
  
  const purchaseOrdersCollectionRef = useMemo(() => 
    firestore && business?.id && activeBranch?.id ? collection(firestore, 'businesses', business.id, 'branches', activeBranch.id, 'purchaseOrders') : null,
    [firestore, business?.id, activeBranch?.id]
  );
  const { data: purchaseOrders, loading: poLoading } = useCollection<PurchaseOrder>(purchaseOrdersCollectionRef);

  const suppliersCollectionRef = useMemo(() => 
    firestore && business?.id ? collection(firestore, 'businesses', business.id, 'suppliers') : null,
    [firestore, business?.id]
  );
  const { data: suppliers, loading: suppliersLoading } = useCollection<Supplier>(suppliersCollectionRef);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingPO, setDeletingPO] = useState<PurchaseOrder | null>(null);
  
  const [isReceiveAlertOpen, setIsReceiveAlertOpen] = useState(false);
  const [receivingPO, setReceivingPO] = useState<PurchaseOrder | null>(null);

  const isLoading = isInventoryLoading || poLoading || suppliersLoading;

  const handleOpenForm = (po: PurchaseOrder | null = null) => {
    setEditingPO(po);
    setIsFormOpen(true);
  };
  
  const handleOpenDeleteAlert = (po: PurchaseOrder) => {
    setDeletingPO(po);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingPO) {
      deletePurchaseOrder(deletingPO.id);
    }
    setIsDeleteAlertOpen(false);
    setDeletingPO(null);
  };
  
  const handleOpenReceiveAlert = (po: PurchaseOrder) => {
    setReceivingPO(po);
    setIsReceiveAlertOpen(true);
  };
  
  const handleConfirmReceive = () => {
    if(receivingPO) {
      receivePurchaseOrder(receivingPO.id, receivingPO.items);
    }
    setIsReceiveAlertOpen(false);
    setReceivingPO(null);
  };

  const handleUpdateStatus = (po: PurchaseOrder, status: PurchaseOrder['status']) => {
    updatePurchaseOrder(po.id, { status });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const sortedPOs = useMemo(() => {
    if (!purchaseOrders) return [];
    return [...purchaseOrders].sort((a, b) => {
      const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? parseISO(a.createdAt) : (a.createdAt as any).toDate()) : 0;
      const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? parseISO(b.createdAt) : (b.createdAt as any).toDate()) : 0;
      return dateB.valueOf() - dateA.valueOf();
    });
  }, [purchaseOrders]);


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
                Please select a branch to manage purchase orders.
              </CardDescription>
              <Link href="/dashboard" className="mt-4">
                  <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
              <Button onClick={() => handleOpenForm()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create PO
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order List</CardTitle>
                <CardDescription>Create, track, and manage your purchase orders to suppliers.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading purchase orders...</p>
                ) : purchaseOrders && purchaseOrders.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>PO Number</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[50px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPOs.map((po) => {
                          const config = statusConfig[po.status] || { color: "bg-gray-400", icon: FileText };
                          const date = po.orderDate ? (typeof po.orderDate === 'string' ? parseISO(po.orderDate) : (po.orderDate as any).toDate()) : null;
                          return (
                          <TableRow key={po.id}>
                            <TableCell className="font-medium">{po.poNumber}</TableCell>
                            <TableCell>{po.supplierName}</TableCell>
                            <TableCell>
                              <Badge style={{ backgroundColor: config.color }} className="text-white hover:text-black">
                                <config.icon className="mr-1 h-3 w-3" />
                                {po.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(po.total)}</TableCell>
                            <TableCell>{date ? format(date, "PP") : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenForm(po)} disabled={po.status !== 'Draft'}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenReceiveAlert(po)} disabled={po.status !== 'Ordered'}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark as Received
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(po, 'Ordered')} disabled={po.status !== 'Draft'}>
                                    <Truck className="mr-2 h-4 w-4" /> Mark as Ordered
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(po, 'Cancelled')} disabled={po.status === 'Received' || po.status === 'Cancelled'}>
                                    <Ban className="mr-2 h-4 w-4" /> Cancel Order
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleOpenDeleteAlert(po)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )})}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-muted-foreground/30 py-16 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground/80" />
                    <h3 className="text-xl font-semibold">No Purchase Orders Yet</h3>
                    <p className="text-muted-foreground">Click "Create PO" to start your first purchase order.</p>
                    <Button onClick={() => handleOpenForm()} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create PO
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

       <PurchaseOrderFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={editingPO ? (data) => updatePurchaseOrder(editingPO.id, data) : addPurchaseOrder}
        purchaseOrder={editingPO}
        suppliers={suppliers || []}
        components={components || []}
        poCount={purchaseOrders?.length || 0}
      />
      
       <DeletePurchaseOrderAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
        poNumber={deletingPO?.poNumber || ''}
      />
      
      <ReceivePurchaseOrderAlert
        isOpen={isReceiveAlertOpen}
        onOpenChange={setIsReceiveAlertOpen}
        onConfirm={handleConfirmReceive}
        poNumber={receivingPO?.poNumber || ''}
      />

    </SidebarLayout>
  );
}

    