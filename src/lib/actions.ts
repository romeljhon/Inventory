"use server";

import { suggestItemCategories as suggestItemCategoriesFlow } from "@/ai/flows/suggest-item-categories";
import type { SuggestItemCategoriesInput, SuggestItemCategoriesOutput } from "@/ai/flows/suggest-item-categories";
import { forecastDemand as forecastDemandFlow } from "@/ai/flows/forecast-demand";
import type { ForecastDemandInput, ForecastDemandOutput } from "@/ai/flows/forecast-demand";

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
