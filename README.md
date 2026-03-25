# Easing Tool

Interactive cubic-bezier editor for building, previewing, and sharing easing curves with multi-platform code export.

## What It Does

- Browse a preset library of standard and custom easing curves.
- Adjust cubic-bezier control points visually on the graph or numerically.
- Preview the curve across multiple animation properties.
- Tune both `duration` and `delay`.
- Copy generated code for:
  - CSS
  - SwiftUI
  - UIKit
  - Core Animation
  - Jetpack Compose
  - Android View
  - Raw cubic-bezier values
- Copy a shareable URL that preserves the current curve, duration, and delay in query params.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5 in strict mode
- Tailwind CSS v4
- ESLint flat config with `eslint-config-next`

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
```

## How State Works

`src/hooks/useCurveState.ts` is the single source of truth for:

- cubic-bezier control points: `x1`, `y1`, `x2`, `y2`
- animation `duration`
- animation `delay`

The hook keeps this state in sync with the URL using a 300ms debounce, so the current configuration can be shared or restored on reload.

Query params:

- `x1`, `y1`, `x2`, `y2`
- `d` for duration
- `dl` for delay

## Architecture

- `src/app/page.tsx`
  - Owns the page layout and wires the feature modules together.
- `src/components/curve-editor/*`
  - Graph, dragging, numeric controls, and timing inputs.
- `src/components/presets/*`
  - Preset filtering and selection UI.
- `src/components/preview/*`
  - Motion preview surface and property toggles.
- `src/components/code-output/*`
  - Platform tabs and generated snippet output.
- `src/lib/bezier.ts`
  - Bezier math, SVG path generation, sampling, and formatting helpers.
- `src/lib/code-templates.ts`
  - Per-platform code generators.
- `src/lib/url.ts`
  - URL encoding/decoding for shared state.

## Notes

- X control points are clamped to `[0, 1]` to match CSS cubic-bezier requirements.
- Y control points are intentionally unclamped, so overshoot-style curves are supported.
- No automated test suite is configured in this repository yet.
