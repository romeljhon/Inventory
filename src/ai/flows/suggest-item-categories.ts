'use server';

/**
 * @fileOverview Provides category suggestions for inventory items based on their name and description.
 *
 * - suggestItemCategories - Function to generate category suggestions.
 * - SuggestItemCategoriesInput - Input type for the suggestItemCategories function.
 * - SuggestItemCategoriesOutput - Output type for the suggestItemCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestItemCategoriesInputSchema = z.object({
  itemName: z.string().describe('The name of the item.'),
  itemDescription: z.string().describe('A detailed description of the item.'),
});

export type SuggestItemCategoriesInput = z.infer<typeof SuggestItemCategoriesInputSchema>;

const SuggestItemCategoriesOutputSchema = z.object({
  categories: z
    .array(z.string())
    .describe('An array of suggested categories for the item.'),
});

export type SuggestItemCategoriesOutput = z.infer<typeof SuggestItemCategoriesOutputSchema>;

export async function suggestItemCategories(input: SuggestItemCategoriesInput): Promise<SuggestItemCategoriesOutput> {
  return suggestItemCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestItemCategoriesPrompt',
  input: {schema: SuggestItemCategoriesInputSchema},
  output: {schema: SuggestItemCategoriesOutputSchema},
  prompt: `Suggest relevant categories for the following item, based on its name and description. Return the categories as a JSON array of strings.

Item Name: {{{itemName}}}
Item Description: {{{itemDescription}}}

Categories:`,
});

const suggestItemCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestItemCategoriesFlow',
    inputSchema: SuggestItemCategoriesInputSchema,
    outputSchema: SuggestItemCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
