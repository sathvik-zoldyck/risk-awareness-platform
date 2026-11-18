/**
 * Firestore security rules tests. Run with the emulator:
 *   npm run test:rules
 * (needs Java 11+; CI runs this on every pull request)
 */
import { after, before, beforeEach, describe, test } from "node:test";
import { readFileSync } from "node:fs";
import {
  assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, serverTimestamp,
} from "firebase/firestore";

let env: RulesTestEnvironment;

const ACME = "acme";
const GLOBEX = "globex";

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-risk-awareness",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

after(async () => { await env.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "users/admin1"), { role: "admin", email: "admin@example.com" });
    await setDoc(doc(db, "companies", ACME), { name: "Acme", adminUid: "acmeBoss", joinCode: "ACME2345" });
    await setDoc(doc(db, "companies", GLOBEX), { name: "Globex", adminUid: "globexBoss", joinCode: "GLBX2345" });
    await setDoc(doc(db, "joinCodes/ACME2345"), { companyId: ACME });
    await setDoc(doc(db, "joinCodes/GLBX2345"), { companyId: GLOBEX });
    await setDoc(doc(db, "users/acmeBoss"), { role: "company", companyId: ACME, email: "boss@acme.test" });
    await setDoc(doc(db, "users/globexBoss"), { role: "company", companyId: GLOBEX, email: "boss@globex.test" });
    await setDoc(doc(db, "users/alice"), { role: "employee", companyId: ACME, joinCode: "ACME2345", email: "alice@acme.test" });
    await setDoc(doc(db, "users/bob"), { role: "employee", companyId: GLOBEX, joinCode: "GLBX2345", email: "bob@globex.test" });
    await setDoc(doc(db, "assessment_attempts/a1"), { userId: "alice", companyId: ACME, score: 80 });
    await setDoc(doc(db, "assessment_attempts/b1"), { userId: "bob", companyId: GLOBEX, score: 40 });
  });
});

const as = (uid: string) => env.authenticatedContext(uid).firestore();
const anon = () => env.unauthenticatedContext().firestore();

describe("privilege escalation", () => {
  test("a new user cannot sign up as an admin", async () => {
    await assertFails(setDoc(doc(as("mallory"), "users/mallory"), { role: "admin", email: "m@x.test" }));
  });

  test("a user cannot promote themselves to admin", async () => {
    await assertFails(updateDoc(doc(as("alice"), "users/alice"), { role: "admin" }));
  });

  test("a user cannot move themselves to another company", async () => {
    await assertFails(updateDoc(doc(as("alice"), "users/alice"), { companyId: GLOBEX }));
  });

  test("a user can still update their own score", async () => {
    await assertSucceeds(updateDoc(doc(as("alice"), "users/alice"), { score: 90, maturity: 4 }));
  });

  test("a user cannot write a company profile for a company they don't own", async () => {
    await assertFails(setDoc(doc(as("mallory"), "users/mallory"), { role: "company", companyId: ACME }));
  });
});

describe("companies and join codes", () => {
  test("signed-out visitors cannot list companies", async () => {
    await assertFails(getDocs(collection(anon(), "companies")));
  });

  test("signed-in non-admins cannot list companies", async () => {
    await assertFails(getDocs(collection(as("alice"), "companies")));
  });

  test("admins can list companies", async () => {
    await assertSucceeds(getDocs(collection(as("admin1"), "companies")));
  });

  test("a member can read their own company but not another", async () => {
    await assertSucceeds(getDoc(doc(as("alice"), "companies", ACME)));
    await assertFails(getDoc(doc(as("alice"), "companies", GLOBEX)));
  });

  test("anyone can check a single join code, nobody can list them", async () => {
    await assertSucceeds(getDoc(doc(anon(), "joinCodes/ACME2345")));
    await assertFails(getDocs(collection(anon(), "joinCodes")));
  });

  test("only a company's admin can register its join code", async () => {
    await assertFails(setDoc(doc(as("mallory"), "joinCodes/EVIL2345"), { companyId: ACME }));
    await assertSucceeds(setDoc(doc(as("acmeBoss"), "joinCodes/ACME9999"), { companyId: ACME }));
  });

  test("an existing join code cannot be overwritten", async () => {
    await assertFails(setDoc(doc(as("globexBoss"), "joinCodes/ACME2345"), { companyId: GLOBEX }));
  });
});

