# Policy UI (Replatform MVP)

This app is the React/Vite policy workspace for the Uzbekistan Economic Policy Engine replatform.
It follows the in-repo `spec.html` and `uzbekistan_policy_engine_frontend_reimagining_spec.md`
direction: task-first navigation, calm institutional UI, visible model attribution, interpretation
alongside charts, caveats, and comparison as a central workflow.

## Current scope

- React 19 + TypeScript + Vite foundation
- App shell with unified navigation across Overview, Scenario Lab, Comparison, Model Explorer, Knowledge Hub
- i18n (EN/RU/UZ) via react-i18next
- ChartRenderer (Recharts) with semantic role colors and uncertainty-band rendering
- Typed data contract (`src/contracts/data-contract.ts`) covering HeadlineMetric, ChartSpec, NarrativeBlock (with TB-P3 generation_mode), ModelAttribution, Caveat, ApiError
- Per-page raw → guard → adapter → source → client data pipeline with `VITE_*_DATA_MODE=mock|live` switching
- QPM live-data bridge consuming `public/data/qpm.json` (refreshed nightly via GitHub Actions)
- localStorage-backed scenario store (`policy-ui:scenario.v2:*`) with full run-snapshot persistence including TB-P3 governance metadata
- Scenario Lab run/save/load flow with deterministic fallback results, stale-edit save protection, guarded localStorage reads, and preset hydration from URL query parameters
- Comparison workflow for 2-4 scenarios with baseline deltas, KPI cards, comparative charts, trade-off summary, and empty-state guidance for saved scenarios
- Model Explorer metadata for all six MVP model families: QPM, DFM, PE, IO, CGE, FPP
- Knowledge Hub MVP with reform tracker, research briefs, reference index, model/reform tags, and EN/RU/UZ translation keys
- Accessibility defaults: skip-link, aria-live on loading/error states, aria-labelledby on sections, `:focus-visible` rings
- Test harness: Node test runner, 116 tests covering adapters, guards, store round-trip, governance metadata round-trip, comparison mapping, localStorage failure handling, preset hydration, and model metadata coverage

## Structure

- `src/app/` routing and shell layout
- `src/components/layout/` shared page layout primitives
- `src/components/system/` global utility components
- `src/pages/` route-level page scaffolds
- `src/state/` global UI state placeholders
- `src/styles/` tokens and base styles
- `src/data/mock/` typed mock data placeholders

## Run

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run lint
npm run build
npm run test
```

## Notes

- The old frontend is intentionally untouched.
- QPM and DFM have selective live bridge coverage. PE/IO/CGE/FPP are represented in the MVP metadata layer and should follow the same bridge pattern (R solver → nightly JSON → consumer contract → frontend alignment).
- Knowledge Hub content is seed research/reference content for the MVP. It is deliberately tagged and filterable, but it is not yet a live policy-document ingestion pipeline.
