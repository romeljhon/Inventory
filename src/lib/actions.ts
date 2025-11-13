
"use server";

import { suggestItemCategories as suggestItemCategoriesFlow } from "@/ai/flows/suggest-item-categories";
import type { SuggestItemCategoriesInput, SuggestItemCategoriesOutput } from "@/ai/flows/suggest-item-categories";
import { forecastDemand as forecastDemandFlow } from "@/ai/flows/forecast-demand";
import type { ForecastDemandInput, ForecastDemandOutput } from "@/ai/flows/forecast-demand";
import { scanReceipt as scanReceiptFlow } from "@/ai/flows/scan-receipt";
import type { ScanReceiptInput, ScanReceiptOutput } from "@/ai/flows/scan-receipt";

export async function suggestItemCategories(
  input: SuggestItemCategoriesInput
): Promise<SuggestItemCategoriesOutput> {
  try {
    const result = await suggestItemCategoriesFlow(input);
    return result;
  } catch (error) {
    console.error("Error suggesting item categories:", error);
    // Return a structured error or an empty array
    return { categories: [] };
  }
}

export async function forecastDemand(
  input: ForecastDemandInput
): Promise<ForecastDemandOutput> {
  try {
    const result = await forecastDemandFlow(input);
    return result;
  } catch (error) {
    console.error("Error forecasting demand:", error);
    // Return a structured error or a default value
    return { 
        forecastedSales: 0,
        reasoning: "An unexpected error occurred while generating the forecast."
     };
  }
}

export async function scanReceipt(
  input: ScanReceiptInput
): Promise<ScanReceiptOutput> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await scanReceiptFlow(input);
      return result;
    } catch (error) {
      console.error(`Error scanning receipt (Attempt ${attempt}/${MAX_RETRIES}):`, error);
      const errorMessage = error instanceof Error ? error.message : '';
      
      // Only retry on specific, transient errors.
      const isRetryable = errorMessage.includes("503") || errorMessage.includes("overloaded");

      if (isRetryable && attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        continue; // Go to the next iteration of the loop
      }

      // If it's not a retryable error or we've run out of retries, throw the error.
      if (error instanceof Error) {
        throw new Error(`AI Scan Failed: ${error.message}`);
      }
      throw new Error("An unknown error occurred during the AI scan.");
    }
  }
  
  // This line should theoretically be unreachable, but it's good practice for type safety.
  throw new Error("AI scan failed after multiple retries.");
}
