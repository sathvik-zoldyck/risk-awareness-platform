'use server';

/**
 * @fileOverview AI flow for explaining assessment answers.
 *
 * - explainAssessmentAnswer - A function that handles the explanation process.
 * - ExplainAnswerInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainAnswerInputSchema = z.object({
  questionText: z.string(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string()
  })),
  correctOptionId: z.string(),
  selectedOptionId: z.string(),
});

export type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

export async function explainAssessmentAnswer(input: ExplainAnswerInput): Promise<string> {
  const { text } = await ai.generate({
    prompt: `You are a cybersecurity expert. A user answered a question in an assessment. Explain in 2-3 clear, educational sentences why the correct answer is right and why the user's choice matters for learning.

Question: ${input.questionText}
Options: ${JSON.stringify(input.options)}
Correct Option ID: ${input.correctOptionId}
User Selected Option ID: ${input.selectedOptionId}

Provide a concise, helpful explanation. No preamble.`,
    config: { temperature: 0.7 }
  });

  return text || "Unable to generate explanation.";
}