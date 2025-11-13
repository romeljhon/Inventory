
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  BarChart,
  Package,
  Menu,
  Building,
  PlusCircle,
  BookCopy,
  ShoppingCart,
  Receipt,
  Truck,
  Lightbulb,
  Users,
  ScanLine,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';


const plans = [
  {
    name: 'Starter',
    price: 'Free',
    priceMonthly: '₱0',
    description: 'For solo owners & startups testing the waters.',
    features: [
      '1 User',
      '1 Branch',
      '100 Inventory Items',
      '100 Sales/month',
      'Limited AI Features (5 scans/forecasts)',
    ],
    tierId: 'free',
    cta: 'Get Started for Free',
  },
  {
    name: 'Growth',
    price: '₱1,499',
    priceMonthly: '₱1,499',
    description: 'For growing businesses managing a small team.',
    isPopular: true,
    features: [
      'Up to 5 Users',
      'Up to 3 Branches',
      '2,000 Inventory Items',
      '2,000 Sales/month',
      'Increased AI (75 scans/forecasts)',
      'Automated PO Suggestions',
    ],
    tierId: 'growth',
    cta: 'Choose Growth Plan',
  },
  {
    name: 'Scale',
    price: '₱3,999',
    priceMonthly: '₱3,999',
    description: 'For multi-branch operations and high-volume sales.',
    features: [
      'Unlimited Users',
      'Unlimited Branches',
      'Unlimited Items',
      'Unlimited Sales & POs',
      'Highest AI Limits (200 scans/forecasts)',
      'Priority Support & API Access',
    ],
    tierId: 'scale',
    cta: 'Choose Scale Plan',
  },
];


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
            <Link
              href="#pricing"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Pricing
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
                       <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                          <Icons.logo className="h-6 w-6 text-white" />
                          <span className="font-bold">Inventory</span>
                        </Link>
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
                       <Link
                        href="#pricing"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Pricing
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
                  <ScanLine className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  AI Receipt Scanner
                </h3>
                <p className="text-muted-foreground">
                  Instantly create purchase orders by scanning supplier receipts with your camera.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  AI Demand Forecasting
                </h3>
                <p className="text-muted-foreground">
                  Analyze sales history and predict future product demand to optimize your stock levels.
                </p>
              </div>
               <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Automated PO Suggestions
                </h3>
                <p className="text-muted-foreground">
                  Get smart suggestions to create purchase orders when component stock drops below your reorder point.
                </p>
              </div>
               <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Purchase Orders
                </h3>
                <p className="text-muted-foreground">
                  Create, track, and manage purchase orders to suppliers and automatically update inventory upon receipt.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Component & Product Tracking
                </h3>
                <p className="text-muted-foreground">
                  Manage raw materials (components) and finished goods (products) in one place.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BookCopy className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Recipe Management
                </h3>
                <p className="text-muted-foreground">
                  Define recipes to automatically calculate product stock from available components.
                </p>
              </div>
               <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Sales Terminal (POS)
                </h3>
                <p className="text-muted-foreground">
                  Process sales with automatic component deduction based on your product recipes.
                </p>
              </div>
              <div className="rounded-lg border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Multi-Branch Support
                </h3>
                <p className="text-muted-foreground">
                  Manage inventory for all your locations from a single, unified dashboard.
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
                    <h3 className="mb-2 text-xl font-semibold">1. Set Up Your Business & Suppliers</h3>
                    <p className="text-muted-foreground">
                      Create your business profile, add your first branch, and list your suppliers to get started.
                    </p>
                  </div>
                </div>
                {/* Step 2 */}
                <div className="relative flex flex-col items-center text-center md:flex-row-reverse md:text-right">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:ml-8">
                    <PlusCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">2. Add Inventory Components</h3>
                    <p className="text-muted-foreground">
                      Stock your inventory with raw materials ('Components') you purchase, setting initial quantities, value, and reorder points.
                    </p>
                  </div>
                </div>
                {/* Step 3 */}
                <div className="relative flex flex-col items-center text-center md:flex-row md:text-left">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:mr-8">
                    <BookCopy className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">3. Define Products & Recipes</h3>
                    <p className="text-muted-foreground">
                      Create your finished goods ('Products') and define recipes that specify which components are needed to produce them.
                    </p>
                  </div>
                </div>
                {/* Step 4 */}
                <div className="relative flex flex-col items-center text-center md:flex-row-reverse md:text-right">
                   <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:ml-8">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">4. Manage Purchasing & Sales</h3>
                    <p className="text-muted-foreground">
                      Create purchase orders manually, get AI suggestions, or use the AI Receipt Scanner to instantly create POs from paper receipts. Sell products with the smart POS, and stock levels are updated automatically.
                    </p>
                  </div>
                </div>
                {/* Step 5 */}
                <div className="relative flex flex-col items-center text-center md:flex-row md:text-left">
                  <div className="relative z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground md:mb-0 md:mr-8">
                    <BarChart className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold">5. Analyze & Forecast</h3>
                    <p className="text-muted-foreground">
                      Use built-in reports to analyze sales performance and leverage AI-powered forecasting to predict future product demand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Choose the plan that's right for you. Start for free and scale as you grow.
              </p>
            </div>
             <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    'flex flex-col',
                    plan.isPopular && 'border-2 border-primary shadow-lg',
                  )}
                >
                  {plan.isPopular && (
                    <div className="py-1 px-4 bg-primary text-primary-foreground text-center text-sm font-semibold rounded-t-lg -mt-px">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">{plan.name}</CardTitle>
                     <p className="text-4xl font-bold">{plan.priceMonthly}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                     <Button asChild className="w-full" variant={plan.tierId === 'free' ? 'outline' : 'default'}>
                       <Link href="/signup">{plan.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
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

    