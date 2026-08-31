/**
 * Formats an ISO datetime string as a clock time, e.g. "8:15 AM".
 * Used for scheduled_arrival_at / live_arrival_at from the backend --
 * both are absolute times, so the app never computes its own clock
 * time from raw minutes (per the product spec: ETA is a backend
 * service, not hardcoded in the client).
 */
export function formatClockTime(iso: string | null): string {
  if (!iso) return "--";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * Turns a delay in minutes into a short display string.
 * Small delays/early arrivals (within +/-2 min) are treated as
 * "on time" rather than flagged, since haversine-based ETA has enough
 * natural noise that a 1-2 min swing isn't a meaningful delay.
 */
export function formatDelay(delayMinutes: number | null): { label: string; isDelayed: boolean } {
  if (delayMinutes == null) return { label: "", isDelayed: false };
  if (delayMinutes > 2) return { label: `${delayMinutes} min delay`, isDelayed: true };
  if (delayMinutes < -2) return { label: `${Math.abs(delayMinutes)} min early`, isDelayed: false };
  return { label: "On schedule", isDelayed: false };
}