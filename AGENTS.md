# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000, uses local webpack)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint via Next.js
```

No test suite is configured.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict)
- **Tailwind CSS v4** via PostCSS
- Path alias: `@/*` → `./src/*`

## Architecture

### State & URL Sync

`src/hooks/useCurveState.ts` is the single source of truth. It holds the `BezierCurve` (x1/y1/x2/y2) and `duration` (ms), syncing both to URL query params with a 300ms debounce. All components receive state from `page.tsx`, which consumes this hook.

### Core Math

`src/lib/bezier.ts` implements:
- SVG path generation (Y-axis is flipped: SVG increases downward, math increases upward)
- Cubic bezier solver via Newton's method to find Y given X
- X values are clamped to [0,1]; Y is unclamped (allows overshoot)
- 100-point curve sampling used by both the preview and graph

### Component Structure

`page.tsx` owns the layout and passes state down:
- `src/components/curve-editor/` — interactive SVG graph + draggable control points + numeric inputs
- `src/components/presets/` — preset grid and curve type selector
- `src/components/preview/` — animation preview demoing 10 CSS properties simultaneously
- `src/components/code-output/` — platform tabs with generated code snippets

### Drag System

`useDrag.ts` uses PointerEvents with `setPointerCapture` for reliable tracking. Coordinates transform from screen space to SVG space via `getScreenCTM()`, then Y is inverted for math coordinates.

### Code Generation

`src/lib/code-templates.ts` generates platform-specific snippets for: CSS, SwiftUI, UIKit, Core Animation, Compose, Android View, and Raw values. Each platform function takes `(BezierCurve, duration)` and returns a formatted string.

### Design Tokens

Dark theme defined in `src/app/globals.css` as CSS variables. Key values: bg `#080808`, surface `#111113`, accent `#1a7beb`, text `#e5e5e5`. Font stack: Golos Text (sans) + JetBrains Mono (mono) from Google Fonts.
