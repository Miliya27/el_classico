# Working Rules

## 1. GIT

- Remote: https://github.com/Miliya27/el_classico.git
- One branch per part, named `part-NN-short-name`. Never commit directly to `main` except the merge at the end of a part.
- Small atomic commits: one logical change each. Aim for 10-25 commits per part. Commit after every working step, never one big batch at the end.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`) with a clear one-line subject.
- No squashing, no history rewriting. Push the branch regularly.
- When the part is verified, merge into `main` with a merge commit, tag `part-NN-done`, push main and tags.

## 2. SECRETS

- Never commit secrets. `.env.local` is gitignored. `.env.example` lists variable names with empty values.
- Never print secret values in chat, logs or reports.
- Never put a service role / secret key in any `NEXT_PUBLIC_` variable or client code.
- Do not ask me for the service role key or database password. If you think you need one, stop and explain why.
- Do not install anything globally without asking me first.

## 3. SCOPE

- Do only the current part. Do not build features from later parts.
- If the brief is unclear or seems wrong, do not silently change it. Pick the simplest option, mark it clearly, and list it under Questions in the report.
- If you are blocked, stop and ask instead of guessing.

## 4. VERIFICATION

- After each meaningful step run lint, type-check and build. Fix failures before committing.

## 5. REPORT (mandatory at the end of every part)

- Write `docs/reports/part-NN-report.md` and paste the same text in chat, then STOP. Do not start the next part until I say so.
- Sections: 1 Summary; 2 What was built (per task); 3 Commits (git log --oneline for this part); 4 Files added/changed; 5 How to run and test (exact commands); 6 Verification results (lint, types, build, manual checks); 7 Deviations from the brief and why; 8 Known issues and risks; 9 Questions for me; 10 Ready for next part (yes/no, blockers).
- Be honest. Mark anything you did not actually test as UNTESTED.

## 6. CODE QUALITY

- TypeScript strict. Small components. Clear names. Comments only where the reason is not obvious.
