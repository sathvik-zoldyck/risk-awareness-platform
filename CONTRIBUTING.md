# Contributing

Thanks for helping. Good contributions include new questions for the bank, translations, accessibility fixes, new assessment modules and tests.

## Run it locally

```bash
npm install
npm run dev:demo     # app + Firebase emulators + demo data (needs Java 11+)
```

Sign in with the demo accounts listed in the [README](README.md#try-it-locally).

## Before you open a pull request

```bash
npm run typecheck
npm run build
npm run test:rules   # if you changed firestore.rules (needs Java 11+)
```

CI runs these on every pull request.

## Changing permissions

All access control lives in `firestore.rules`. If you change it, add or update a test in `tests/firestore.rules.test.ts` showing both what is now allowed and what is still denied.

## Adding questions

Default questions live in `src/lib/mock-data.ts` (`mockQuestions`). Each needs a category (`basic`, `role_based`, `dpdp` or `scenario`), four options, the correct option and a short explanation. Keep them accurate and cite the DPDP Act section where relevant.

## Guidelines

- One change per pull request, with a short description of what changed and why.
- Never commit real employee data, API keys or `.env.local`.
- Report security issues privately ([SECURITY.md](SECURITY.md)), not as issues.

By contributing you agree your contributions are licensed under the [MIT License](LICENSE).
