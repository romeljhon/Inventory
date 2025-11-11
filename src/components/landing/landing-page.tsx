
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  BarChart,
  Package,
  Smartphone,
  Users,
  Menu,
  X,
  Building,
  PlusCircle,
  BookCopy,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="fixed top-0 z-50 w-full p-4">
        <div className="container mx-auto flex h-14 items-center rounded-full bg-gray-900/80 px-6 text-white backdrop-blur-sm">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-white" />
            <span className="font-bold sm:inline-block">Inventory</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link
              href="#features"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Features
            </Link>
             <Link
              href="#how-it-works"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              How It Works
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white md:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="hidden bg-white text-black hover:bg-gray-200 md:inline-flex">
              <Link href="/signup">Sign Up</Link>
            </Button>
            <div className="md:hidden">
              <Sheet
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full bg-gray-900 text-white border-l-0">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                       <Link href="/" className="flex items-center space-x-2">
                          <Icons.logo className="h-6 w-6 text-white" />
                          <span className="font-bold">Inventory</span>
                        </Link>
                         <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-white/10 hover:text-white">
                            <X className="h-6 w-6" />
                         </Button>
                    </div>
                    <nav className="flex flex-col items-start gap-6 text-lg font-medium mt-8">
                      <Link
                        href="#features"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Features
                      </Link>
                      <Link
                        href="#how-it-works"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        How It Works
                      </Link>
                    </nav>
                     <div className="mt-auto flex flex-col gap-4">
                        <Button asChild variant="outline" size="lg" className="border-gray-700 bg-transparent text-white hover:bg-gray-800 hover:text-white">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                        </Button>
                        <Button asChild size="lg" className="bg-white text-black hover:bg-gray-200">
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                        </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
          >
            <div className="h-56 bg-gradient-to-br from-primary to-purple-400 blur-[106px] dark:from-blue-700"></div>
            <div className="h-32 bg-gradient-to-r from-cyan-400 to-sky-300 blur-[106px] dark:to-indigo-600"></div>
          </div>
          <div className="container relative z-10 mx-auto flex flex-col items-center justify-center px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Intelligent Inventory Management
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Take control of your stock with an intuitive, powerful, and smart
              inventory system. Inventory helps you track, manage, and analyze
              your inventory with ease.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Features to Run Your Business
              </h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to streamline your inventory process and make
                smarter decisions.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Inventory Tracking
                </h3>
                <p className="text-muted-foreground">
                  Keep a real-time record of all your items across multiple
                  branches.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Multi-Branch Support
                </h3>
                <p className="text-muted-foreground">
                  Manage inventory for all your locations from a single, unified
                  dashboard.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Insightful Analytics
                </h3>
                <p className="text-muted-foreground">
                  Get valuable insights into sales, stock levels, and inventory
                  value.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Sales Terminal (POS)
                </h3>
                <p className="text-muted-foreground">
                  Process sales directly from your inventory, with automatic stock
                  deductions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
              <p className="mt-4 text-muted-foreground">
                Get up and running in just a few simple steps.
              </p>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 top-12 hidden h-full w-[2px] -translate-x-1/2 bg-border md:block"></div>
              <div className="grid gap-12 md:grid-cols-1">
                {/* Step 1 */}
                <div className="relative flex flex-col items-center text-center md:flex-row md:text-left">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:mr-8">
                    <Building className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">1. Set Up Your Business</h3>
                    <p className="text-muted-foreground">
                      Create your business profile and add your first branch or location. You can manage multiple branches under one business.
                    </p>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center md:flex-row-reverse md:text-right">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:ml-8">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">2. Add Your Inventory</h3>
                    <p className="text-muted-foreground">
                      Start adding your items. Distinguish between 'Components' (raw materials) and 'Products' (finished goods you sell).
                    </p>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center md:flex-row md:text-left">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:mr-8">
                    <BookCopy className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">3. Define Recipes</h3>
                    <p className="text-muted-foreground">
                      For your 'Products', create recipes that specify which 'Components' and what quantities are needed to produce them.
                    </p>
                  </div>
                </div>
                {/* Step 4 */}
                <div className="relative flex flex-col items-center text-center md:flex-row-reverse md:text-right">
                   <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:ml-8">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">4. Make Sales & Track Stock</h3>
                    <p className="text-muted-foreground">
                      Use the sales terminal to sell your products. The system automatically deducts the required components from your inventory based on the recipe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Streamline Your Inventory?
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Sign up today and get control over your stock in minutes. No credit
              card required.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/signup">Start Managing Your Stock</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icons.logo className="h-5 w-5" />
            <span>© {new Date().getFullYear()} Inventory. All rights reserved.</span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
