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

## Monorepo layout

```
/                  the 3D search app (Vite + React + Three.js)  → :3000
  src/             main.tsx · App.tsx · store.ts · actions.ts · types.ts
    lib/           layout.ts · llm.ts · prompts.ts · walrus.ts
    components/    PhotoViz · PhotoNode · MomentPanel · Sidebar · WalrusLog
  server/          memwalApi.ts — Vite dev API (/api/notes, /api/agent, /api/search)
  public/moments.json · scripts/gen-moments.mjs
landing/           the marketing landing page (Next.js + Tailwind)  → :3001
```

The landing's "Explore the memories" CTA opens the app; the app header links
back to the landing. Wire them with `NEXT_PUBLIC_APP_URL` (landing) and
`VITE_LANDING_URL` (app).

## Run locally

**App (3D search):**
1. `npm install`
2. Set `ACCOUNT_ID`, `DEFAULT_DELEGATE_KEY`, `OPENROUTER_API_KEY` in `.env.local`
3. `npm run dev` → http://localhost:3000

**Landing:**
1. `cd landing && npm install`
2. `PORT=3001 npm run dev` → http://localhost:3001

Other scripts: `npm run typecheck`, `npm run build`, `npm run gen:moments`.

## Roadmap

- **Phase 1 (done):** WC2026 re-theme, clean TS codebase, moments + community notes (local).
- **Phase 2:** publish moments + notes to Walrus Mainnet (public blobs), read via aggregator.
- **Phase 3:** agent recall/roast over the community memory.
