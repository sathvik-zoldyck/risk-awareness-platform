# **App Name**: Alcyone Secure

## Core Features:

- Secure User Management: Handle user registration, login, and role-based access for Admin, Company, and Employee accounts, powered by Firebase Authentication.
- Interactive Assessment Engine: Deliver multi-section cybersecurity awareness and compliance assessments, supporting resume functionality and storing all responses and progress in Firestore.
- AI-Powered Explanations & Recommendations: Provide immediate, AI-generated explanations for assessment answers and personalized, post-assessment recommendations for improving weak areas using an AI tool.
- Dynamic Dashboards: Visualize assessment data, individual scores, earned badges, and company-wide aggregated progress for employees and company administrators, utilizing Firestore for data retrieval.
- Admin Question Bank & AI Generation: Enable administrators to manage the question bank (CRUD) and use an AI tool to automatically generate new assessment questions based on specific categories and roles.
- Comprehensive PDF Report Generation: Generate and provide download functionality for professional PDF reports for companies, summarizing employee assessment results and compliance readiness via Firebase Functions and a PDF library.
- Real-time DPDP Chatbot: Offer an AI-powered conversational tool accessible from the dashboard to answer specific questions related to India's Digital Personal Data Protection Act (DPDP) 2023.

## Style Guidelines:

- Color scheme: Dark, designed for a professional and high-tech feel. Primary color: Electric Cyan (#00D4FF), serving as a vibrant accent for active states, highlights, and calls to action. Accent color: Muted Violet (#7B61FF) provides a sophisticated contrast for secondary actions and badges.
- Background color: A near-black with a subtle cool tint (#0A0C10) creates a deeply immersive and modern professional environment, providing optimal contrast for UI elements.
- Supporting colors: Specific shades for Success (#22C55E), Warning (#F59E0B), Danger (#EF4444), along with primary text (#F0F4F8) and muted text (#6B7280) for clear visual communication within the dark theme.
- Headline font: 'Sora' (sans-serif) for modern and clean titles. Body font: 'Inter' (sans-serif) for readable and neutral general text. Numeric data/scores font: 'DM Mono' (monospace sans-serif) for a precise, tech-inspired appearance. Note: currently only Google Fonts are supported.
- Custom score rings/circular progress indicators and unique shield-themed iconography for maturity levels. Earned achievements will be represented by elegant badge cards, all contributing to a professional, secure aesthetic.
- Desktop navigation utilizes a fixed sidebar, transitioning to a bottom navigation bar for mobile devices. Cards feature a 12px border-radius and buttons a subtle 8px. Tables employ alternating row tints (rgba(255,255,255,0.02)) for enhanced readability. Modals implement a frosted glass effect with a `backdrop-filter: blur(12px)` and a dark, semi-transparent background.
- Key interface elements will incorporate subtle animations, such as score numbers counting up on load and subtle box-shadows on active/hover cards. Skeleton loaders will be utilized for all asynchronous data fetching, ensuring a smooth user experience during data loading.