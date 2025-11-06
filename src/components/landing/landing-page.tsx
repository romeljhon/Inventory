
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { BarChart, Boxes, Package, ShoppingCart } from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Icons.logo className="mr-2 h-6 w-6 text-primary" />
            <span className="font-bold">Stock Sherpa</span>
          </div>
          <nav className="flex flex-1 items-center space-x-4">
            {/* Future nav links can go here */}
          </nav>
          <div className="flex items-center justify-end space-x-2">
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
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              Intelligent Inventory Management
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Take control of your stock with an AI-powered inventory system.
              Track items, manage sales, and get smart insights effortlessly.
            </p>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24 rounded-lg"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to manage your inventory and grow your business.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Package className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Inventory Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep a real-time pulse on all your items across multiple branches.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <ShoppingCart className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Point of Sale</h3>
                  <p className="text-sm text-muted-foreground">
                    A simple interface to record sales and automatically update your stock.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <BarChart className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Reporting & Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize your sales data and inventory value with insightful charts.
                  </p>
                </div>
              </div>
            </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <Boxes className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Multi-Branch Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage inventory for all your locations from a single dashboard.
                  </p>
                </div>
              </div>
            </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary"><path d="m12 3-1.9 1.9a2 2 0 0 0 0 2.8L12 9.6l1.9-1.9a2 2 0 0 0 0-2.8Z"/><path d="M9.6 12 7.7 13.9a2 2 0 0 0 0 2.8L9.6 18.6l1.9-1.9a2 2 0 0 0 0-2.8Z"/><path d="M12 21.6 10.1 19.7a2 2 0 0 0-2.8 0L5.4 21.6"/><path d="m3 12 1.9-1.9a2 2 0 0 0 2.8 0L9.6 12l-1.9 1.9a2 2 0 0 0-2.8 0Z"/><path d="M21.6 12 19.7 10.1a2 2 0 0 0-2.8 0L15.1 12l1.9 1.9a2 2 0 0 0 2.8 0Z"/><path d="M14.4 9.6 12.5 7.7a2 2 0 0 0-2.8 0L7.8 9.6l1.9 1.9a2 2 0 0 0 2.8 0Z"/><path d="m18.6 15-1.9-1.9a2 2 0 0 0-2.8 0l-1.9 1.9 1.9 1.9a2 2 0 0 0 2.8 0Z"/></svg>
                <div className="space-y-2">
                  <h3 className="font-bold">AI Category Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Let our AI automatically suggest categories for your new items.
                  </p>
                </div>
              </div>
            </div>
             <div className="relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-12 w-12 text-primary"><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m7.8 16.2-2.9 2.9"/><path d="M6 12H2"/><path d="m7.8 7.8-2.9-2.9"/><circle cx="12" cy="12" r="4"/></svg>
                <div className="space-y-2">
                  <h3 className="font-bold">Light & Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a theme that suits your style. Your preference is saved automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="open-source" className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Proudly Built with Firebase
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              This application is built using the latest Firebase and Next.js
              technologies, demonstrating a modern, scalable, and real-time web application architecture.
            </p>
          </div>
        </section>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <a
              href="https://firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Firebase
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}
