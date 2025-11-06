
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { BarChart, Boxes, Package, ShoppingCart, Sparkles, SunMoon } from "lucide-react";

const features = [
  {
    icon: <Package className="h-8 w-8 text-primary" />,
    title: "Inventory Tracking",
    description: "Keep a real-time pulse on all your items across multiple branches.",
  },
  {
    icon: <ShoppingCart className="h-8 w-8 text-primary" />,
    title: "Point of Sale",
    description: "A simple interface to record sales and automatically update your stock.",
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Reporting & Analytics",
    description: "Visualize your sales data and inventory value with insightful charts.",
  },
  {
    icon: <Boxes className="h-8 w-8 text-primary" />,
    title: "Multi-Branch Support",
    description: "Manage inventory for all your locations from a single dashboard.",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "AI Category Suggestions",
    description: "Let our AI automatically suggest categories for your new items.",
  },
  {
    icon: <SunMoon className="h-8 w-8 text-primary" />,
    title: "Light & Dark Mode",
    description: "Choose a theme that suits your style and works in any light.",
  },
];


export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex items-center">
            <Icons.logo className="mr-2 h-6 w-6 text-primary" />
            <span className="font-bold">Stock Sherpa</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 sm:py-32 md:py-40">
            <div className="absolute inset-0">
                <Image
                    src="https://picsum.photos/seed/1/1800/1200"
                    alt="Warehouse inventory background"
                    fill
                    className="object-cover"
                    data-ai-hint="warehouse inventory"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            <div className="container relative z-10 flex flex-col items-center justify-center gap-5 text-center px-4">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Intelligent Inventory Management
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground sm:text-xl">
                Take control of your stock with an AI-powered inventory system.
                Track items, manage sales, and get smart insights effortlessly.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/signup">Get Started for Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                    <Link href="/login">Login</Link>
                </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="container space-y-12 py-16 md:py-24 lg:py-32"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl md:text-5xl">
              Everything you need. Nothing you don't.
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              Our features are designed to be powerful yet simple, giving you full control without the clutter.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
                <div key={feature.title} className="flex flex-col items-center justify-start text-center p-6 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                        {feature.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                        {feature.description}
                    </p>
                </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="container py-16 md:py-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">
              Ready to Climb to the Peak of Efficiency?
            </h2>
            <p className="max-w-xl text-lg text-muted-foreground">
              Join hundreds of businesses streamlining their inventory.
              Sign up now and start your journey with Stock Sherpa.
            </p>
             <Button asChild size="lg" className="mt-4">
                <Link href="/signup">Start Your Free Trial</Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-center gap-4 py-8 text-center md:h-24 md:flex-row">
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a
              href="https://firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Firebase
            </a>
            . The source code is available on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
