# Alcyone Secure - Project Context

This document provides a comprehensive overview of the **Alcyone Secure** project. It details the architecture, workflows, database schema, routing, features, and development roadmap to ensure any AI or developer can understand the entire system without examining the underlying code.

## 1. Project Overview
Alcyone Secure is a full-stack cybersecurity awareness and compliance assessment platform. It serves as an interactive hub for organizations to train and assess their employees on modern security concepts. The platform relies on three distinct organizational roles: **Admin**, **Company**, and **Employee**. It leverages AI to provide in-test explanations and dynamic chatbot functionality, alongside generating robust analytical PDF reports for organizational oversight.

## 2. Tech Stack
* **Frontend Framework:** Next.js (App Router) / React
* **Styling:** Tailwind CSS (Strict Global Dark/Glassmorphism theme)
* **Authentication:** Firebase Authentication
* **Database:** Firebase Firestore
* **AI Integration:** Google Gemini API (For dynamically generated explanations and AI Chatbot)
* **Reporting:** PDF Report Generation
* **Deployment/Backend Concept:** Vercel/Firebase App Hosting & Next.js Server actions/Serverless functions.

## 3. Folder Structure
The comprehensive mapped file structure of the Alcyone workspace currently stands as:

```text
/
├── .agents/
│   ├── skills/
│   │   └── fbs-to-agy-export/
│   │       ├── references/
│   │       │   ├── flutter.md
│   │       │   ├── nextjs.md
│   │       │   └── other.md
│   │       └── SKILL.md
│   └── workflows/
│       └── fbs-to-agy-export.md
├── .idx/
│   ├── dev.nix
│   └── icon.png
├── .vscode/
│   └── settings.json
├── docs/
│   ├── backend.json
│   └── blueprint.md
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   ├── dpdp-compliance-chatbot.ts
│   │   │   ├── explain-assessment-answer.ts
│   │   │   ├── generate-assessment-questions.ts
│   │   │   └── generate-personal-recommendations.ts
│   │   ├── dev.ts
│   │   └── genkit.ts
│   ├── app/
│   │   ├── admin/
│   │   │   ├── companies/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── questions/page.tsx
│   │   ├── company/
│   │   │   ├── dashboard/
│   │   │   │   ├── employees/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── employees/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── employee/
│   │   │   ├── assessment/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   └── results/page.tsx
│   │   ├── lib/
│   │   │   └── placeholder-images.json
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── assessment/
│   │   │   └── question-card.tsx
│   │   ├── auth/
│   │   │   ├── AuthCard.tsx
│   │   │   ├── AuthInput.tsx
│   │   │   ├── ForgotPasswordPanel.tsx
│   │   │   └── RoleSelector.tsx
│   │   ├── chat/
│   │   │   └── dpdp-chat.tsx
│   │   ├── dashboard/
│   │   │   └── stat-card.tsx
│   │   ├── landing/
│   │   │   ├── FeatureCard.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── HeroCanvas.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── RevealOnScroll.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   └── StepCard.tsx
│   │   ├── layout/
│   │   │   └── sidebar-nav.tsx
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── maturity-badge.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── score-ring.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── tooltip.tsx
│   │   └── FirebaseErrorListener.tsx
│   ├── firebase/
│   │   ├── firestore/
│   │   │   ├── use-collection.tsx
│   │   │   └── use-doc.tsx
│   │   ├── client-provider.tsx
│   │   ├── config.ts
│   │   ├── error-emitter.ts
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   ├── non-blocking-login.tsx
│   │   ├── non-blocking-updates.tsx
│   │   └── provider.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── mock-data.ts
│   │   ├── placeholder-images.json
│   │   ├── placeholder-images.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── tailwind.config.ts
├── .env
├── .gitignore
├── apphosting.yaml
├── components.json
├── firestore.rules
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── PROJECT_CONTEXT.md
├── README.md
├── studio.json
├── tailwind.config.ts
└── tsconfig.json
```

## 4. Routing Structure
The application follows a strictly defined routing architecture mapping to user roles:

* `/` - Base Landing Page (Marketing, Features, Stats)
* `/login` - Dedicated Login portal for all users
* `/signup` - Role-based Signup portal (Company & Employee)
* `/admin` - Admin Main Dashboard
* `/admin/questions` - Management of platform-wide Assessment Questions
* `/company` - Company Main Dashboard
* `/company/analytics` - View Employee aggregates and metrics
* `/company/reports` - Generated Organization PDF reports
* `/employee` - Employee Dashboard (Training Overview)
* `/employee/assessment` - Assessment execution interface
* `/employee/ai-tutor` - Chatbot/Help page powered by Gemini API

## 5. Firestore Database Structure
The NoSQL architecture utilizes collections logically separated by entity and activity:

* **`users`**
  * `uid` (Document ID)
  * `name`, `email`, `role`, `companyId` (Optional for Employees), `createdAt`, `jobRole`
* **`companies`**
  * `companyId` (Document ID)
  * `name`, `adminUid`, `joinCode`, `employeeCount`, `createdAt`
