'use server';
/**
 * @fileOverview This file defines a Genkit flow for summarizing the content of a PDF.
 *
 * - summarizePdfContent - A function that handles the PDF summarization process.
 * - SummarizePdfContentInput - The input type for the summarizePdfContent function.
 * - SummarizePdfContentOutput - The return type for the summarizePdfContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePdfContentInputSchema = z.object({
  pdfContent: z
    .string()
    .describe(
      'The content of the PDF extracted as text.'
    ),
});
export type SummarizePdfContentInput = z.infer<typeof SummarizePdfContentInputSchema>;

const SummarizePdfContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF content.'),
});
export type SummarizePdfContentOutput = z.infer<typeof SummarizePdfContentOutputSchema>;

export async function summarizePdfContent(input: SummarizePdfContentInput): Promise<SummarizePdfContentOutput> {
  return summarizePdfContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePdfContentPrompt',
  input: {schema: SummarizePdfContentInputSchema},
  output: {schema: SummarizePdfContentOutputSchema},
  prompt: `You are an expert summarizer, able to distill complex documents into their key insights.\n\nSummarize the following PDF content:\n\n{{pdfContent}}`,
});

const summarizePdfContentFlow = ai.defineFlow(
  {
    name: 'summarizePdfContentFlow',
    inputSchema: SummarizePdfContentInputSchema,
    outputSchema: SummarizePdfContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
