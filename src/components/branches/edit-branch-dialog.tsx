
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
  branchName: z.string().min(2, { message: "Branch name must be at least 2 characters." }),
});

type BranchFormData = z.infer<typeof formSchema>;

interface EditBranchDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (newName: string) => void;
  currentName: string;
}

export function EditBranchDialog({ isOpen, onOpenChange, onSave, currentName }: EditBranchDialogProps) {
  const form = useForm<BranchFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchName: currentName,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValue("branchName", currentName);
    }
  }, [isOpen, currentName, form]);

  const onSubmit = (data: BranchFormData) => {
    onSave(data.branchName);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Branch Name</DialogTitle>
          <DialogDescription>
            Enter a new name for this branch.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="branchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Uptown Branch" {...field} />
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
