
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBusiness } from "@/hooks/use-business";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Loader2 } from "lucide-react";

const setupSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters." }),
  branchName: z.string().min(2, { message: "Branch name must be at least 2 characters." }),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function SetupPage() {
  const { business, setupBusiness, isLoading, isUserLoading } = useBusiness();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      businessName: "",
      branchName: "",
    },
  });

  useEffect(() => {
    if (!isLoading && business) {
      router.push("/");
    }
  }, [business, isLoading, router]);

  const onSubmit = async (data: SetupFormData) => {
    setIsSubmitting(true);
    await setupBusiness(data.businessName, data.branchName);
    // The redirect will happen automatically via the useEffect above after business is loaded
  };
  
  const pageIsLoading = isLoading || isUserLoading;

  if (pageIsLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Loading...</span>
        </div>
      )
  }

  // If user is loaded and they already have a business, redirect.
  if (!isUserLoading && business) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span>Redirecting...</span>
        </div>
      )
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
                 <Icons.logo className="mx-auto h-12 w-12 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome to Stock Sherpa
                </h1>
                <p className="text-sm text-muted-foreground">
                    Let's get your business set up.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Business Details</CardTitle>
                    <CardDescription>
                        Tell us about your business and your first branch.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Acme Corporation" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Main Branch Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Headquarters" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting || pageIsLoading}>
                            {isSubmitting ? (
                                <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Saving...
                                </>
                            ) : "Complete Setup"}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
