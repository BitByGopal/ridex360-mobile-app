/**
 * RideX360 brand system — navy/charcoal + emerald green, per the
 * official brand reference. Token NAMES are kept identical to the
 * previous plum/mauve system on purpose: every existing screen
 * references these names, so changing only the values re-themes the
 * whole app without touching Parent, Driver, TripMap, or SOSButton.
 */
export const colors = {
  plum: "#0F172A",      // primary heading/dark color (was dark plum, now navy)
  mauve: "#15803D",     // secondary dark accent (was mauve, now deep green)
  rose: "#16A34A",      // primary accent -- eyebrows, links, active states
  roseLight: "#22C55E", // brighter green -- pending indicators, live markers
  beige: "#DCFCE7",     // light green tint -- icon backgrounds, avatars
  cream: "#F8FAFC",     // app background -- near-white
  card: "#FFFFFF",
  line: "#E2E8F0",
  ink: "#0F172A",
  inkSoft: "#475569",
  inkFaint: "#94A3B8",
  good: "#16A34A",
  goodSoft: "#DCFCE7",
  warn: "#D97706",
  warnSoft: "#FEF3C7",
  alert: "#DC2626",
  alertSoft: "#FEE2E2",
};

export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 28 };
export const radius = { sm: 12, md: 16, lg: 22, pill: 999 };