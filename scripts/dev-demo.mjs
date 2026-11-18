// Used by `npm run dev:demo` inside `firebase emulators:exec`:
// loads the demo data, then starts the app pointed at the emulators.
//   node scripts/dev-demo.mjs          -> next dev
//   node scripts/dev-demo.mjs start    -> next start (after a build made with the flag)
import { spawn, spawnSync } from "node:child_process";

const seed = spawnSync("npx", ["tsx", "scripts/seed-emulators.ts"], { stdio: "inherit", shell: true });
if (seed.status !== 0) process.exit(seed.status ?? 1);

const mode = process.argv[2] === "start" ? "start" : "dev";
const child = spawn("npx", ["next", mode, "-p", "9002"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true" },
});
child.on("exit", (code) => process.exit(code ?? 0));
