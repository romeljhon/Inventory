
'use client';

import { SidebarLayout } from '@/components/sidebar-layout';
import { useBusiness } from '@/hooks/use-business';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AddBusinessDialog } from '@/components/businesses/add-business-dialog';
import { useToast } from '@/hooks/use-toast';

export default function BusinessesPage() {
  const { businesses, switchBusiness, isLoading, setupBusiness } = useBusiness();
  const router = useRouter();
  const { toast } = useToast();
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);

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
            <Button onClick={() => setIsAddBusinessOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                New Business
            </Button>
        </div>
        <p className="text-muted-foreground">Select a business to manage its inventory and sales.</p>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((business) => (
            <Card
              key={business.id}
              className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
              onClick={() => handleSelectBusiness(business.id)}
            >
              <CardHeader className="flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Icons.logo className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl">{business.name}</CardTitle>
                <CardDescription>Select this business</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
      <AddBusinessDialog 
        isOpen={isAddBusinessOpen}
        onOpenChange={setIsAddBusinessOpen}
        onSave={handleSaveNewBusiness}
      />
    </SidebarLayout>
  );
}
