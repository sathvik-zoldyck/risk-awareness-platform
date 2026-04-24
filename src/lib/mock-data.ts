
import { Question, User, Company, Employee } from './types';

export const mockAdmin: User = {
  uid: 'admin-1',
  email: 'admin@alcyonesecure.com',
  name: 'Master Admin',
  role: 'admin',
  createdAt: new Date().toISOString()
};

export const mockCompany: Company = {
  id: 'company-1',
  name: 'Demo Corp',
  industry: 'Technology',
  size: '50-200',
  contactEmail: 'contact@democorp.com',
  adminId: 'company-admin-1',
  createdAt: new Date().toISOString()
};

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    userId: 'user-emp-1',
    companyId: 'company-1',
    name: 'John Dev',
    email: 'john@democorp.com',
    role: 'Developer',
    assessmentStatus: 'completed'
  },
  {
    id: 'emp-2',
    userId: 'user-emp-2',
    companyId: 'company-1',
    name: 'Sarah HR',
    email: 'sarah@democorp.com',
    role: 'HR',
    assessmentStatus: 'not_started'
  },
  {
    id: 'emp-3',
    userId: 'user-emp-3',
    companyId: 'company-1',
    name: 'Mike Net',
    email: 'mike@democorp.com',
    role: 'Network Engineer',
    assessmentStatus: 'in_progress'
  }
];

