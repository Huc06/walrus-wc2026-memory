# Walrus Memory · World Cup 2026

A 3D, explorable memory of the World Cup 2026's iconic moments — each node is a
curated moment (admin layer), and anyone can attach their own memories/notes to
it (community layer). Memory is meant to live publicly on **Walrus Mainnet**.

Built on the "Thinking Space" 3D visualization (React 19 + Vite + Three.js /
@react-three/fiber + drei + zustand), re-themed and restructured as a clean
TypeScript project.

## Features

- 🌐 3D sphere / grid layout of moments, trackball-orbit + idle auto-rotate
- 🎥 Camera fly-to on select, with a detail panel per moment
- 🗣️ **Community memory**: add notes to any moment (Phase 2 → published to Walrus)
- 🔎 Natural-language search over moments via Gemini
- 🩻 x-ray mode to reveal titles

## Project structure

```
public/moments.json         curated WC2026 moments (generated)
scripts/gen-moments.mjs      dataset generator
src/
  main.tsx                   entry
  App.tsx                    UI shell (header, search, controls)
  store.ts                   zustand + immer state
  actions.ts                 state actions (init, query, notes, layout)
  types.ts                   shared types
  lib/    layout.ts · llm.ts · prompts.ts
  components/ PhotoViz.tsx · PhotoNode.tsx · MomentPanel.tsx · Sidebar.tsx
```

## Run locally

1. `npm install`
2. Set `GEMINI_API_KEY` in `.env.local`
3. `npm run dev` → http://localhost:3000

Other scripts: `npm run typecheck`, `npm run build`, `npm run gen:moments`.

## Roadmap

- **Phase 1 (done):** WC2026 re-theme, clean TS codebase, moments + community notes (local).
- **Phase 2:** publish moments + notes to Walrus Mainnet (public blobs), read via aggregator.
- **Phase 3:** agent recall/roast over the community memory.
