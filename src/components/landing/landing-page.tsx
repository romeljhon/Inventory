

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Mail,
  Phone,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { PLANS } from '@/lib/plans';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';


export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

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
              href="#about-us"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              About Us
            </Link>
            <Link
              href="#pricing"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Pricing
            </Link>
             <Link
              href="#blog"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Blog
            </Link>
             <Link
              href="#contact"
              className="transition-colors hover:text-white/80 text-white/60"
            >
              Contact Us
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
                        href="#about-us"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        About Us
                      </Link>
                       <Link
                        href="#pricing"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                       <Link
                        href="#blog"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Blog
                      </Link>
                       <Link
                        href="#contact"
                        className="transition-colors hover:text-white/80 text-white/80"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Contact Us
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
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">How It Works</h2>
              <p className="mt-4 text-muted-foreground">
                Get up and running in just a few simple steps.
              </p>
            </div>
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute left-8 top-8 h-full w-px bg-border -z-10"></div>
              <div className="space-y-12">
                
                {/* Step 1 */}
                <div className="relative pl-20">
                  <div className="absolute top-0 left-0 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Building className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">1. Set Up Your Business</h3>
                  <p className="text-muted-foreground">
                    Create your business profile, add your first branch, and list your suppliers to get started.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative pl-20">
                   <div className="absolute top-0 left-0 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <PlusCircle className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">2. Add Inventory Components</h3>
                  <p className="text-muted-foreground">
                    Stock your inventory with raw materials ('Components') you purchase, setting initial quantities, value, and reorder points.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative pl-20">
                  <div className="absolute top-0 left-0 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BookCopy className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">3. Define Products & Recipes</h3>
                  <p className="text-muted-foreground">
                    Create your finished goods ('Products') and define recipes that specify which components are needed to produce them.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative pl-20">
                  <div className="absolute top-0 left-0 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">4. Manage Purchasing & Sales</h3>
                  <p className="text-muted-foreground">
                    Create POs manually, get AI suggestions, or use the AI Receipt Scanner. Sell products with the smart POS, and stock levels update automatically.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="relative pl-20">
                   <div className="absolute top-0 left-0 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BarChart className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold">5. Analyze & Forecast</h3>
                  <p className="text-muted-foreground">
                    Use built-in reports to analyze sales and leverage AI-powered forecasting to predict future product demand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* About Us Section */}
        <section id="about-us" className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">About Us</h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  We're a passionate team of developers and business experts dedicated to helping small and medium-sized businesses thrive.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Our mission is to democratize powerful inventory management tools, making them accessible, affordable, and easy to use for everyone. We believe that by simplifying complex operations, we can empower entrepreneurs to focus on what they do best: growing their business.
                </p>
              </div>
              <div className="relative h-80 w-full rounded-lg overflow-hidden shadow-lg">
                <Image src="https://picsum.photos/seed/4/800/600" alt="Our team" layout="fill" objectFit="cover" data-ai-hint="team working" />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-muted-foreground">
                Choose the plan that's right for you. Start for free and scale as you grow.
              </p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Label htmlFor="pricing-toggle">Monthly</Label>
                <Switch id="pricing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
                <Label htmlFor="pricing-toggle">Yearly (Save 20%)</Label>
              </div>
            </div>
             <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {PLANS.map((plan) => {
                const monthlyPrice = plan.priceNumeric;
                const yearlyPrice = Math.floor(monthlyPrice * 12 * 0.8);
                
                return (
                    <Card
                    key={plan.tierId}
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
                        <div className="relative h-16">
                             <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300", isYearly ? 'opacity-0' : 'opacity-100')}>
                                <p className="text-4xl font-bold">{plan.price}</p>
                                <p className="text-sm text-muted-foreground">per month</p>
                             </div>
                             <div className={cn("absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300", isYearly ? 'opacity-100' : 'opacity-0')}>
                                {plan.priceNumeric > 0 ? (
                                    <>
                                        <p className="text-4xl font-bold">₱{yearlyPrice.toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground">per year</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-4xl font-bold">{plan.price}</p>
                                    </>
                                )}
                             </div>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature.text}</span>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" variant={plan.tierId === 'free' ? 'outline' : 'default'}>
                        <Link href="/signup">Get Started</Link>
                        </Button>
                    </CardFooter>
                    </Card>
                );
            })}
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">
                All About Inventory
              </h2>
              <p className="mt-4 text-muted-foreground">
                Tips, tricks, and insights to help you master your stock.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                 <div className="relative h-48 w-full">
                    <Image src="https://picsum.photos/seed/1/600/400" alt="Warehouse shelves" layout="fill" objectFit="cover" data-ai-hint="warehouse shelves" />
                 </div>
                 <CardHeader>
                   <CardTitle>5 Signs You Need an Inventory Management System</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-muted-foreground">Is your business struggling with stockouts, overstock, or manual counting? It might be time to upgrade...</p>
                 </CardContent>
                 <CardFooter>
                   <Button asChild variant="link" className="p-0">
                     <Link href="#blog">Read More &rarr;</Link>
                   </Button>
                 </CardFooter>
              </Card>
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                 <div className="relative h-48 w-full">
                    <Image src="https://picsum.photos/seed/2/600/400" alt="Cafe counter" layout="fill" objectFit="cover" data-ai-hint="cafe counter" />
                 </div>
                 <CardHeader>
                   <CardTitle>The Power of Recipe Management for Cafés</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-muted-foreground">Learn how defining recipes for your products can automate stock tracking and prevent ingredient shortages.</p>
                 </CardContent>
                 <CardFooter>
                   <Button asChild variant="link" className="p-0">
                     <Link href="#blog">Read More &rarr;</Link>
                   </Button>
                 </CardFooter>
              </Card>
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                 <div className="relative h-48 w-full">
                    <Image src="https://picsum.photos/seed/3/600/400" alt="Chart on a screen" layout="fill" objectFit="cover" data-ai-hint="data chart" />
                 </div>
                 <CardHeader>
                   <CardTitle>An Introduction to Demand Forecasting</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-muted-foreground">What is demand forecasting, and how can even small businesses leverage this AI-powered tool to make smarter decisions?</p>
                 </CardContent>
                 <CardFooter>
                   <Button asChild variant="link" className="p-0">
                     <Link href="#blog">Read More &rarr;</Link>
                   </Button>
                 </CardFooter>
              </Card>
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

       {/* Contact Section */}
       <section id="contact" className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Contact Us
            </h2>
             <p className="mt-4 max-w-xl mx-auto text-muted-foreground">
              Have questions? We're here to help.
            </p>
             <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-8">
                <div className="flex items-center gap-3">
                    <Mail className="h-6 w-6 text-primary" />
                    <span className="text-lg">support@inventory.app</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Phone className="h-6 w-6 text-primary" />
                    <span className="text-lg">+1 (234) 567-890</span>
                </div>
            </div>
          </div>
        </section>

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
