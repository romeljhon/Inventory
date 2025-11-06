
"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Item, Recipe } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";

const formSchema = z.object({
  productId: z.string().min(1, "Please select a product."),
  components: z.array(z.object({
    itemId: z.string().min(1, "Please select a component."),
    quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0."),
  })).min(1, "Please add at least one component."),
});

type RecipeFormData = z.infer<typeof formSchema>;

interface RecipeFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Recipe, 'id' | 'createdAt'>) => void;
  recipe: Recipe | null;
  products: Item[];
  components: Item[];
}

export function RecipeFormDialog({
  isOpen,
  onOpenChange,
  onSave,
  recipe,
  products,
  components,
}: RecipeFormDialogProps) {
  
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      components: [{ itemId: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  useEffect(() => {
    if (isOpen) {
      if (recipe) {
        form.reset({
          productId: recipe.productId,
          components: recipe.components,
        });
      } else {
        form.reset({
          productId: "",
          components: [{ itemId: "", quantity: 1 }],
        });
      }
    }
  }, [recipe, isOpen, form]);

  const onSubmit = (data: RecipeFormData) => {
    const productName = products.find(p => p.id === data.productId)?.name || "Unknown Product";
    const finalData = { ...data, productName };
    onSave(finalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{recipe ? "Edit Recipe" : "Add New Recipe"}</DialogTitle>
          <DialogDescription>
            Define the components needed to create a product.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Finished Product</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product to create a recipe for" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <FormLabel>Components</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                     <FormField
                        control={form.control}
                        name={`components.${index}.itemId`}
                        render={({ field }) => (
                            <FormItem className="col-span-7">
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select component" />
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
                      name={`components.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input type="number" placeholder="Qty" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2 flex items-center pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
              </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => append({ itemId: "", quantity: 1 })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Component
                </Button>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Recipe</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
