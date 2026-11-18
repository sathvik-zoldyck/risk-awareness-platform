// Captures README screenshots in CI: seeds the emulators, serves the app
// (built with NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true), signs in as each demo
// role and saves PNGs to ./screenshots-out. Run via the "Screenshots" workflow.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const OUT = "screenshots-out";
const BASE = "http://127.0.0.1:9002";
const PASSWORD = "demo-password";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const seed = spawnSync("npx", ["tsx", "scripts/seed-emulators.ts"], { stdio: "inherit" });
if (seed.status !== 0) process.exit(1);

const server = spawn("npx", ["next", "start", "-p", "9002"], { stdio: "inherit" });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(BASE)).ok) break; } catch {}
  await wait(1000);
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  args: ["--no-sandbox"],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});

async function shoot(page, name, url, { full = false, settle = 3500 } = {}) {
  if (url) await page.goto(BASE + url, { waitUntil: "networkidle2", timeout: 120000 });
  await wait(settle);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log("saved", name, page.url());
}

async function signIn(email) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.goto(BASE + "/login", { waitUntil: "networkidle2", timeout: 120000 });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await wait(3000);
  return { ctx, page };
}

try {
  const pub = await browser.newPage();
  await shoot(pub, "landing", "/");
  await shoot(pub, "login", "/login");
  await shoot(pub, "signup", "/signup");

  const emp = await signIn("priya@acme.demo");
  await shoot(emp.page, "employee-dashboard", "/employee/dashboard");
  await shoot(emp.page, "employee-assessment", "/employee/assessment");
  await shoot(emp.page, "employee-take", "/employee/assessment/take?type=basic");
  await shoot(emp.page, "employee-history", "/employee/history");
  await emp.ctx.close();

  const co = await signIn("security@acme.demo");
  await shoot(co.page, "company-dashboard", "/company/dashboard");
  await shoot(co.page, "company-employees", "/company/employees");
  await shoot(co.page, "company-reports", "/company/reports");
  await co.ctx.close();

  const admin = await signIn("admin@demo.local");
  await shoot(admin.page, "admin-dashboard", "/admin/dashboard");
  await shoot(admin.page, "admin-questions", "/admin/questions");
  await shoot(admin.page, "admin-companies", "/admin/companies");
  await admin.ctx.close();
} finally {
  await browser.close();
  server.kill();
}
process.exit(0);
