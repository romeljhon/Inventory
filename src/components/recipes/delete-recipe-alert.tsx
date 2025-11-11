
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteRecipeAlertProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  recipeName: string;
}

export function DeleteRecipeAlert({
  isOpen,
  onOpenChange,
  onConfirm,
  recipeName,
}: DeleteRecipeAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the recipe for
            <strong className="mx-1">{recipeName}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes, delete recipe
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
