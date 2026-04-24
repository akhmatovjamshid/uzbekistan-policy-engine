# Replatform MVP Handoff

## Scope Completed

- Overview remains the monitoring entry point with model attribution, data vintage, risks, caveats, quick actions, and saved-scenario feed.
- Scenario Lab supports preset hydration, deterministic fallback runs, plain-language assumptions, run results, interpretation, caveats, save/load/delete, stale-edit save protection, and localStorage failure guards.
- Comparison supports a 2-4 scenario workflow with a selected baseline, KPI cards, delta table, comparative charts, trade-off summary, and an empty state that directs users back to Scenario Lab.
- Model Explorer includes all six model families: QPM, DFM, PE, IO, CGE, and FPP, each with purpose, status, outputs via summary/detail, assumptions, methodology/equations, parameters where available, data sources, and caveats.
- Knowledge Hub is implemented as an MVP research layer with reform tracker, research briefs, literature/reference index, model/reform tags, filters, tabs, and EN/RU/UZ keys.
- The legacy app and generated data artifacts are preserved.

## Verification

Run from `apps/policy-ui`:

```bash
npm ci
npm run lint
npm run build
npm run test
```

Latest local results:

- `npm ci` passed after stopping the old local Vite server that had locked `node_modules`.
- `npm run lint` passed.
- `npm run build` passed. Vite reports the existing large bundle warning for a 932 kB minified JS chunk.
- `npm run test` passed: 116 tests.

## Limitations

- Knowledge Hub content is curated seed content, not live ingestion from lex.uz, literature APIs, or internal document systems.
- PE, IO, CGE, and FPP are represented in the MVP workspace metadata; they are not yet live solver bridges.
- Export/share/search/help utilities remain future global utilities from the reimagining spec.
- Bundle splitting is still recommended before production hardening.

## Recommended Next Tasks

- Add route-level code splitting for Recharts-heavy pages.
- Build live bridge contracts for PE, IO, CGE, and FPP.
- Replace the saved-scenario delete confirmation with a non-blocking inline confirmation pattern.
- Expand Knowledge Hub data from governed internal sources and add source URLs/review status per item.
