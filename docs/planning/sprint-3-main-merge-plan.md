# Sprint 3 Main Merge Plan

Date: 2026-04-26  
Branch under review: `epic/replatform-execution`  
Target branch: `main`  
Status: merge-control plan

This plan controls how Sprint 3 replatform work should be reviewed before it reaches `main`. It does not authorize new app features and does not replace the hosted smoke or pilot review gates.

## Why Not One Casual Mega-PR

`epic/replatform-execution` combines deployment/base-path work, bridge foundations, I-O analytics, saved-run workflow, trust/content/i18n work, and Data Registry visibility. Merging that as one casual mega-PR would make it difficult to isolate regressions, assign review ownership, or decide which risks are acceptable.

The branch should be reviewed through explicit slices even if the final technical merge is one PR. Each slice needs an acceptance record so reviewers can tell whether a failure belongs to deployment, model bridge behavior, analytics rendering, state persistence, trust copy, localization, or registry visibility.

## Slice-Based Review Ledger

| Slice | Purpose | Reviewer / owner | Status | Evidence link |
|---|---|---|---|---|
| Deployment/base-path | Confirm the app works under the hosted `/policy-ui/` path and data artifacts resolve. | `[TBD]` | `[pending]` | `docs/planning/sprint-3-hosted-smoke-checklist.md` |
| Bridge foundation | Confirm app bridge contracts remain explicit and do not silently mock unsupported model behavior. | `[TBD]` | `[pending]` | `[fill in]` |
| I-O analytics | Confirm I-O evidence and analytics are visible, caveated, and scoped to current artifact limits. | `[TBD]` | `[pending]` | `[fill in]` |
| Saved-run workflow | Confirm Scenario Lab save and Comparison add flows work without corrupting macro comparison behavior. | `[TBD]` | `[pending]` | `[fill in]` |
| Trust/content/i18n | Confirm caveats, provenance, warnings, and EN/RU/UZ smoke behavior are honest and usable. | `[TBD]` | `[pending]` | `[fill in]` |
| Data Registry | Confirm implemented/planned assets and warning states are visible and accurate for pilot scope. | `[TBD]` | `[pending]` | `[fill in]` |

## Acceptance Criteria by Slice

### Deployment/base-path

- GitHub Pages workflow passes on Ubuntu.
- App is served under `/policy-ui/`.
- Direct hosted routes work for:
  - `/policy-ui/#/overview`
  - `/policy-ui/#/scenario-lab`
  - `/policy-ui/#/comparison`
  - `/policy-ui/#/model-explorer`
  - `/policy-ui/#/data-registry`
  - `/policy-ui/#/knowledge-hub`
- Hosted data artifacts resolve:
  - `/policy-ui/data/qpm.json`
  - `/policy-ui/data/dfm.json`
  - `/policy-ui/data/io.json`
- Browser refresh/back behavior does not break the hosted SPA path.
- No required hosted smoke flow produces browser console errors.

### Bridge Foundation

- Bridge contracts are explicit about available, degraded, planned, and unsupported model states.
- Unsupported or missing model behavior does not fall back to silent fake results.
- Provenance and caveat surfaces remain visible where bridge outputs are consumed.
- Existing tests that cover bridge fallback and metadata behavior remain passing.
- Any accepted bridge limitation is documented as a warning or follow-up, not hidden.

### I-O Analytics

- Model Explorer shows I-O bridge evidence with source artifact, 2022 vintage, 136-sector scope, Leontief framework, linkage classes, and caveats.
- Scenario Lab renders current I-O sector-shock analytics.
- I-O analytics do not claim localization-complete sector labels.
- I-O analytics do not imply QPM/DFM freshness warnings are resolved.
- Any I-O interpretation shown to users remains scoped to current artifact limitations.

### Saved-Run Workflow

- Scenario Lab can save an I-O run.
- Saved run includes enough provenance for a reviewer to understand what was saved.
- Saved run can be opened or added from Comparison.
- Adding an I-O run in Comparison does not overwrite or distort macro comparison rows.
- Empty, duplicate, or unavailable saved-run states are explicit enough for pilot use.

### Trust/Content/i18n

- Allowed claims and caveats match `docs/frontend-replatform/14_sprint3_release_candidate_readiness.md`.
- QPM/DFM warning freshness states remain visible where relevant.
- I-O sector-label caveat remains visible or discoverable.
- EN/RU/UZ switching works on the six hosted routes without route breakage or console errors.
- Translation quality issues are triaged as Sprint 4 content/i18n work unless they block navigation, layout, or task completion.
- No UI text implies production launch, full public validation, or main-merge readiness before those gates are complete.

### Data Registry

- Data Registry is reachable from the hosted app.
- QPM, DFM, and I-O implemented rows are visible.
- PE, CGE, and FPP planned rows are visible.
- Freshness/status warnings are visible and understandable.
- Registry state agrees with the current release-candidate scope and does not overstate model availability.
- Registry visibility is verified alongside Model Explorer evidence and data artifact reachability.

## Final Conditions for Merging `epic/replatform-execution` into `main`

All of the following must be true before merging:

1. Slice review ledger is complete, with reviewer/owner and evidence for every slice.
2. Final CI is clean on the merge candidate.
3. Hosted smoke checklist has a `go` verdict for the final branch state.
4. Release-candidate readiness document remains accurate.
5. Named evaluator requirement is either satisfied for pilot readiness or explicitly separated from the main merge decision by the owner.
6. No open P0 pilot or smoke finding remains.
7. P1 findings are fixed, deferred by explicit owner decision, or scoped out of the merge with evidence.
8. Accepted warnings are documented and still acceptable.
9. Unrelated untracked files are not included in the merge.
10. The final PR description explains that the branch was reviewed by slices rather than treated as an unreviewed mega-PR.

## Merge Recommendation

Do not merge `epic/replatform-execution` casually as one unreviewed change set.

Proceed toward main only after slice acceptance, hosted smoke, CI, and release-candidate claim review are complete. The final technical PR may still be a single integration PR if the review ledger clearly shows each slice was checked and accepted.
