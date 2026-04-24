'use server';

/**
 * @fileOverview DPDP compliance chatbot flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DpdpChatInputSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.string(),
    content: z.string()
  })).optional(),
});

export type DpdpChatInput = z.infer<typeof DpdpChatInputSchema>;

async function generateWithRetry(opts: any, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await (ai.generate as any)(opts);
      return response.text || "I'm sorry, I couldn't process that.";
    } catch (err: any) {
      const is503 = err?.code === 503 || err?.status === 'UNAVAILABLE' || err?.message?.includes('503');
      if (is503 && attempt < retries) {
        // Wait 1.5s then retry
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      throw err;
    }
  }
  return "I'm sorry, I couldn't process that.";
}

export async function dpdpChat(input: DpdpChatInput) {
  const systemContext = "You are an expert on India's Digital Personal Data Protection Act 2023 (DPDP Act). Answer questions accurately and concisely. Focus on practical compliance guidance for Indian businesses. Citations of sections are welcome but keep it simple.";

  const text = await generateWithRetry({
    system: systemContext,
    prompt: input.message,
    history: input.history?.map(h => ({
      role: h.role,
      content: [{ text: h.content }]
    })),
    config: { temperature: 0.7 }
  });

  return { response: text };
}