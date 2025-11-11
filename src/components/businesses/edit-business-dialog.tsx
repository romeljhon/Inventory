
"use client";

import { useEffect } from "react";
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

const formSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters." }),
});

type BusinessFormData = z.infer<typeof formSchema>;

interface EditBusinessDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (newName: string) => void;
  currentName: string;
}

export function EditBusinessDialog({ isOpen, onOpenChange, onSave, currentName }: EditBusinessDialogProps) {
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: currentName,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValue("businessName", currentName);
    }
  }, [isOpen, currentName, form]);

  const onSubmit = (data: BusinessFormData) => {
    onSave(data.businessName);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Business Name</DialogTitle>
          <DialogDescription>
            Enter a new name for your business.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. My Awesome Cafe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
