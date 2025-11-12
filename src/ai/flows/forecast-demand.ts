'use server';
/**
 * @fileOverview Provides a demand forecast for a product based on historical sales data.
 *
 * - forecastDemand - Function to generate the demand forecast.
 * - ForecastDemandInput - Input type for the forecastDemand function.
 * - ForecastDemandOutput - Output type for the forecastDemand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SaleRecordSchema = z.object({
  date: z.string().describe('The date of the sales records (ISO 8601 format).'),
  quantitySold: z.number().describe('The number of units sold on that date.'),
});

const ForecastDemandInputSchema = z.object({
  productName: z.string().describe('The name of the product to be forecasted.'),
  salesHistory: z.array(SaleRecordSchema).describe('An array of historical sales records for the product.'),
});
export type ForecastDemandInput = z.infer<typeof ForecastDemandInputSchema>;

const ForecastDemandOutputSchema = z.object({
  forecastedSales: z.number().describe('The predicted number of units to be sold in the next 30 days.'),
  reasoning: z.string().describe('A brief explanation of the factors that influenced the forecast, such as trends, seasonality, or data sparsity.'),
});
export type ForecastDemandOutput = z.infer<typeof ForecastDemandOutputSchema>;

export async function forecastDemand(input: ForecastDemandInput): Promise<ForecastDemandOutput> {
  return forecastDemandFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastDemandPrompt',
  input: {schema: ForecastDemandInputSchema},
  output: {schema: ForecastDemandOutputSchema},
  prompt: `You are a demand forecasting expert for a small business. Analyze the provided sales history for the product "{{productName}}" to predict sales for the next 30 days.

Consider trends, seasonality, and the volume of data. Provide a single number for the forecast and a brief, easy-to-understand reasoning for your prediction. If the data is too sparse, provide a conservative estimate and state that more data is needed for accuracy.

Historical Sales Data:
{{#each salesHistory}}
- {{date}}: {{quantitySold}} units sold
{{/each}}

Based on this data, provide the forecast.`,
});

const forecastDemandFlow = ai.defineFlow(
  {
    name: 'forecastDemandFlow',
    inputSchema: ForecastDemandInputSchema,
    outputSchema: ForecastDemandOutputSchema,
  },
  async input => {
    if (input.salesHistory.length === 0) {
      return {
        forecastedSales: 0,
        reasoning: "No sales history is available for this product, so no forecast can be made. Sell some items to generate data.",
      };
    }
    
    const {output} = await prompt(input);
    return output!;
  }
);
