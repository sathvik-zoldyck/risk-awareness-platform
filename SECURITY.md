# Security policy

This platform stores employees' assessment results, so reports about its security are taken seriously.

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private reporting: open the **Security** tab of this repository and choose **Report a vulnerability**. Include steps to reproduce and the impact you expect. We aim to reply within 5 working days.

Only the latest commit on `main` receives fixes.

## Running your own deployment safely

- **Deploy the Firestore rules** (`npx firebase deploy --only firestore:rules`) whenever `firestore.rules` changes. The app relies on them for every permission check. `npm run test:rules` shows what they allow.
- **Create admins only in the Firebase console.** The app cannot grant the admin role, by design.
- **Keep `GOOGLE_API_KEY` server-side.** Never prefix it with `NEXT_PUBLIC_`.
- **Limit AI spend.** The AI features run as Next.js server actions that anyone who can reach your deployment can call. Set a quota or budget alert on the Gemini key.
- **Restrict the Firebase web API key** to your domains in the Google Cloud console.

## Known limitations

- **Answers are visible to signed-in users.** Assessments are graded in the browser, so the question bank, including the correct option, is readable by any signed-in user. A determined employee could look answers up. Moving grading to the server (a Cloud Function or server action) would fix this; contributions are welcome.
- **Join codes are bearer secrets.** Anyone with a company's code can join it as an employee. Share codes privately; a company admin can remove an employee.
