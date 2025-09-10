
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"
import type { Item, Category } from "@/lib/types";
import { suggestItemCategories } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity cannot be negative." }),
  value: z.coerce.number().min(0, { message: "Value cannot be negative." }),
  categoryId: z.string().optional(),
  unitType: z.enum(['pcs', 'box', 'pack']).optional(),
  expirationDate: z.date().optional(),
});

export type ItemFormData = z.infer<typeof formSchema>;

interface ItemFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Item, 'id' | 'createdAt'>) => void;
  item: Item | null;
  categories: Category[];
  onAddCategory: (name: string) => Category;
}

export function ItemFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  item,
  categories,
  onAddCategory,
}: ItemFormDialogProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      value: 0,
      categoryId: "",
      unitType: 'pcs',
    },
  });

  const { watch, setValue, control } = form;
  const itemName = watch("name");
  const itemDescription = watch("description");
  const categoryId = watch("categoryId");
  const selectedCategory = categories.find(c => c.id === categoryId);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset({
          ...item,
          quantity: item.quantity || 0,
          value: item.value || 0,
          categoryId: item.categoryId || "",
          unitType: item.unitType || 'pcs',
          expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
        });
      } else {
        form.reset({ name: "", description: "", quantity: 0, value: 0, categoryId: "", unitType: 'pcs', expirationDate: undefined });
      }
    }
  }, [item, isOpen, form]);

  const handleSuggestCategories = async () => {
    if (!itemName || !itemDescription) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter an item name and description first.",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const result = await suggestItemCategories({ itemName, itemDescription });
      if (result.categories && result.categories.length > 0) {
        const newCategoryName = result.categories[0];
        const existingCategory = categories.find(
          (c) => c.name.toLowerCase() === newCategoryName.toLowerCase()
        );
        if (existingCategory) {
          setValue("categoryId", existingCategory.id);
        } else {
          const newCategory = onAddCategory(newCategoryName);
          setValue("categoryId", newCategory.id);
        }
        toast({
          title: "Category Suggested!",
          description: `We've suggested and selected "${newCategoryName}".`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "No Suggestions Found",
          description: "The AI couldn't find a suitable category.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "There was a problem getting suggestions.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };
  
  const handleAddNewCategory = () => {
    const categoryName = prompt("Enter the new category name:");
    if (categoryName && categoryName.trim() !== "") {
        const newCategory = onAddCategory(categoryName);
        setValue("categoryId", newCategory.id);
    }
  };

  const onSubmit = (data: ItemFormData) => {
    const finalData = {
        ...data,
        expirationDate: data.expirationDate ? data.expirationDate.toISOString() : undefined,
    }
    onSave(finalData as Omit<Item, 'id' | 'createdAt'>);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add New Item"}</DialogTitle>
          <DialogDescription>
            Fill in the details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Ergonomic Keyboard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief description of the item" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
                    name="quantity"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                        <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="unitType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Unit Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                                <SelectItem value="box">Boxes</SelectItem>
                                <SelectItem value="pack">Packs</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Value (PHP)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={handleAddNewCategory}>New</Button>
                    <Button type="button" variant="outline" size="icon" onClick={handleSuggestCategories} disabled={isSuggesting}>
                        {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        <span className="sr-only">Suggest Category</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCategory?.name.toLowerCase() === 'food' && (
                <FormField
                    control={control}
                    name="expirationDate"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Expiration Date</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value ? (
                                format(field.value, "PPP")
                                ) : (
                                <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
              />
            )}
            
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
