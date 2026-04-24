import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="animate-fade-up">
       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF] mb-6">
          <span className="text-xs font-bold tracking-widest uppercase">Legal</span>
       </div>
       <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
         Privacy Policy
       </h1>
       <div className="prose prose-invert prose-blue max-w-none text-textSecondary space-y-6">
          <p><strong>Last Updated: October 2024</strong></p>
          <p>This Privacy Policy outlines how Alcyone Secure System ("Company", "we", "us", or "our") collects, uses, encrypts, and handles your data across our platforms in compliance with industry standards including AES-256 constraints.</p>
          
          <h2 className="text-xl font-bold text-white mt-10 mb-4 font-headline">1. Information Collection</h2>
          <p>We log the telemetry necessary to provide effective cybersecurity auditing environments. This includes Authentication tokens via Firebase, generated assessment scores, and AI diagnostic completions. No biometric or unrelated personal identifiers are tracked.</p>
          
          <h2 className="text-xl font-bold text-white mt-10 mb-4 font-headline">2. AI Synchronization & Data Sharing</h2>
          <p>Alcyone utilizes Gemini-based LLM architectures to synthesize and parse context regarding compliance mistakes. PII is strictly stripped or obscured before any system payload interacts with external AI protocols. We do not sell your data under any circumstances.</p>
          
          <h2 className="text-xl font-bold text-white mt-10 mb-4 font-headline">3. User Rights</h2>
          <p>Pursuant to local legal provisions, you hold the right to petition the total deletion of your tracking history or revoke enterprise access via the administrative termination process.</p>
       </div>
    </div>
  );
}