export const mockQuestions: Question[] = [
  // --- BASIC CYBERSECURITY ---
  {
    id: 'b1', category: 'basic', role: 'all',
    questionText: 'An attacker uses an Adversary-in-the-Middle (AiTM) reverse proxy framework (like Evilginx) against your login portal. Which of the following Multi-Factor Authentication (MFA) methods is truly resistant to this attack?',
    options: [
      { id: 'a', text: 'Time-based One-Time Passwords (TOTP) from an authenticator app' },
      { id: 'b', text: 'FIDO2 / WebAuthn hardware security keys (e.g., YubiKey)' },
      { id: 'c', text: 'SMS-based One-Time Passwords' },
      { id: 'd', text: 'Push notifications via a mobile app (without number matching)' }
    ],
    correctOptionId: 'b', explanation: 'Hardware keys cryptographically bind the login session to the actual domain, causing reverse proxies to blindly fail the challenge.', difficulty: 'hard', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'b2', category: 'basic', role: 'all',
    questionText: 'When establishing a secure connection to an external vendor’s API, why is certificate pinning considered a double-edged sword?',
    options: [
      { id: 'a', text: 'It prevents MitM attacks but can easily break the application if the vendor rotates their certificate unexpectedly.' },
      { id: 'b', text: 'It encrypts the payload but exposes the certificate authority to public DNS leakage.' },
      { id: 'c', text: 'It requires physical hardware tokens to establish the TLS handshake.' },
      { id: 'd', text: 'It drastically decreases the speed of the TLS handshake, causing timeout errors.' }
    ],
    correctOptionId: 'a', explanation: 'Pinning strictly verifies a specific certificate; if the vendor rotates it without notice, your client will definitively reject the new trusted cert.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'b3', category: 'basic', role: 'all',
    questionText: 'You receive an urgent email seemingly from the CEO requesting a wire transfer. The sender domain looks identical, but it fails DMARC validation. What does this indicate?',
    options: [
      { id: 'a', text: 'The email was intercepted and encrypted by a gateway.' },
      { id: 'b', text: 'The sender’s IP is not authorized to send email on behalf of the domain (Spoofing).' },
      { id: 'c', text: 'The CEO sent the email from a mobile device on a cellular network.' },
      { id: 'd', text: 'The email contains a malicious executable attachment.' }
    ],
    correctOptionId: 'b', explanation: 'DMARC relies on SPF and DKIM. Failure indicates the sending server isn\'t authorized by the real domain\'s DNS records.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'b4', category: 'basic', role: 'all',
    questionText: 'What is the primary operational advantage of using a password manager over manually creating "complex" passwords like "Spring2025!"?',
    options: [
      { id: 'a', text: 'Password managers prevent hardware key logging.' },
      { id: 'b', text: 'They automatically rotate your passwords every 30 days.' },
      { id: 'c', text: 'They generate high-entropy, unique passwords for every site, mitigating credential stuffing attacks.' },
      { id: 'd', text: 'They bypass the need for Multi-Factor Authentication.' }
    ],
    correctOptionId: 'c', explanation: 'Unique, high-entropy passwords mean a breach on a low-security website won\'t compromise your enterprise portal.', difficulty: 'easy', createdBy: 'admin', createdAt: new Date().toISOString()
  },

  // --- ROLE-BASED (Developer/IT) ---
  {
    id: 'r1', category: 'role_based', role: 'Developer',
    questionText: 'During a CI/CD pipeline run, you need your containerized application to access a database. What is the most secure method to inject the credentials?',
    options: [
      { id: 'a', text: 'Hardcoding them in the Dockerfile as ENV variables.' },
      { id: 'b', text: 'Committing an encrypted .env file into the repository.' },
      { id: 'c', text: 'Using a seamless secret manager (e.g., AWS Secrets Manager, HashiCorp Vault) injected at runtime.' },
      { id: 'd', text: 'Passing them as plain text via command-line arguments during deployment.' }
    ],
    correctOptionId: 'c', explanation: 'Secret managers ensure credentials are never written to disk or stored in source control, only accessed securely in memory at runtime.', difficulty: 'hard', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'r2', category: 'role_based', role: 'Developer',
    questionText: 'You are implementing JWT (JSON Web Tokens) for session handling. Why must you categorically avoid storing the JWT in `localStorage`?',
    options: [
      { id: 'a', text: 'localStorage is limited to 5MB, which is too small for JWTs.' },
      { id: 'b', text: 'localStorage is fully accessible to any JavaScript running on the page, making it highly vulnerable to Cross-Site Scripting (XSS).' },
      { id: 'c', text: 'Tokens in localStorage are not sent automatically with HTTP requests.' },
      { id: 'd', text: 'localStorage is automatically cleared when the browser tab is closed.' }
    ],
    correctOptionId: 'b', explanation: 'XSS attacks can easily read localStorage. Using HttpOnly cookies prevents JavaScript access entirely.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'r3', category: 'role_based', role: 'Developer',
    questionText: 'Which cryptographic curve is considered the modern, highly secure standard replacing legacy RSA keys for SSH authentication?',
    options: [
      { id: 'a', text: 'RSA-1024' },
      { id: 'b', text: 'MD5' },
      { id: 'c', text: 'Ed25519' },
      { id: 'd', text: 'SHA-256' }
    ],
    correctOptionId: 'c', explanation: 'Ed25519 is an elliptic curve signature scheme that offers better security, faster performance, and smaller key sizes than RSA.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'r4', category: 'role_based', role: 'Developer',
    questionText: 'When logging detailed application errors to your centralized ELK/Datadog stack, which of the following MUST be scrubbed before transmission?',
    options: [
      { id: 'a', text: 'Stack traces and line numbers.' },
      { id: 'b', text: 'Session IDs, PII (Personally Identifiable Information), and authorization bearer tokens.' },
      { id: 'c', text: 'The IP address of the load balancer.' },
      { id: 'd', text: 'The timestamp of the crash.' }
    ],
    correctOptionId: 'b', explanation: 'Logging sensitive tokens or PII violates compliance frameworks (GDPR/DPDP) and exposes active sessions to any engineer with log access.', difficulty: 'easy', createdBy: 'admin', createdAt: new Date().toISOString()
  },

  // --- DPDP COMPLIANCE (India 2023) ---
  {
    id: 'd1', category: 'dpdp', role: 'all',
    questionText: 'Under the Indian DPDP Act 2023, what is the explicitly defined role of a "Consent Manager"?',
    options: [
      { id: 'a', text: 'An internal HR employee dedicated to managing data.' },
      { id: 'b', text: 'An individual Data Principal who gives consent.' },
      { id: 'c', text: 'A registered entity registered with the Data Protection Board that acts as a single point of contact enabling Data Principals to give, manage, and withdraw consent.' },
      { id: 'd', text: 'A cloud provider (e.g., AWS, Azure) hosting the database.' }
    ],
    correctOptionId: 'c', explanation: 'Consent Managers are specialized, accountable entities intended to give citizens accessible, unified control over their digital consent across multiple services.', difficulty: 'hard', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'd2', category: 'dpdp', role: 'all',
    questionText: 'If your company processes physical paper forms containing user details and later digitizes them, does the DPDP Act 2023 apply?',
    options: [
      { id: 'a', text: 'No, the Act strictly applies only to data collected directly through digital applications.' },
      { id: 'b', text: 'Yes, but only if the data is transferred outside of India.' },
      { id: 'c', text: 'Yes. The Act applies to personal data collected in offline form that is subsequently digitized.' },
      { id: 'd', text: 'No, paper forms are permanently exempt from all privacy legislation.' }
    ],
    correctOptionId: 'c', explanation: 'The Act explicitly extends to offline personal data as soon as it is digitized by a Data Fiduciary.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'd3', category: 'dpdp', role: 'all',
    questionText: 'What is the maximum monetary penalty (per instance) the Data Protection Board can levy against a company for failing to take reasonable security safeguards preventing a data breach?',
    options: [
      { id: 'a', text: '₹10 Lakhs' },
      { id: 'b', text: '₹50 Crores' },
      { id: 'c', text: '₹250 Crores' },
      { id: 'd', text: '4% of Global Revenue' }
    ],
    correctOptionId: 'c', explanation: 'Schedule 1 of the DPDP Act 2023 specifies a massive penalty of up to Rs. 250 Crore for failing to prevent a personal data breach.', difficulty: 'hard', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 'd4', category: 'dpdp', role: 'all',
    questionText: 'When a Data Principal explicitly withdraws their consent, what is the immediate regulatory obligation of your company (the Data Fiduciary)?',
    options: [
      { id: 'a', text: 'Retain the data indefinitely in a "withdrawn" database for analytics.' },
      { id: 'b', text: 'Cease processing and erase the personal data as soon as reasonably practicable, unless retention is required by another law.' },
      { id: 'c', text: 'Encrypt the data but continue using it for AI modeling.' },
      { id: 'd', text: 'Send an email asking them to reconsider before deleting their data in 90 days.' }
    ],
    correctOptionId: 'b', explanation: 'Withdrawal of consent triggers an immediate legal bound to erase the subject\'s data locally and externally, barring explicit legal retention mandates.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },

  // --- SCENARIO THINKING ---
  {
    id: 's1', category: 'scenario', role: 'all',
    questionText: 'You find a USB drive labeled "Q3 Layoff Roster" in the parking lot. What is the safest, protocol-adherent action?',
    options: [
      { id: 'a', text: 'Plug it into an isolated "air-gapped" laptop to determine who it belongs to.' },
      { id: 'b', text: 'Hand it directly to IT Security or Facility Management without plugging it into any device whatsoever.' },
      { id: 'c', text: 'Plug it into your workstation but do not open any files.' },
      { id: 'd', text: 'Throw it directly into a trash can.' }
    ],
    correctOptionId: 'b', explanation: '"Baiting" attacks rely on human curiosity. Even inserting the drive can trigger malicious HID payloads (like Rubber Ducky) bypassing traditional execution checks.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 's2', category: 'scenario', role: 'all',
    questionText: 'During a critical server outage, an individual claiming to be a Tier-3 Support Tech on the phone asks for your root password to "restart the localized hypervisor." What do you do?',
    options: [
      { id: 'a', text: 'Give them the password, but change it immediately after the call.' },
      { id: 'b', text: 'Refuse, hang up, and independently verify the outage and their identity via internal secure channels (e.g., Slack/Teams directory, direct IT numbers).' },
      { id: 'c', text: 'Ask them personal security questions before giving the password.' },
      { id: 'd', text: 'Give them a temporary guest password.' }
    ],
    correctOptionId: 'b', explanation: 'This is a Vishing (Voice Phishing) attempt. IT will never ask for your explicit password. You must establish an out-of-band verification.', difficulty: 'easy', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 's3', category: 'scenario', role: 'all',
    questionText: 'A delivery driver holding a massive stack of boxes asks you to "hold the door" as you badge into the secure data center hallway. Protocol designates no tailgating. How do you handle it?',
    options: [
      { id: 'a', text: 'Hold the door—it’s just polite and they clearly are struggling with the boxes.' },
      { id: 'b', text: 'Politely refuse, direct them to the reception/loading dock, and ensure the door securely latches behind you.' },
      { id: 'c', text: 'Hold the door but watch them closely as they walk to their destination.' },
      { id: 'd', text: 'Take the boxes from them so they don’t need to come inside.' }
    ],
    correctOptionId: 'b', explanation: 'Social engineers frequently use "physical encumbrance" (holding heavy items) to exploit social norms and bypass physical access controls.', difficulty: 'medium', createdBy: 'admin', createdAt: new Date().toISOString()
  },
  {
    id: 's4', category: 'scenario', role: 'all',
    questionText: 'You notice your laptop encrypting files and flashing a Ransomware lock screen. Your device is connected to the Corporate VPN. What is your very first physical action?',
    options: [
      { id: 'a', text: 'Email your manager immediately from that laptop.' },
      { id: 'b', text: 'Pay the requested Bitcoin to unlock the device before anyone notices.' },
      { id: 'c', text: 'Physically disconnect the device from the network (unplug Ethernet, toggle WiFi) to prevent lateral movement, then use your phone to call IT Security.' },
      { id: 'd', text: 'Attempt to run Windows Defender.' }
    ],
    correctOptionId: 'c', explanation: 'Severing the network connection is the highest priority to stop the ransomware worm from spreading literally to company servers and backups.', difficulty: 'hard', createdBy: 'admin', createdAt: new Date().toISOString()
  }
];
