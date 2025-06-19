'use server';

/**
 * @fileOverview An AI agent that suggests a short, catchy name for a prompt based on its content.
 *
 * - suggestPromptName - A function that suggests a name for a prompt.
 * - SuggestPromptNameInput - The input type for the suggestPromptName function.
 * - SuggestPromptNameOutput - The return type for the suggestPromptName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPromptNameInputSchema = z.object({
  promptContent: z.string().describe('The content of the prompt.'),
});
export type SuggestPromptNameInput = z.infer<typeof SuggestPromptNameInputSchema>;

const SuggestPromptNameOutputSchema = z.object({
  promptName: z.string().describe('A short, catchy name for the prompt, in Japanese.'),
});
export type SuggestPromptNameOutput = z.infer<typeof SuggestPromptNameOutputSchema>;

export async function suggestPromptName(input: SuggestPromptNameInput): Promise<SuggestPromptNameOutput> {
  return suggestPromptNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPromptNamePrompt',
  input: {schema: SuggestPromptNameInputSchema},
  output: {schema: SuggestPromptNameOutputSchema},
  prompt: `以下のプロンプト内容に基づき、短くキャッチーな日本語の名前を提案してください。名前は4単語（またはそれに相当する短いフレーズ）以内とします。

プロンプト内容:
{{{promptContent}}}`,
});

const suggestPromptNameFlow = ai.defineFlow(
  {
    name: 'suggestPromptNameFlow',
    inputSchema: SuggestPromptNameInputSchema,
    outputSchema: SuggestPromptNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
