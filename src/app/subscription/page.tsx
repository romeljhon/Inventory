
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
  const { business, businesses } = useBusiness();
  const currentTierId = business?.tier || 'free';
  const currentPlan = PLANS.find(p => p.tierId === currentTierId);
  const currentLimits = planLimits[currentTierId as PlanId] || planLimits.free;

  const usage = business?.usage || {
    items: 0,
    sales: 0,
    purchaseOrders: 0,
    aiScans: 0,
    branches: 0,
  };
  
  const getProgress = (used: number, limit: number) => {
    if (limit === Infinity || limit === 0) return 0;
    return (used / limit) * 100;
  };

  const USAGE_METRICS = [
      { label: 'Businesses Owned', value: businesses.filter(b => b.ownerId === business?.ownerId).length, limit: currentLimits.businesses },
      { label: 'Inventory Items', value: usage.items, limit: currentLimits.items },
      { label: 'Branches', value: usage.branches, limit: currentLimits.branches },
      { label: 'Sales This Month', value: usage.sales, limit: currentLimits.sales },
      { label: 'Purchase Orders This Month', value: usage.purchaseOrders, limit: currentLimits.purchaseOrders },
      { label: 'AI Features This Month', value: usage.aiScans, limit: currentLimits.aiScans },
  ]

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
                This is your current monthly usage for the active business. You can upgrade at any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {USAGE_METRICS.map(metric => (
                 <div key={metric.label} className="space-y-2">
                    <p className="text-sm font-medium flex justify-between">
                        <span>{metric.label}</span>
                        <span>{metric.value} / {metric.limit === Infinity ? 'Unlimited' : metric.limit}</span>
                    </p>
                    <Progress value={getProgress(metric.value, metric.limit)} />
                </div>
              ))}
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
