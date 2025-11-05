
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, ChevronsUpDown, Home, LayoutDashboard, PlusCircle, Package, History, Shapes, ShoppingCart, Camera } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { Icons } from "@/components/icons";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { business, branches, activeBranch, switchBranch, addBranch } = useBusiness();
  const pathname = usePathname();

  const handleAddBranch = async () => {
    const branchName = prompt("Enter the name for the new branch:");
    if (branchName) {
      const newBranch = await addBranch(branchName);
      if (newBranch) {
        switchBranch(newBranch.id);
      }
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Icons.logo className="w-7 h-7 text-primary" />
            <span className="text-lg font-semibold">{business?.name}</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                <span className="truncate">{activeBranch?.name}</span>
                            </div>
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        <DropdownMenuLabel>Branches</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {branches.map(branch => (
                            <DropdownMenuItem key={branch.id} onClick={() => switchBranch(branch.id)}>
                                {branch.name}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleAddBranch}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Branch
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <Package />
                  Inventory
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/categories"}>
                <Link href="/categories">
                  <Shapes />
                  Categories
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
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  Dashboard
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
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/100" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="truncate">User Name</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b px-4 md:hidden">
            <div className="flex items-center gap-2">
                <Icons.logo className="w-6 h-6 text-primary" />
                <span className="font-semibold">{business?.name}</span>
            </div>
            <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
