"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  color: z.string().min(3, { message: "Please enter a valid color." }),
  showInSales: z.boolean().default(false),
});

type CategoryFormData = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category: Category | null;
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
}

export function CategoryForm({
  category,
  onSave,
  onCancel,
}: CategoryFormProps) {
  
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#000000",
      showInSales: false,
    },
  });
  
  const colorValue = form.watch("color");

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color,
        showInSales: category.showInSales || false,
      });
    } else {
      const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;
      form.reset({
        name: "",
        color: randomColor,
        showInSales: false,
      });
    }
  }, [category, form]);

  const handleSubmit = (data: CategoryFormData) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Beverages" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Color</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input placeholder="e.g., hsl(24, 9.8%, 10%)" {...field} />
                </FormControl>
                <div 
                  className="h-8 w-8 rounded-md border" 
                  style={{ backgroundColor: colorValue }} 
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter any valid CSS color (hex, rgb, hsl).
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showInSales"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Show in Sales</FormLabel>
                <p className="text-[0.8rem] text-muted-foreground">
                  Make this category visible on the sales page.
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
