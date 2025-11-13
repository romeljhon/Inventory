
'use client';

import { SidebarLayout } from '@/components/sidebar-layout';
import { useBusiness } from '@/hooks/use-business';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AddBusinessDialog } from '@/components/businesses/add-business-dialog';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteBusinessAlert } from '@/components/businesses/delete-business-alert';
import type { Business } from '@/lib/types';
import { useUser } from '@/firebase';

export default function BusinessesPage() {
  const { user } = useUser();
  const { businesses, switchBusiness, isLoading, setupBusiness, canCreateNewBusiness, deleteBusiness } = useBusiness();
  const router = useRouter();
  const { toast } = useToast();
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingBusiness, setDeletingBusiness] = useState<Business | null>(null);

  const handleSelectBusiness = (businessId: string) => {
    switchBusiness(businessId);
    router.push('/dashboard');
  };

  const handleSaveNewBusiness = async (businessName: string, branchName: string) => {
    const newBusiness = await setupBusiness(businessName, branchName);
    if (newBusiness) {
      switchBusiness(newBusiness.id);
      toast({
        title: "Business Created",
        description: `${businessName} has been successfully created.`,
      });
      router.push('/dashboard');
    }
  };

  const openDeleteDialog = (business: Business) => {
    setDeletingBusiness(business);
    setIsDeleteAlertOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (deletingBusiness) {
      deleteBusiness(deletingBusiness.id);
      setDeletingBusiness(null);
    }
    setIsDeleteAlertOpen(false);
  };


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">My Businesses</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block"> 
                    <Button onClick={() => setIsAddBusinessOpen(true)} disabled={!canCreateNewBusiness}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        New Business
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canCreateNewBusiness && (
                  <TooltipContent>
                    <p>You've reached the business limit for your plan. Please upgrade.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
        </div>
        <p className="text-muted-foreground">Select a business to manage its inventory and sales.</p>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((business) => (
            <Card
              key={business.id}
              className="flex flex-col justify-between transition-all hover:shadow-md"
            >
              <div
                className="flex-grow cursor-pointer p-6 flex flex-col items-center justify-center text-center"
                onClick={() => handleSelectBusiness(business.id)}
              >
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Icons.logo className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{business.name}</CardTitle>
                <CardDescription>Select this business</CardDescription>
              </div>
              {business.ownerId === user?.uid && (
                <CardFooter className="p-2 border-t flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(business);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      </div>
      <AddBusinessDialog 
        isOpen={isAddBusinessOpen}
        onOpenChange={setIsAddBusinessOpen}
        onSave={handleSaveNewBusiness}
      />
      <DeleteBusinessAlert
        isOpen={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleConfirmDelete}
        businessName={deletingBusiness?.name || ''}
      />
    </SidebarLayout>
  );
}
