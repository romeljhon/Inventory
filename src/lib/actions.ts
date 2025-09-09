"use server";

import { suggestItemCategories as suggestItemCategoriesFlow } from "@/ai/flows/suggest-item-categories";
import type { SuggestItemCategoriesInput, SuggestItemCategoriesOutput } from "@/ai/flows/suggest-item-categories";

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
