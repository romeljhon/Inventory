'use server';
/**
 * @fileOverview An AI flow for scanning and extracting data from receipts.
 *
 * - scanReceipt - Function to scan a receipt image and return structured data.
 * - ScanReceiptInput - Input type for the scanReceipt function.
 * - ScanReceiptOutput - Output type for the scanReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanReceiptInputSchema = z.object({
  receiptImage: z.string().describe("A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ScanReceiptInput = z.infer<typeof ScanReceiptInputSchema>;

const LineItemSchema = z.object({
    name: z.string().describe("The name of the product or item."),
    quantity: z.number().describe("The quantity of the item purchased."),
    price: z.number().describe("The price per unit of the item."),
});

const ScanReceiptOutputSchema = z.object({
  supplierName: z.string().describe("The name of the supplier or merchant."),
  transactionDate: z.string().describe("The date of the transaction in YYYY-MM-DD format."),
  lineItems: z.array(LineItemSchema).describe("An array of line items from the receipt."),
  total: z.number().optional().describe("The final total amount from the receipt."),
});
export type ScanReceiptOutput = z.infer<typeof ScanReceiptOutputSchema>;

export async function scanReceipt(input: ScanReceiptInput): Promise<ScanReceiptOutput> {
  return scanReceiptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanReceiptPrompt',
  input: {schema: ScanReceiptInputSchema},
  output: {schema: ScanReceiptOutputSchema},
  prompt: `You are an expert receipt scanner. Analyze the following receipt image, perform OCR, and extract the supplier name, transaction date, and all line items with their quantity and price.

If a quantity is not explicitly mentioned for an item, assume it is 1. If you cannot determine a field, omit it. Provide the date in YYYY-MM-DD format.

Receipt Image: {{media url=receiptImage}}`,
});

const scanReceiptFlow = ai.defineFlow(
  {
    name: 'scanReceiptFlow',
    inputSchema: ScanReceiptInputSchema,
    outputSchema: ScanReceiptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
