"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import type { Item, Category } from "@/lib/types";
import { suggestItemCategories } from "@/lib/actions";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  description: z.string().min(5, { message: "Description must be at least 5 characters." }),
  quantity: z.coerce.number().int().min(0, { message: "Quantity cannot be negative." }),
  value: z.coerce.number().min(0, { message: "Value cannot be negative." }),
  categoryId: z.string().min(1, { message: "Please select a category." }),
});

type ItemFormData = z.infer<typeof formSchema>;

interface ItemFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: ItemFormData) => void;
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
  const form = useForm<ItemFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      value: 0,
      categoryId: "",
    },
  });

  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      form.reset(item);
    } else {
      form.reset({ name: "", description: "", quantity: 0, value: 0, categoryId: "" });
    }
    setSuggestedCategories([]);
  }, [item, isOpen, form]);

  const handleSuggestCategories = async () => {
    const itemName = form.getValues("name");
    const itemDescription = form.getValues("description");
    if (!itemName && !itemDescription) {
      toast({
        variant: "destructive",
        title: "Cannot suggest categories",
        description: "Please enter an item name or description first.",
      });
      return;
    }
    setIsSuggesting(true);
    setSuggestedCategories([]);
    try {
      const result = await suggestItemCategories({ itemName, itemDescription });
      setSuggestedCategories(result.categories);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Could not fetch AI-powered category suggestions.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleUseSuggestion = (suggestion: string) => {
    const existingCategory = categories.find(c => c.name.toLowerCase() === suggestion.toLowerCase());
    if (existingCategory) {
      form.setValue("categoryId", existingCategory.id);
    } else {
      const addedCategory = onAddCategory(suggestion);
      form.setValue("categoryId", addedCategory.id);
    }
  };
  
  const onSubmit = (data: ItemFormData) => {
    onSave(data);
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
                control={form.control}
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
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Value (PHP)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-2">
                <FormLabel>Category</FormLabel>
                <div className="flex items-center gap-2">
                    <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
                 <Button type="button" variant="ghost" size="sm" className="w-full" onClick={handleSuggestCategories} disabled={isSuggesting}>
                    {isSuggesting ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching Suggestions... </>
                    ) : (
                        <> <Sparkles className="mr-2 h-4 w-4 text-primary" /> Smart Category Tool </>
                    )}
                </Button>
                {suggestedCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {suggestedCategories.map((s, i) => (
                            <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-primary/20" onClick={() => handleUseSuggestion(s)}>
                                {s}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
            
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