describe("sign-up flows", () => {
  test("a company admin can sign up", async () => {
    const db = as("newBoss");
    await assertSucceeds(setDoc(doc(db, "companies/initech"), {
      name: "Initech", adminUid: "newBoss", joinCode: "INIT2345", employeeCount: 0, createdAt: serverTimestamp(),
    }));
    await assertSucceeds(setDoc(doc(db, "joinCodes/INIT2345"), { companyId: "initech" }));
    await assertSucceeds(setDoc(doc(db, "users/newBoss"), {
      name: "Boss", email: "b@initech.test", role: "company", companyId: "initech",
    }));
  });

  test("an employee can join with a valid code", async () => {
    await assertSucceeds(setDoc(doc(as("carol"), "users/carol"), {
      name: "Carol", email: "c@acme.test", role: "employee", companyId: ACME, joinCode: "ACME2345",
    }));
  });

  test("an employee cannot join a company the code doesn't belong to", async () => {
    await assertFails(setDoc(doc(as("carol"), "users/carol"), {
      name: "Carol", email: "c@x.test", role: "employee", companyId: GLOBEX, joinCode: "ACME2345",
    }));
  });

  test("an employee cannot join without a code", async () => {
    await assertFails(setDoc(doc(as("carol"), "users/carol"), {
      name: "Carol", email: "c@x.test", role: "employee", companyId: ACME,
    }));
  });
});

describe("company admins", () => {
  test("can list their own employees", async () => {
    const q = query(collection(as("acmeBoss"), "users"), where("companyId", "==", ACME), where("role", "==", "employee"));
    await assertSucceeds(getDocs(q));
  });

  test("cannot list another company's employees", async () => {
    const q = query(collection(as("acmeBoss"), "users"), where("companyId", "==", GLOBEX));
    await assertFails(getDocs(q));
  });

  test("can remove an employee from their company", async () => {
    await assertSucceeds(updateDoc(doc(as("acmeBoss"), "users/alice"), { companyId: null }));
  });

  test("cannot change an employee's role", async () => {
    await assertFails(updateDoc(doc(as("acmeBoss"), "users/alice"), { role: "admin" }));
  });

  test("cannot remove another company's employee", async () => {
    await assertFails(updateDoc(doc(as("acmeBoss"), "users/bob"), { companyId: null }));
  });

  test("can read their employees' attempts but not others'", async () => {
    await assertSucceeds(getDoc(doc(as("acmeBoss"), "assessment_attempts/a1")));
    await assertFails(getDoc(doc(as("acmeBoss"), "assessment_attempts/b1")));
  });
});

describe("assessment attempts", () => {
  test("users can list their own attempts", async () => {
    const q = query(collection(as("alice"), "assessment_attempts"), where("userId", "==", "alice"));
    await assertSucceeds(getDocs(q));
  });

  test("users cannot list everyone's attempts", async () => {
    await assertFails(getDocs(collection(as("alice"), "assessment_attempts")));
  });

  test("users cannot read someone else's attempt", async () => {
    await assertFails(getDoc(doc(as("alice"), "assessment_attempts/b1")));
  });

  test("users can record their own attempt for their own company only", async () => {
    await assertSucceeds(setDoc(doc(as("alice"), "assessment_attempts/a2"), { userId: "alice", companyId: ACME, score: 70 }));
    await assertFails(setDoc(doc(as("alice"), "assessment_attempts/a3"), { userId: "alice", companyId: GLOBEX, score: 70 }));
    await assertFails(setDoc(doc(as("alice"), "assessment_attempts/a4"), { userId: "bob", companyId: ACME, score: 0 }));
  });

  test("attempts cannot be edited", async () => {
    await assertFails(updateDoc(doc(as("alice"), "assessment_attempts/a1"), { score: 100 }));
  });
});

describe("settings", () => {
  test("only admins can change global settings", async () => {
    await assertFails(setDoc(doc(as("acmeBoss"), "settings/global"), { passMark: 0 }));
    await assertSucceeds(setDoc(doc(as("admin1"), "settings/global"), { passMark: 70 }));
  });
});
