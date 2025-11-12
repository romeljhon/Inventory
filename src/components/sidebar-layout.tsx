
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Package, History, Shapes, ShoppingCart, Camera, LogOut, ArrowLeft, ChevronsUpDown, PlusCircle, Check, BookCopy, Edit, AreaChart, Users, Truck, ShoppingBag, BarChart } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { Icons } from "@/components/icons";
import { useState, useEffect } from "react";
import { AddBusinessDialog } from "./businesses/add-business-dialog";
import { EditBusinessDialog } from "./businesses/edit-business-dialog";
import { useToast } from "@/hooks/use-toast";


export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { business, businesses, activeBranch, switchBranch, switchBusiness, isUserLoading, setupBusiness, updateBusiness } = useBusiness();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [isEditBusinessOpen, setIsEditBusinessOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        router.push('/login');
    }
  };
  
  const user = auth?.currentUser;

  const handleBackToBranches = () => {
    switchBranch(null);
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
  
  const handleSaveBusiness = async (newName: string) => {
    if (business) {
      await updateBusiness(business.id, newName);
      toast({
        title: "Business Updated",
        description: `Your business has been renamed to ${newName}.`
      });
    }
  }

  const isOwner = business?.ownerId === user?.uid;

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between items-center px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                 <div className="flex items-center gap-3 overflow-hidden">
                    <Icons.logo className="w-7 h-7 text-primary shrink-0" />
                    <span className="text-lg font-semibold text-foreground truncate">{business?.name || "Select Business"}</span>
                 </div>
                 <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="start">
              <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
              <DropdownMenuGroup>
                {businesses.map((b) => (
                  <DropdownMenuItem key={b.id} onSelect={() => switchBusiness(b.id)}>
                    <Check className={`mr-2 h-4 w-4 ${business?.id === b.id ? 'opacity-100' : 'opacity-0'}`} />
                    <span>{b.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
               <DropdownMenuItem onSelect={() => setIsAddBusinessOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Create New Business</span>
              </DropdownMenuItem>
               <DropdownMenuItem onSelect={() => setIsEditBusinessOpen(true)} disabled={!business || !isOwner}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Business Name</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                    <Link href="/dashboard">
                    <LayoutDashboard />
                    Dashboard
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/inventory"}>
                    <Link href="/inventory">
                    <Package />
                    Inventory
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/sales"}>
                    <Link href="/sales">
                    <ShoppingCart />
                    Sales
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/reports")}>
                  <Link href="/reports">
                    <AreaChart />
                    Reports
                  </Link>
                </SidebarMenuButton>
                 <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === "/reports/sales"}>
                        <Link href="/reports/sales">Sales Report</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                   <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild isActive={pathname === "/reports/forecasting"}>
                        <Link href="/reports/forecasting">Forecasting</Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
            </SidebarMenuItem>
             <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/suppliers"}>
                        <Link href="/suppliers">
                        <Truck />
                        Suppliers
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/purchase-orders"}>
                        <Link href="/purchase-orders">
                        <ShoppingBag />
                        Purchase Orders
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/categories"}>
                    <Link href="/categories">
                    <Shapes />
                    Categories
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/recipes"}>
                    <Link href="/recipes">
                    <BookCopy />
                    Recipes
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/history"}>
                    <Link href="/history">
                    <History />
                    History
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/snapshots"}>
                    <Link href="/snapshots">
                    <Camera />
                    Snapshots
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/employees"}>
                <Link href="/employees">
                  <Users />
                  Employees
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" disabled={isUserLoading}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || undefined} />
                   <AvatarFallback>{isClient ? (user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase() : null}</AvatarFallback>
                </Avatar>
                <span className="truncate">{isClient ? (user?.displayName || "User") : ""}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
         <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
            <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2">
                    <Icons.logo className="w-6 h-6 text-primary" />
                </Link>
                <span className="font-semibold">{activeBranch ? activeBranch.name : business?.name}</span>
            </div>
            <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
       <AddBusinessDialog 
        isOpen={isAddBusinessOpen}
        onOpenChange={setIsAddBusinessOpen}
        onSave={handleSaveNewBusiness}
      />
       <EditBusinessDialog 
        isOpen={isEditBusinessOpen}
        onOpenChange={setIsEditBusinessOpen}
        onSave={handleSaveBusiness}
        currentName={business?.name || ''}
      />
    </SidebarProvider>
  );
}
