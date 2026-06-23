export const features = {
  smoothScroll: true,
} as const;

/**
 * Where the "Explore the memories" CTAs point — the 3D Walrus Memory app.
 * Override at build time with NEXT_PUBLIC_APP_URL (e.g. the deployed URL).
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
