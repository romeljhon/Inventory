
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useBusiness } from '@/hooks/use-business';
import { useInventory } from '@/hooks/use-inventory';
import { SidebarLayout } from '@/components/sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, BarChart, Package, Lightbulb, Loader2 } from 'lucide-react';
import { forecastDemand } from '@/lib/actions';
import type { ForecastDemandOutput } from '@/ai/flows/forecast-demand';
import { planLimits } from '@/lib/plans';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function ForecastingPage() {
  const { business, activeBranch, incrementUsage } = useBusiness();
  const { items, history, isLoading } = useInventory(activeBranch?.id);
  const { toast } = useToast();
  const router = useRouter();


  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<ForecastDemandOutput | null>(null);

  const products = useMemo(() => items.filter((item) => item.itemType === 'Product'), [items]);
  const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

  const handleForecast = async () => {
    if (!selectedProductId || !selectedProduct || !business) return;

    const limits = planLimits[business.tier || 'free'];
    if (business.usage.aiScans >= limits.aiScans) {
      toast({
        variant: "destructive",
        title: "AI Feature Limit Reached",
        description: `You have reached the monthly limit of ${limits.aiScans} AI features for the ${limits.name} plan.`,
      });
      router.push('/subscription');
      return;
    }


    setIsForecasting(true);
    setForecastResult(null);

    const salesHistory = history
      .filter((log) => log.itemId === selectedProductId && log.type === 'sale')
      .map((log) => {
        const date = log.createdAt instanceof Date 
            ? log.createdAt 
            : (log.createdAt as any)?.toDate();

        return {
          date: date ? date.toISOString() : new Date().toISOString(),
          quantitySold: Math.abs(log.change),
        };
      });

    try {
      const result = await forecastDemand({
        productName: selectedProduct.name,
        salesHistory,
      });
      setForecastResult(result);
      await incrementUsage('aiScans');
    } catch (error) {
      console.error('Forecasting failed', error);
      setForecastResult({
          forecastedSales: 0,
          reasoning: "An unexpected error occurred while generating the forecast."
      })
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {!activeBranch ? (
          <Card>
            <CardHeader className="flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Building className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Branch Selected</CardTitle>
              <CardDescription>Please select a branch to view forecasts.</CardDescription>
              <Link href="/dashboard" className="mt-4">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardHeader>
          </Card>
        ) : (
          <>
            <header>
              <h1 className="text-3xl font-bold tracking-tight">Demand Forecasting</h1>
              <p className="text-muted-foreground">
                Use AI to predict future demand for your products based on historical sales data.
              </p>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Select a Product to Forecast</CardTitle>
                <CardDescription>Choose a product to analyze its sales trends and predict future demand.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="grid w-full sm:max-w-xs gap-1.5">
                    <span className="text-sm font-medium">Product</span>
                    <Select onValueChange={setSelectedProductId} value={selectedProductId || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                            <SelectItem value="loading" disabled>Loading products...</SelectItem>
                        ) : products.length > 0 ? (
                            products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
                        ) : (
                            <SelectItem value="no-products" disabled>No products available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleForecast} disabled={!selectedProductId || isForecasting}>
                  {isForecasting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
                  Generate Forecast
                </Button>
              </CardContent>
            </Card>

            {isForecasting && (
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">The AI is analyzing your sales data...</p>
                 </div>
              </div>
            )}
            
            {forecastResult && (
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Forecast for {selectedProduct?.name}
                    </CardTitle>
                    <CardDescription>Prediction for the next 30 days.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-8">
                        <span className="text-sm text-muted-foreground">Predicted Sales</span>
                        <p className="text-6xl font-bold tracking-tighter">{forecastResult.forecastedSales}</p>
                        <span className="text-sm text-muted-foreground">units</span>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-400"/> AI Analysis</h3>
                        <p className="text-sm text-muted-foreground">{forecastResult.reasoning}</p>
                    </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
