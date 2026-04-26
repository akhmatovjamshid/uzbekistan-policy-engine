# 14 - Sprint 3 Release Candidate Readiness

Date: 2026-04-26  
Branch: `epic/replatform-execution`  
Status: internal preview / release candidate  
Source closeout: `docs/planning/sprint-3-stabilization-closeout.md`

## Current Status

Sprint 3 is release-candidate ready for internal preview and controlled pilot preparation.

The app-level stabilization gate is clean according to the Sprint 3 closeout: lint passed, tests passed, production build passed, local browser QA passed across the supported routes, and the I-O pilot workflows were verified. The remaining release-control work is hosted verification, named evaluator readiness, and slice-based review before any merge to `main`.

## In Scope

- Internal preview of the React policy UI on `epic/replatform-execution`.
- Hosted smoke verification for the `/policy-ui/` GitHub Pages path.
- Six pilot surfaces: Overview, Scenario Lab, Comparison, Model Explorer, Data Registry, and Knowledge Hub.
- Static data artifact reachability for QPM, DFM, and I-O JSON files.
- EN/RU/UZ language-switch smoke coverage.
- I-O evidence visibility in Model Explorer.
- I-O run/save flow in Scenario Lab.
- Saved I-O add flow in Comparison.
- Data Registry visibility for implemented and planned model/data rows.
- Pilot review preparation with named evaluator requirement.
- Slice-based merge planning for eventual integration to `main`.

## Out of Scope

- New app features or UX expansion.
- New model bridge work beyond the current release candidate.
- Replacing the legacy root experience.
- Changing roadmap priorities.
- Full public launch or public-policy endorsement.
- Full accessibility audit, performance optimization pass, or translation-quality review.
- Refreshing QPM/DFM artifacts or reconciling I-O sector labels.
- Treating the release candidate branch as automatically ready for a casual mega-PR into `main`.

## Allowed Claims

- "Sprint 3 is an internal preview / release candidate."
- "The current branch passed docs-recorded lint, test, build, and local browser QA gates."
- "The pilot surface includes Overview, Scenario Lab, Comparison, Model Explorer, Data Registry, and Knowledge Hub."
- "I-O evidence is visible in Model Explorer."
- "Scenario Lab supports the current I-O run/save workflow."
- "Comparison can add saved I-O runs without replacing the macro comparison rows."
- "Data Registry makes implemented and planned model/data status visible."
- "Pilot review may proceed after hosted smoke verification and named evaluator confirmation."

## Disallowed Claims

- "Production release is complete."
- "The branch is ready to merge into `main` without slice review."
- "The hosted deployment has passed until the hosted smoke checklist is completed."
- "Pilot readiness is achieved before evaluators are named."
- "QPM and DFM freshness warnings are resolved."
- "I-O localization is complete across EN/RU/UZ sector names."
- "The bundle-size warning is fixed."
- "The app is validated for broad public use."
- "The current surface is a full replacement for every legacy workflow."

## CI, Browser, and Deploy Status

| Gate | Status | Evidence / note |
|---|---|---|
| Lint | Pass | `npm run lint` passed in Sprint 3 closeout. |
| Tests | Pass | `npm test` passed with 208 tests in Sprint 3 closeout. |
| Production build | Pass with accepted warning | `npm run build` passed; existing large chunk warning remains. |
| Local browser QA | Pass | Route, navigation, EN/RU/UZ, Data Registry, Model Explorer I-O evidence, Scenario Lab I-O save, and Comparison saved I-O add flows passed. |
| Hosted deployment | Conditional | GitHub Pages workflow must pass on Ubuntu and the hosted `/policy-ui/` path must be smoke checked. |
| Public launch | Not claimed | This package supports controlled pilot review, not public launch. |

## Accepted Warnings

- Existing Vite large chunk warning remains and should be planned for Sprint 4 or later hardening before wider public use.
- QPM and DFM Data Registry rows show warning freshness states; this is current data-state visibility, not a UI blocker.
- I-O sector labels remain Russian in the source artifact; EN and UZ sector-name reconciliation is a later data/content task.
- Local Windows Pages-base build probing hit `spawn EPERM`; the Ubuntu GitHub Pages workflow remains the required hosted deployment gate.
- Browser QA was a smoke/stabilization pass, not a complete accessibility, screen-reader, performance, or translation-quality audit.

## Remaining Gates Before Pilot

1. Complete the hosted smoke checklist in `docs/planning/sprint-3-hosted-smoke-checklist.md`.
2. Confirm the GitHub Pages workflow publishes the app under `/policy-ui/`.
3. Confirm QPM, DFM, and I-O JSON artifacts resolve from the hosted `/policy-ui/data/` path.
4. Confirm EN/RU/UZ switching on hosted routes without console errors.
5. Confirm Data Registry, Model Explorer I-O evidence, Scenario Lab I-O save flow, and Comparison saved I-O add flow on the hosted surface.
6. Name the minimum evaluator roster required by `docs/planning/sprint-3-pilot-review-kit.md`.
7. Prepare observation capture in `docs/frontend-replatform/13_pilot_observations.md`.

## Remaining Gates Before Merging to Main

1. Complete the slice-based review ledger in `docs/planning/sprint-3-main-merge-plan.md`.
2. Review deployment/base-path behavior separately from app feature slices.
3. Review bridge foundation, I-O analytics, saved-run workflow, trust/content/i18n, and Data Registry as separate acceptance units.
4. Confirm CI passes on the final merge candidate.
5. Confirm hosted smoke remains clean after the final branch state is selected.
6. Resolve or explicitly accept all P0/P1 pilot findings before merge.
7. Record owner approval for any remaining P2/P3 deferrals.
8. Avoid merging `epic/replatform-execution` as an unreviewed mega-PR.

## Go / No-Go Recommendation

GO for internal release-candidate preview.

GO for controlled pilot review only after hosted smoke verification passes and named evaluators are confirmed.

NO-GO for casual merge to `main` until the slice-based review ledger is complete, final CI is clean, hosted smoke is clean, and any P0/P1 pilot findings are resolved or explicitly blocked from the merge.
