import { config } from 'dotenv';
config();

import '@/ai/flows/explain-assessment-answer.ts';
import '@/ai/flows/generate-assessment-questions.ts';
import '@/ai/flows/generate-personal-recommendations.ts';
import '@/ai/flows/dpdp-compliance-chatbot.ts';