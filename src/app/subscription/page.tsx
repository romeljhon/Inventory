
'use client';

import Link from 'next/link';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useBusiness } from '@/hooks/use-business';
import { CheckCircle2, XCircle, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { PlanId, PLANS, planLimits } from '@/lib/plans';


export default function SubscriptionPage() {
  const { business } = useBusiness();
  const currentTierId = business?.tier || 'free';
  const currentPlan = PLANS.find(p => p.tierId === currentTierId);
  const currentLimits = planLimits[currentTierId as PlanId] || planLimits.free;

  const usage = business?.usage || {
    items: 0,
    sales: 0,
    purchaseOrders: 0,
    aiScans: 0,
  };
  
  const getProgress = (used: number, limit: number) => {
    if (limit === Infinity || limit === 0) return 0;
    return (used / limit) * 100;
  };

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-8 p-4 pt-6 md:p-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Find the Plan That's Right for You
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Start for free and scale as you grow. All plans include our core inventory management features.
          </p>
        </header>

         {currentPlan && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="text-yellow-500" />
                Your Current Plan: {currentPlan.name}
              </CardTitle>
              <CardDescription>
                This is your current monthly usage. You can upgrade at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Inventory Items: {usage.items} / {currentLimits.items === Infinity ? 'Unlimited' : currentLimits.items}</p>
                <Progress value={getProgress(usage.items, currentLimits.items)} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Sales This Month: {usage.sales} / {currentLimits.sales === Infinity ? 'Unlimited' : currentLimits.sales}</p>
                <Progress value={getProgress(usage.sales, currentLimits.sales)} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">AI Scans This Month: {usage.aiScans} / {currentLimits.aiScans === Infinity ? 'Unlimited' : currentLimits.aiScans}</p>
                <Progress value={getProgress(usage.aiScans, currentLimits.aiScans)} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'flex flex-col',
                plan.isPopular && 'border-primary shadow-lg',
                plan.tierId === currentTierId && 'ring-2 ring-primary'
              )}
            >
              {plan.isPopular && (
                <div className="py-1 px-4 bg-primary text-primary-foreground text-center text-sm font-semibold rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-3xl">{plan.name}</CardTitle>
                <p className="text-4xl font-bold">{plan.price}</p>
                <CardDescription className="min-h-[60px]">{plan.description}</CardDescription>
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
                 {plan.tierId === currentTierId ? (
                   <Button variant="outline" className="w-full" disabled>
                     Current Plan
                   </Button>
                 ) : (
                   <Button className="w-full" disabled={plan.priceNumeric < (currentPlan?.priceNumeric ?? 0)}>
                     {plan.priceNumeric > (currentPlan?.priceNumeric ?? 0) ? 'Upgrade' : 'Downgrade'}
                   </Button>
                 )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
