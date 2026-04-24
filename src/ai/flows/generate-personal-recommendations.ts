'use server';

/**
 * @fileOverview AI flow for generating personal cybersecurity recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePersonalRecommendationsInputSchema = z.object({
  scores: z.any(),
});

export type GeneratePersonalRecommendationsInput = z.infer<typeof GeneratePersonalRecommendationsInputSchema>;

async function generateWithRetry(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.generate({ prompt, config: { temperature: 0.7 } });
      return response.text || '';
    } catch (err: any) {
      const is503 = err?.code === 503 || err?.status === 'UNAVAILABLE' || err?.message?.includes('503');
      if (is503 && attempt < retries) {
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      throw err;
    }
  }
  return '';
}

export async function generatePersonalRecommendations(input: GeneratePersonalRecommendationsInput) {
  try {
    const scores = input.scores;
    const wrongList = Array.isArray(scores.wrongQuestions) && scores.wrongQuestions.length > 0
      ? `\nQuestions the employee got WRONG:\n${scores.wrongQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const prompt = `You are a cybersecurity training expert for Indian enterprises.

An employee completed a ${scores.moduleType ?? 'cybersecurity'} assessment and scored ${scores.score ?? 0}% (${scores.correctCount ?? 0} correct out of ${scores.totalQuestions ?? 0} questions).${wrongList}

Generate exactly 4 specific, actionable recommendations to help this employee improve. Focus on their weak areas. Each should be 1-2 sentences, practical, and relevant to Indian enterprise compliance.

Respond ONLY with this JSON (no markdown, no explanation):
{"recommendations":["rec1","rec2","rec3","rec4"]}`;

    const text = await generateWithRetry(prompt);

    // Extract JSON from response
    const match = text.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        return { recommendations: parsed.recommendations.slice(0, 4) };
      }
    }

    // Fallback: treat each non-empty line as a recommendation
    const lines = text.split('\n')
      .map(l => l.replace(/^[\d\-\.\*\s]+/, '').trim())
      .filter(l => l.length > 20)
      .slice(0, 4);

    return { recommendations: lines.length > 0 ? lines : [] };
  } catch (err) {
    console.error('[generatePersonalRecommendations] error:', err);
    return { recommendations: [] };
  }
}