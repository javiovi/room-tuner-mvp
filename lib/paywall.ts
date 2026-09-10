/**
 * Single switch for the freemium layer.
 *
 * The paywall is dormant while the app is in open testing: every visitor gets the full
 * report, the PDF, and a landing page with no locked tier on it. The gating code stays
 * in place behind this flag — report tabs (`app/resultado/page.tsx`), the budget teaser,
 * the PDF button, and the landing's pricing section — so turning it back on is one env
 * var, not a rewrite.
 *
 * Set NEXT_PUBLIC_PAYWALL=true once the paid tiers and the payment flow exist. It's a
 * NEXT_PUBLIC_ var, so it's inlined at build time: changing it needs a rebuild/redeploy.
 */
export const PAYWALL_ENABLED = process.env.NEXT_PUBLIC_PAYWALL === "true"
