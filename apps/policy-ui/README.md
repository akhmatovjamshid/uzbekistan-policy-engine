# Policy UI (Replatform Shell)

This app is the new frontend shell for the Uzbekistan Economic Policy Engine replatform.

## Current Scope

- React + TypeScript + Vite foundation
- App shell with unified navigation
- Route scaffolds for:
  - Overview
  - Scenario Lab
  - Comparison
  - Model Explorer
  - Knowledge Hub
- Minimal design token and base style system
- Global language-state placeholder (`EN`, `RU`, `UZ`)
- Placeholder page/layout primitives

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
npm install
npm run dev
```

## Notes

- The old frontend is intentionally untouched.
- Real model integrations are deferred until contract and component baselines are approved.
