
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
  isQuickAction: z.boolean().describe("Whether the prompt is a Quick Action type.").optional(),
});
export type SuggestPromptNameInput = z.infer<typeof SuggestPromptNameInputSchema>;

const SuggestPromptNameOutputSchema = z.object({
  promptName: z.string().describe('A short, catchy, clear, and familiar name for the prompt, in Japanese, mixing Kanji, Hiragana, and Katakana appropriately.'),
});
export type SuggestPromptNameOutput = z.infer<typeof SuggestPromptNameOutputSchema>;

export async function suggestPromptName(input: SuggestPromptNameInput): Promise<SuggestPromptNameOutput> {
  return suggestPromptNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPromptNamePrompt',
  input: {schema: SuggestPromptNameInputSchema},
  output: {schema: SuggestPromptNameOutputSchema},
  prompt: `あなたはプロのコピーライターです。以下のプロンプト内容を深く理解し、その目的が一言で伝わるような、インパクトがあり、かつ親しみやすい日本語のキャッチコピー風の短い名前を提案してください。

名前の条件：
{{#if isQuickAction}}
- 4文字以内とする。
- ボタンのラベルとして使用される、簡潔な言葉を選んでください。
{{else}}
- 4単語（またはそれに相当する短いフレーズ）以内とする。
{{/if}}
- 漢字、ひらがな、カタカナをバランス良く使用し、漢字の多用を避ける。
- 専門用語や抽象的な言葉ではなく、誰にでも分かりやすい身近な言葉を選ぶ。
- プロンプトの核心的な機能や利点が端的に表現されていること。

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