* **`assessments`**
  * `assessmentId` (Document ID)
  * `title`, `description`, `type` (e.g., Phishing, Network Security), `createdAt`
* **`questions`**
  * `questionId` (Document ID)
  * `assessmentId`, `questionText`, `options` (Array of Strings), `correctOptionIndex`, `aiContext` (Background context for Gemini)
* **`results`**
  * `resultId` (Document ID)
  * `userId`, `assessmentId`, `score`, `answers` (List of user choices), `completedAt`, `pdfUrl`

## 6. Authentication Flow
1. The user navigates to `/` and signs in via Firebase Authentication.
2. The application captures the Firebase User Object and queries the `users` Firestore collection mapping to the `uid`.
3. The custom `role` is evaluated from the database document.
4. The router handles redirection to ensure the user lands successfully on their isolated ecosystem:
   * **Admin** → Recalculates platform stats → Maps to `/admin`
   * **Company** → Fetches Company Metrics → Maps to `/company`
   * **Employee** → Evaluates outstanding exercises → Maps to `/employee`

## 7. Dashboard Features
* **Admin Dashboard:** Universal platform statistics, ability to perform CRUD operations on companies, assessments, and the global question pool.
* **Company Dashboard:** Robust analytics portraying employee completion percentages, aggregate organizational security scoring, capability to map join-codes, and ability to download overarching PDF performance reports.
* **Employee Dashboard:** Focuses on user enablement. Displays pending/completed assessments, user scores, and access gates to the AI Chatbot and certification downloads.

## 8. Assessment System
1. Employees navigate to an active assessment based on the Company's curriculum.
2. The UI renders the quiz progressively. 
3. *AI Integration Layer:* Following question completion, Gemini API can provide customized contextual explanations to emphasize *why* a particular security practice is correct, actively transforming a quiz into a training session.
4. The result payload is calculated and stored in Firestore under `results`.
5. Cloud triggers or Server actions dynamically aggregate and increment Company analytical scores.
6. A PDF is optionally generated rendering a completion certificate.

## 9. Navigation Rules
* **Strict Siloing:** Employees cannot traverse to `/company` routes; Companies cannot view `/admin` routes. Route guards handle immediate and silent redirection back to designated dashboards if access is attempted.
* Unauthenticated attempts to access any route aside from `/` redirect to `/`.
* All API functions and database interactions are gated by corresponding `firestore.rules` and backend validation checks confirming the role of the caller request.

## 10. Working Features
* Single cohesive Global styling theme eliminating visual inconsistencies across Public pages (`/`, `login`, `signup`) mapping directly to internal `Dashboard` definitions.
* Production Firebase setup encompassing `signInWithEmailAndPassword` and `createUserWithEmailAndPassword`.
* Active Firebase NoSQL document generation populating `/companies` (minting strict `joinCodes`) mapped strictly utilizing `/users` document linkage constraints.
* Directory abstractions built out representing `/admin`, `/company`, and `/employee`.
* Firebase Configs securely integrated into the baseline ecosystem utilizing environment variables.

## 11. Features To Build / Fix
* Finalize the Layout/Middleware routing guards controlling active RBAC states per session route transitions. ✅ (Completed via Server/Layout RouteGuards)
* Develop interactive and responsive component layouts for specific dashboard data visualizations (Graphs/Charts).
* Flesh out Google Gemini contextual wrapping for AI query passing.
* Complete generation engine for organizational and individual performance PDF reports.
* Hardcode Firestore Security Rules tightly wrapping the logical collections post-authentication. (Currently In Progress)

## 12. Final Platform Goal
The goal of Alcyone Secure is to evolve into a widely distributable Compliance and Training SaaS platform. It acts as an interactive bridge between companies measuring their institutional security risks and employees requiring modern, AI-augmented avenues for comprehending dynamic cybersecurity threats continually.

## 13. Development Roadmap
* **Phase 1: Foundation (Current Status):** Next.js architecture, Tailwind configuration, Firebase integration, baseline folder structuring.
* **Phase 2: Authentication Infrastructure (Completed):** Complete logical pipelines building companies, bounding join codes, generating Firebase Auth securely and updating User docs dynamically based on UI Role components. 
* **Phase 3: Database Prototyping (Completed):** Map Firestore schema perfectly into code via custom hooks, replace mock data on existing `/dashboard` components with exact Firestore snapshot pipelines while preserving fallback aesthetics.
* **Phase 4: Employee & AI Execution:** Develop the actual quiz interfaces and tie in Google Gemini API for seamless prompt handling and responses.
* **Phase 5: Company Analytics:** Construct widgets and reporting tools for Company admins, including dynamic UI visualizations.
* **Phase 6: Admin Overlay:** Design global management tooling for modifying overarching content mapping.
* **Phase 7: Final Polish & Exporting:** Bind PDF report generation logic into test completions and company reviews.
* **Phase 8: Security & Testing:** Harden Firestore security rules and complete end-to-end user navigation testing.
* **Phase 9: Production Launch:** Final platform audit, env variable securement, and deployment optimization.
