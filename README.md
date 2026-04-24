
#  Alcyone Secure

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.0-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Genkit](https://img.shields.io/badge/Genkit-1.28-blue?style=flat-square&logo=google)](https://firebase.google.com/docs/genkit)

**Alcyone Secure** is a premium, full-stack cybersecurity awareness and compliance assessment platform. Designed for modern organizations, it provides an interactive, AI-augmented hub for training employees and measuring institutional security risks.

---

##  Key Features

- **Interactive Assessments:** Scenario-driven quizzes designed to train employees on modern cybersecurity threats (Phishing, Network Security, DPDP Compliance, etc.).
- **AI-Powered Tutor:** Integrated with **Google Gemini API** to provide real-time, contextual explanations for assessment answers and a dedicated DPDP compliance chatbot.
- **Robust Analytics:** Role-based dashboards (Admin, Company, Employee) with dynamic data visualizations for tracking progress and security maturity.
- **Professional Reporting:** Automated generation of comprehensive PDF reports and completion certificates for organizational oversight.
- **Secure RBAC:** Strict Role-Based Access Control powered by Firebase Authentication and Firestore Security Rules.
- **Premium UI:** A state-of-the-art Dark Luxury/Glassmorphism theme built with Tailwind CSS and Radix UI.

---

##  Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 15 (App Router)](https://nextjs.org/), [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Backend/Auth** | [Firebase](https://firebase.google.com/) (Authentication, Firestore, App Hosting) |
| **AI Engine** | [Google Gemini API](https://ai.google.dev/), [Firebase Genkit](https://firebase.google.com/docs/genkit) |
| **Data Viz** | [Recharts](https://recharts.org/) |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) |

---

##  Project Structure

```text
src/
├── ai/             # Genkit flows and AI logic (Gemini integration)
├── app/            # Next.js App Router (Admin, Company, Employee ecosystems)
├── components/     # Reusable UI components (shadcn/ui based)
├── firebase/       # Firebase configuration and custom hooks
├── hooks/          # Custom React hooks
├── lib/            # Utilities, types, and mock data
└── tailwind/       # Global styles and theme configuration
```

---

##  Getting Started

### 1. Prerequisites

- Node.js 18+ 
- npm or yarn
- A Firebase Project
- A Google AI (Gemini) API Key

### 2. Installation

```bash
git clone https://github.com/your-username/alcyone-secure.git
cd alcyone-secure
npm install
```

### 3. Run Locally

```bash
npm run dev
```
The app will be available at `http://localhost:9002`.

---

##  User Roles

- **Admin:** Manage platform-wide questions, companies, and global stats.
- **Company:** Access organizational analytics, manage employees, and download compliance reports.
- **Employee:** Complete assessments, interact with the AI Tutor, and track personal growth.

---

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


