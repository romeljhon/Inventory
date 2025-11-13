
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBusiness } from '@/hooks/use-business';
import { SidebarLayout } from '@/components/sidebar-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Business, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

type BusinessWithDetails = Business & {
  ownerEmail: string;
  userCount: number;
};

const SUPER_ADMIN_EMAIL = 'romeljhonsalvaleon27@gmail.com';

export default function SuperAdminPage() {
  const { user, isSuperAdmin, isLoading: isBusinessLoading, updateTier } = useBusiness();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isBusinessLoading && !isSuperAdmin) {
      router.replace('/dashboard');
    }
  }, [isSuperAdmin, isBusinessLoading, router]);

  useEffect(() => {
    const fetchAllBusinesses = async () => {
      if (!firestore || !isSuperAdmin) return;
      setIsLoading(true);

      try {
        const businessesSnapshot = await getDocs(collection(firestore, 'businesses'));
        const businessesData = businessesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));

        const businessesWithDetails: BusinessWithDetails[] = await Promise.all(
          businessesData.map(async (business) => {
            let ownerEmail = 'N/A';
            const ownerId = business.ownerId;

            if (ownerId) {
                try {
                    const userDocRef = doc(firestore, 'users', ownerId);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        ownerEmail = (userDoc.data() as UserProfile).email || 'N/A';
                    }
                } catch (serverError) {
                    const permissionError = new FirestorePermissionError({
                        path: `/users/${ownerId}`,
                        operation: 'get',
                    });
                    errorEmitter.emit('permission-error', permissionError);
                }
            }

            return {
              ...business,
              ownerEmail,
              userCount: Object.keys(business.roles || {}).length,
            };
          })
        );

        setBusinesses(businessesWithDetails.sort((a,b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBusinesses();
  }, [firestore, isSuperAdmin]);

  const handleTierChange = async (businessId: string, newTier: 'free' | 'growth' | 'scale') => {
    await updateTier(businessId, newTier);
    toast({
      title: 'Tier Updated',
      description: `The business tier has been changed to ${newTier}.`,
    });
     setBusinesses(prev => prev.map(b => b.id === businessId ? {...b, tier: newTier} : b));
  };


  if (isLoading || isBusinessLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!isSuperAdmin) {
    return (
       <SidebarLayout>
         <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <Card>
              <CardHeader className="flex flex-col items-center justify-center text-center p-8">
                <div className="p-4 bg-destructive/10 rounded-full mb-4">
                  <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Access Denied</CardTitle>
                <CardDescription>
                  You do not have permission to view this page.
                </CardDescription>
                 <Button onClick={() => router.push('/dashboard')} className="mt-4">
                    Go to Dashboard
                </Button>
              </CardHeader>
            </Card>
         </div>
       </SidebarLayout>
    )
  }

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Businesses</CardTitle>
            <CardDescription>
              Manage all businesses registered in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell className="font-medium">{business.name}</TableCell>
                      <TableCell>{business.ownerEmail}</TableCell>
                      <TableCell>{business.userCount}</TableCell>
                      <TableCell>
                         <Select
                            value={business.tier}
                            onValueChange={(newTier) => handleTierChange(business.id, newTier as 'free' | 'growth' | 'scale')}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="growth">Growth</SelectItem>
                                <SelectItem value="scale">Scale</SelectItem>
                            </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
