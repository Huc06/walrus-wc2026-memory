# AI App — Cortex

A premium, minimal **AI mobile-app landing page** built with Next.js 16, React 19, Tailwind CSS v4, and TypeScript. Cortex is a fictional hyperreal photo & video generation app, and the page is built around scroll-driven set pieces — a WebGL orbit field of image tiles behind the hero, a video showcase that grows out of the hero as you scroll, a pinned phone walkthrough, a velocity-reactive gallery marquee, scroll-scrubbed integration rows, and parallax testimonial columns — all theme-aware, accessible, and reduced-motion friendly.

## Features

- ✅ **Next.js 16+** with App Router (fully static-prerendered)
- ✅ **React 19** + **TypeScript** (strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- ✅ **Tailwind CSS v4** with CSS-variable design tokens
- ✅ **Dark Mode** via next-themes (floating bottom-right switch)
- ✅ **Smooth Scroll** via Lenis (feature-flagged, auto-disabled for reduced motion)
- ✅ **Motion** via motion/react with full reduced-motion fallbacks
- ✅ **WebGL** via React Three Fiber + three (custom SDF tile shader, scroll-reactive)
- ✅ **SEO Ready** — metadata, Open Graph image, Twitter cards, dynamic `robots` + `sitemap`
- ✅ **Accessibility** — skip link, focus rings, ARIA labels, proper heading order
- ✅ **Edge Compatible** — no Node-only APIs in runtime code

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command                | Description                  |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Start development server     |
| `npm run build`        | Build for production         |
| `npm run start`        | Start production server      |
| `npm run lint`         | Run ESLint                   |
| `npm run lint:fix`     | Fix ESLint errors            |
| `npm run format`       | Format code with Prettier    |
| `npm run format:check` | Check code formatting        |
| `npm run typecheck`    | Run TypeScript type checking |

## Page Sections

The landing page (`app/page.tsx`) is composed top to bottom from:

| Section            | Component              | Highlights                                                                                                   |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Nav**            | `nav/nav.tsx`, `nav/*` | Expanding pill menu with morphing label, scroll-progress readout, intro-aware reveal                         |
| **Hero**           | `hero.tsx`             | WebGL orbit field of image tiles (custom SDF shader), scroll-velocity spin boost, intro loader with progress |
| **Video showcase** | `video-showcase.tsx`   | Video peeks from under the hero and expands to section width on scroll; autoplay gated by visibility         |
| **Manifesto**      | `manifesto.tsx`        | Scroll-scrubbed word-by-word statement reveal                                                                |
| **Features**       | `features.tsx`         | Full-bleed hover list with cursor-following, velocity-tilting image preview                                  |
| **App showcase**   | `app-showcase.tsx`     | Pinned phone mock; scroll scrubs deterministically through three app screens                                 |
| **Gallery**        | `gallery.tsx`          | Infinite marquee rows that react to scroll velocity, seamless at any viewport width                          |
| **Integrations**   | `integrations.tsx`     | Scroll-scrubbed pill rows sliding in opposite directions                                                     |
| **Testimonials**   | `testimonials.tsx`     | Three parallax quote columns drifting at different rates                                                     |
| **Pricing**        | `pricing.tsx`          | Monthly/yearly toggle with sliding indicator + rolling price digits                                          |
| **FAQ**            | `faq.tsx`              | Accordion with animated height and rotating plus icon                                                        |
| **Final CTA**      | `final-cta.tsx`        | Fanned photo prints, word-by-word masked headline, magnetic CTA button                                       |
| **Footer**         | `footer.tsx`           | Link columns + oversized clipped wordmark                                                                    |

## Signature Components

Reusable building blocks that define the template's look and feel:

- **`section-heading.tsx`** — shared section heading (title + optional description, left or centered) with an in-view reveal; sections deliberately have no eyebrow/kicker labels.
- **`magnetic-link.tsx`** — spring-based magnetic CTA used in the hero and final CTA; mouse-only and inert under reduced motion.
- **`hero.tsx` (OrbitField)** — orthographic R3F scene rendering rings of rounded image tiles via a single SDF shader (anti-aliased edge, 1px token-driven border, radial center fade, bottom dissolve), with per-ring lag so scroll ripples through the rows.
- **`video-showcase.tsx`** — scroll-driven expansion from a fixed-size "peek" to full section width, with IntersectionObserver + progress-gated autoplay and a static, controls-enabled player under reduced motion.
- **`nav/`** — self-contained nav kit: expanding menu pill (`nav.tsx`), morphing Menu/Close label (`morph-label.tsx`), animated hamburger (`menu-icon.tsx`), scroll percent readout (`scroll-progress.tsx`), and logo (`logo.tsx`).

## Project Structure

```
├── app/
│   ├── globals.css        # Design tokens, dark variant, base styles
│   ├── layout.tsx         # Root layout, fonts, providers, theme switch
│   ├── page.tsx           # Landing page composition
│   ├── robots.ts          # Dynamic robots.txt
│   ├── sitemap.ts         # Dynamic sitemap
│   ├── favicon.ico        # Favicon (ICO)
│   ├── icon.svg           # Favicon (SVG, Cortex mark)
│   └── apple-icon.svg     # Apple touch icon
├── components/
│   ├── nav/                                    # Nav kit (pill menu, logo, …)
│   ├── hero.tsx                                # WebGL orbit field + intro loader
│   ├── video-showcase.tsx                      # Scroll-expanding film
│   ├── manifesto.tsx, features.tsx             # Statement + hover list
│   ├── app-showcase.tsx                        # Pinned phone walkthrough
│   ├── gallery.tsx, integrations.tsx           # Marquee + scrubbed pill rows
│   ├── testimonials.tsx                        # Parallax quote columns
│   ├── pricing.tsx, faq.tsx, final-cta.tsx     # Conversion
│   ├── footer.tsx                              # Footer
│   ├── section-heading.tsx, magnetic-link.tsx  # Shared UI primitives
│   └── providers.tsx, theme-switch.tsx,        # App shell
│       smooth-scroll.tsx, skip-to-content.tsx
├── lib/
│   ├── config.ts          # Feature flags (smooth scroll)
│   ├── intro.ts           # Intro-loader completion store (nav/theme reveal)
│   ├── metadata.ts        # SEO metadata utilities & site config
│   ├── motion.tsx         # Motion components, hooks & reduced-motion provider
│   └── utils.ts           # Helpers
└── public/
    ├── logo.svg           # Cortex mark (source asset)
    ├── og-image.png       # Open Graph image (1200×630)
    └── site.webmanifest   # PWA manifest
```

## Customization

### 1. Update Site Configuration

Edit `lib/metadata.ts` to update:

- Site name, description, and URL
- Social media handle (`creator`)
- Keywords and authors

### 2. Toggle Features

Edit `lib/config.ts`:

```ts
export const features = {
  smoothScroll: true, // Lenis; falls back to native smooth scroll when false
} as const;
```

### 3. Customize Design Tokens

Edit `app/globals.css` to modify the palette (`--background`, `--foreground`, `--muted`, `--border`, `--ring`) and the inverted panel tokens (`--surface` / `--surface-foreground`) used by the dark nav pill, highlighted pricing tier, and final CTA panel. Dark mode overrides live under `.dark`.

### 4. Swap Content & Assets

- Section copy lives as typed const arrays at the top of each component (`FEATURES`, `TIERS`, `TESTIMONIALS`, `FAQS`, `ROW_A`/`ROW_B`, …).
- Hero tile images are remote URLs in `HERO_IMAGES` (`components/hero.tsx`) — they're loaded as WebGL textures, so your replacements **must be served with CORS enabled**.
- Gallery, testimonial, and final-CTA imagery are plain remote URLs (swap for your own or move into `public/`).
- The showcase film is set via `VIDEO_SRC` / `VIDEO_POSTER` in `components/video-showcase.tsx`.
- Replace placeholder links: the nav/footer legal, company, and social links (`#privacy`, `#instagram`, …) and the FAQ `hello@example.com` address.
- Replace `app/icon.svg`, `app/apple-icon.svg`, `app/favicon.ico`, `public/logo.svg`, and `public/og-image.png` with your brand assets.

### 5. Add Routes

```tsx
// app/about/page.tsx
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createMetadata({
  title: "About Us",
  description: "Learn more about our company.",
  path: "/about",
});

export default function AboutPage() {
  return <main id="main-content">...</main>;
}
```

## Design Tokens

The template uses CSS custom properties for theming, driven off a `.dark` class (`app/globals.css`):

### Colors

- `--background` / `--foreground` — Page background and text
- `--muted` / `--muted-foreground` — Subtle backgrounds and secondary text
- `--border` / `--ring` — Borders and focus rings
- `--surface` / `--surface-foreground` — Inverted panels (nav pill, highlighted pricing tier, final CTA), consumed via inline styles

### Typography

- `--font-sans` — Geist Sans (UI and display)
- `--font-mono` — Geist Mono (step numbers, prompt strings, microtext)

## Accessibility

The template includes:

- Skip-to-content link
- Visible focus rings (keyboard navigation)
- ARIA labels on interactive and decorative elements
- Reduced-motion support across every animation (WebGL hero, scroll scenes, marquees, Lenis) with static fallbacks
- Native video controls for reduced-motion users in the showcase film
- Proper heading hierarchy
- WCAG 2.1 AA contrast targets

## Edge Runtime

All code is Edge-compatible. No Node.js-only APIs are used in runtime code. The template can be deployed to:

- Vercel Edge Functions
- Cloudflare Workers
- Any edge-capable platform

## License

Commercial license. This template is licensed, for use in unlimited
personal and commercial projects by the purchaser. You may not resell,
redistribute, or sublicense the template itself. See [LICENSE](./LICENSE) for
the full terms.
