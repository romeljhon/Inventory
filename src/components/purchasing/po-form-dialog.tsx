
"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { Item, PurchaseOrder, Supplier } from "@/lib/types";
import { PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier."),
  orderDate: z.date({ required_error: "Order date is required." }),
  expectedDate: z.date().optional(),
  items: z.array(z.object({
    itemId: z.string().min(1, "Please select an item."),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
  })).min(1, "Please add at least one item."),
});

type POFormData = z.infer<typeof formSchema>;

interface PurchaseOrderFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  purchaseOrder: PurchaseOrder | null;
  suppliers: Supplier[];
  components: Item[];
  poCount: number;
}

function generatePONumber(count: number) {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const orderNum = (count + 1).toString().padStart(4, '0');
    return `PO-${year}${month}${day}-${orderNum}`;
}

export function PurchaseOrderFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  purchaseOrder,
  suppliers,
  components,
  poCount,
}: PurchaseOrderFormDialogProps) {
  
  const form = useForm<POFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: "",
      items: [{ itemId: "", quantity: 1, price: 0 }],
      orderDate: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const total = watchItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  useEffect(() => {
    if (isOpen) {
      if (purchaseOrder) {
        form.reset({
          supplierId: purchaseOrder.supplierId,
          items: purchaseOrder.items.map(i => ({...i})),
          orderDate: typeof purchaseOrder.orderDate === 'string' ? new Date(purchaseOrder.orderDate) : purchaseOrder.orderDate instanceof Date ? purchaseOrder.orderDate : new Date(),
          expectedDate: purchaseOrder.expectedDate ? new Date(purchaseOrder.expectedDate as string) : undefined,
        });
      } else {
        form.reset({
          supplierId: "",
          items: [{ itemId: "", quantity: 1, price: 0 }],
          orderDate: new Date(),
          expectedDate: undefined,
        });
      }
    }
  }, [purchaseOrder, isOpen, form]);

  const onSubmit = (data: POFormData) => {
    const supplierName = suppliers.find(s => s.id === data.supplierId)?.name || 'Unknown';
    const finalData = {
      poNumber: purchaseOrder?.poNumber || generatePONumber(poCount),
      supplierId: data.supplierId,
      supplierName,
      status: purchaseOrder?.status || 'Draft',
      items: data.items.map(item => {
        const component = components.find(c => c.id === item.itemId);
        return {
          ...item,
          itemName: component?.name || 'Unknown Item',
        }
      }),
      total: total,
      orderDate: data.orderDate.toISOString(),
      expectedDate: data.expectedDate?.toISOString(),
    };
    onSave(finalData as Omit<PurchaseOrder, 'id' | 'createdAt'>);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{purchaseOrder ? `Edit PO #${purchaseOrder.poNumber}` : "Create New Purchase Order"}</DialogTitle>
          <DialogDescription>
            Select a supplier and add the items you want to order.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-6 pl-1">
          <Form {...form}>
            <form id="po-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="supplierId"
                        render={({ field }) => (
                            <FormItem className="md:col-span-1">
                            <FormLabel>Supplier</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {suppliers.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="orderDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col md:col-span-1">
                                <FormLabel>Order Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="expectedDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col md:col-span-1">
                                <FormLabel>Expected Delivery</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
              
              <div>
                <FormLabel>Items</FormLabel>
                <div className="space-y-4 mt-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_auto] gap-2 items-start">
                       <FormField
                          control={form.control}
                          name={`items.${index}.itemId`}
                          render={({ field }) => (
                              <FormItem>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select item" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {components.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )}
                        />
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" placeholder="Qty" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="Price" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive mt-1"
                          onClick={() => remove(index)}
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ itemId: "", quantity: 1, price: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
              <div className="flex justify-end pt-4">
                  <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="po-form">Save Purchase Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    