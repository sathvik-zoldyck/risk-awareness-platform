/**
 * Loads demo data into the local Firebase emulators.
 *
 *   npm run dev:demo      starts the emulators, runs this, then starts the app
 *
 * Everything here exists only inside the emulators on your machine. The
 * accounts are demo accounts for trying the app locally; they are not
 * valid on any real Firebase project.
 */
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { mockQuestions } from "../src/lib/mock-data";

const PROJECT_ID = "demo-risk-awareness";
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";

export const DEMO_PASSWORD = "demo-password";

export const DEMO_ACCOUNTS = {
  admin:    { email: "admin@demo.local",      name: "Platform Admin" },
  company:  { email: "security@acme.demo",    name: "Riya Kapoor" },
  employee: { email: "priya@acme.demo",       name: "Priya Sharma" },
} as const;

const EMPLOYEES = [
  { email: "priya@acme.demo",  name: "Priya Sharma",  jobRole: "developer",  scores: { basic: 94, role_based: 88, dpdp: 82, scenario: 90 } },
  { email: "rahul@acme.demo",  name: "Rahul Mehta",   jobRole: "hr",         scores: { basic: 62, role_based: 55, dpdp: 70 } },
  { email: "ananya@acme.demo", name: "Ananya Patel",  jobRole: "manager",    scores: { basic: 78, dpdp: 74, scenario: 81 } },
  { email: "kiran@acme.demo",  name: "Kiran Rao",     jobRole: "it",         scores: { basic: 88, role_based: 91, scenario: 85 } },
  { email: "deepak@acme.demo", name: "Deepak Singh",  jobRole: "developer",  scores: { basic: 45 } },
  { email: "meera@acme.demo",  name: "Meera Nair",    jobRole: "network",    scores: { basic: 91, role_based: 86, dpdp: 93, scenario: 89 } },
  { email: "arjun@acme.demo",  name: "Arjun Kumar",   jobRole: "general",    scores: {} },
] as const;

const COMPANY_ID = "acme";
const JOIN_CODE = "ACMEDEMO";

function maturity(pct: number): number {
  if (pct >= 90) return 5;
  if (pct >= 75) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

/** Create (or sign in) an Auth emulator user and return its uid. */
async function authUser(email: string, name: string): Promise<string> {
  const base = `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1`;
  const body = JSON.stringify({ email, password: DEMO_PASSWORD, displayName: name, returnSecureToken: true });
  const headers = { "Content-Type": "application/json" };
  let res = await fetch(`${base}/accounts:signUp?key=demo-key`, { method: "POST", headers, body });
  if (!res.ok) res = await fetch(`${base}/accounts:signInWithPassword?key=demo-key`, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`Auth emulator: ${res.status} ${await res.text()}`);
  return (await res.json()).localId as string;
}

async function main() {
  const env = await initializeTestEnvironment({ projectId: PROJECT_ID });
  const daysAgo = (n: number) => Timestamp.fromDate(new Date(Date.now() - n * 86_400_000));

  const adminUid = await authUser(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.name);
  const companyUid = await authUser(DEMO_ACCOUNTS.company.email, DEMO_ACCOUNTS.company.name);

  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();

    await setDoc(doc(db, "users", adminUid), {
      name: DEMO_ACCOUNTS.admin.name, email: DEMO_ACCOUNTS.admin.email, role: "admin", createdAt: daysAgo(60),
    });

    await setDoc(doc(db, "companies", COMPANY_ID), {
      name: "Acme Fintech", adminUid: companyUid, joinCode: JOIN_CODE, employeeCount: EMPLOYEES.length, createdAt: daysAgo(45),
    });
    await setDoc(doc(db, "joinCodes", JOIN_CODE), { companyId: COMPANY_ID });
    await setDoc(doc(db, "users", companyUid), {
      name: DEMO_ACCOUNTS.company.name, email: DEMO_ACCOUNTS.company.email, role: "company", companyId: COMPANY_ID, createdAt: daysAgo(45),
    });

    for (const [i, q] of mockQuestions.entries()) {
      const { id, ...rest } = q;
      await setDoc(doc(db, "questions", id), { ...rest, createdAt: daysAgo(50 - i) });
    }

    let attempt = 0;
    for (const [i, e] of EMPLOYEES.entries()) {
      const uid = await authUser(e.email, e.name);
      const scores = Object.values(e.scores) as number[];
      const latest = scores.length ? scores[scores.length - 1] : 0;
      await setDoc(doc(db, "users", uid), {
        name: e.name, email: e.email, role: "employee", jobRole: e.jobRole,
        companyId: COMPANY_ID, joinCode: JOIN_CODE, createdAt: daysAgo(40 - i),
        ...(scores.length ? { score: latest, maturity: maturity(latest) } : {}),
      });
      for (const [j, [moduleType, score]] of (Object.entries(e.scores) as [string, number][]).entries()) {
        const total = mockQuestions.filter((q) => q.category === moduleType).length || 4;
        const correct = Math.round((score / 100) * total);
        await setDoc(doc(db, "assessment_attempts", `demo-${++attempt}`), {
          userId: uid, companyId: COMPANY_ID, moduleType,
          completedAt: daysAgo(30 - i * 3 - j * 2),
          durationSeconds: 240 + i * 37 + j * 51,
          totalQuestions: total, correctCount: correct, score, maturityLevel: maturity(score),
          responses: [],
        });
      }
    }
  });

  await env.cleanup();
  console.log("\nDemo data loaded. Sign in with any of these (password: %s):", DEMO_PASSWORD);
  for (const [role, a] of Object.entries(DEMO_ACCOUNTS)) console.log(`  ${role.padEnd(9)} ${a.email}`);
  console.log(`  Employees can also join with code ${JOIN_CODE}.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
