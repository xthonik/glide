# GLIDE

Interactive easing editor for building, previewing, and sharing motion curves with multi-platform code export.

## What It Does

- Switch between `bezier`, `spring`, `bounce`, `wiggle`, and `overshoot` easing models.
- Browse preset libraries for each easing family.
- Adjust the active easing visually on the graph or numerically in the controls.
- Preview the active easing across multiple animation properties.
- Tune `duration`, `delay`, and preview sampling accuracy.
- Copy generated code for:
  - CSS
  - SwiftUI
  - UIKit
  - Core Animation
  - Jetpack Compose
  - Android View
  - Raw easing values
- Copy a shareable URL that preserves the current easing configuration in query params.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5 in strict mode
- Tailwind CSS v4
- ESLint flat config with `eslint-config-next`
- Vitest

## Getting Started

```bash
npm install
npm run dev
```

The local app runs at `http://localhost:3000`.

## Scripts

```bash
npm run dev       # Start the local dev server
npm run build     # Production build
npm start         # Start the production server
npm run lint      # Run ESLint
npm run lint:fix  # Run ESLint with autofix
npm test          # Run Vitest
```

## How State Works

`src/hooks/useCurveState.ts` is the single source of truth for:

- easing definition
- animation `duration`
- animation `delay`
- sampling `accuracy`

The hook keeps this state in sync with the URL using a 300ms debounce, so the current configuration can be shared or restored on reload.

Query params:

- `type` for the active easing family
- `d` for duration
- `dl` for delay
- `accuracy` for preview sampling
- type-specific params such as `x1`/`y1`/`x2`/`y2`, `springPreset`, `bouncePreset`, `wigglePreset`, and `overshootDirection`

## Architecture

- `src/app/page.tsx`
  - Owns the page layout and wires the feature modules together.
- `src/components/curve-editor/*`
  - Graph, dragging, and numeric controls.
- `src/components/presets/*`
  - Curve type selector and preset selection UI.
- `src/components/preview/*`
  - Motion preview surface and property toggles.
- `src/components/code-output/*`
  - Platform tabs and generated snippet output.
- `src/lib/easing.ts`
  - Easing presets, defaults, sanitization, and sampling helpers.
- `src/lib/bezier.ts`
  - Bezier math and SVG path generation helpers.
- `src/lib/code-templates.ts`
  - Per-platform code generators.
- `src/lib/url.ts`
  - URL encoding/decoding for shared state.

## Deployment

GitHub Pages deployment is wired through `.github/workflows/deploy-pages.yml`. Production builds use `GITHUB_PAGES=true` to enable static export, `basePath`, and `assetPrefix` in `next.config.ts`.

## Notes

- X control points are clamped to `[0, 1]` to match CSS cubic-bezier requirements.
- Y control points remain unclamped, so overshoot-style curves are supported.
- `npm test`, `npm run lint`, and `npm run build` all pass on the current `main` branch state.
