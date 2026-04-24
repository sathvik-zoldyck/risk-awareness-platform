'use server';

/**
 * @fileOverview AI flow for generating assessment questions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateAssessmentQuestionsInputSchema = z.object({
  category: z.enum(['basic', 'role_based', 'dpdp', 'scenario']),
  role: z.string(),
  numQuestions: z.number(),
});

export type GenerateAssessmentQuestionsInput = z.infer<typeof GenerateAssessmentQuestionsInputSchema>;

export async function generateAssessmentQuestions(input: GenerateAssessmentQuestionsInput) {
  const promptText = `
Generate ${input.numQuestions} multiple choice cybersecurity questions for role: ${input.role}, category: ${input.category}.
Return EXACTLY a JSON array of objects. Do NOT wrap the JSON in markdown code blocks. DO NOT add any extra text or intro.

Schema format per object:
{
  "questionText": "Question text here",
  "options": [
    { "id": "A", "text": "Option A text" },
    { "id": "B", "text": "Option B text" },
    { "id": "C", "text": "Option C text" },
    { "id": "D", "text": "Option D text" }
  ],
  "correctOptionId": "A",
  "explanation": "Explanation for the correct answer",
  "difficulty": "medium" // One of: easy, medium, hard
}
`;

  try {
    const { text } = await ai.generate({
      prompt: promptText,
      config: { temperature: 0.7 }
    });

    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');

    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : [];
    } catch (parseError) {
      console.error('Failed to parse AI question output:', parseError);
      return fallbacks(input);
    }
  } catch (error) {
    console.error('AI generate fail:', error);
    return fallbacks(input);
  }
}

function fallbacks(input: GenerateAssessmentQuestionsInput) {
  // Return dummy data in case of failure so the UI doesn't crash
  return [
    {
      questionText: `What is the primary goal of ${input.category.replace('_', ' ')} for a ${input.role}?`,
      options: [
        { id: 'A', text: 'To ensure data is publicly available.' },
        { id: 'B', text: 'To protect sensitive information and maintain compliance.' },
        { id: 'C', text: 'To increase network speed at the cost of security.' },
        { id: 'D', text: 'To disable all firewalls to prevent bottlenecks.' }
      ],
      correctOptionId: 'B',
      explanation: 'Maintaining compliance and protecting information is key to any security strategy.',
      difficulty: 'medium'
    }
  ];
}