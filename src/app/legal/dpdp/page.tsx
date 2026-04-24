import React from 'react';

export default function DPDPFrameworkPage() {
  return (
    <div className="animate-fade-up">
       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[##22C55E]/20 bg-[#22C55E]/10 text-[#4ADE80] mb-6">
          <span className="text-xs font-bold tracking-widest uppercase">Framework Compliance</span>
       </div>
       <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">
         Digital Personal Data Protection (DPDP) Act
       </h1>
       <div className="prose prose-invert prose-blue max-w-none text-textSecondary space-y-6">
          <p>Alcyone Secure fundamentally aligns our entire assessment structure around standard protocols mapped out by the Indian Digital Personal Data Protection Act of 2023.</p>
          
          <h2 className="text-xl font-bold text-white mt-10 mb-4 font-headline">Fiduciary Duties & Automation</h2>
          <p>Our AI engines synthesize realistic scenarios simulating Notice generation, Data Principal Consent gathering routines, and handling legitimate organizational breaches seamlessly so employees grasp their fiduciary boundaries safely.</p>
          
          <h2 className="text-xl font-bold text-white mt-10 mb-4 font-headline">Compliance Verification Pipeline</h2>
          <p>Using our Global Analytics and dynamic PDF reporting engine, Data Fiduciaries (Company Admins) hold the immediate power to audit and compile irrefutable documentation demonstrating that their data handling employees have completed stringent DPDP scenario verifications successfully.</p>
          
          <h2 className="text-xl font-bold text-white mt-10 mb-4 font-headline">Continuous Assessment Standards</h2>
          <p>We believe compliance isn't static. The platform maintains iterative historical logs preventing companies from slipping off baseline knowledge criteria internally over long stretches of operational time.</p>
       </div>
    </div>
  );
}
