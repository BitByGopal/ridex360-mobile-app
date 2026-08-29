# RideX360 Mobile App

Expo + React Native + TypeScript app implementing the **Parent** and **Driver** sides of RideX360's core transportation loop, talking to the real [`ridex360-backend`](../ridex360-backend) API — no mock data.

## What's implemented

- **JWT login** against the Django backend, with token persistence (`AsyncStorage`) and automatic refresh on expiry
- **Role-based routing**: after login, `/api/me/` decides whether you land in the Parent flow or the Driver flow — same app, same login screen, different experience, matching the brief's role-based account model
- **Parent flow**:
  - Children list (passengers you're a guardian of)
  - Per-child trip screen: vehicle, live ETA to the next stop, full stop-by-stop status, and the **Mark Absent** action — which calls the real backend recalculation endpoint, not a local toggle
  - Polls the backend every 8s for live updates (see note on WebSockets below)
- **Driver flow**:
  - Today's trip, with Start Trip / Complete Trip actions
  - **Live GPS broadcasting**: once a trip is active, the app requests location permission and posts a GPS ping to the backend every 10s using `expo-location`
  - Passenger list with Board / Drop-off actions per passenger, and passengers marked absent by their parent show as visually removed automatically
- **Live map** (`src/components/TripMap.tsx`): both Parent and Driver trip screens now render an actual `MapView` — route stops as pins (color-coded by status: pending/arrived/skipped), the route line, and the vehicle's live position when available. Auto-fits to the route's stops, no per-deployment tuning needed.

> **Maps in production:** Expo Go supplies a development Google Maps key automatically on Android, so this works out of the box for testing. Before building a standalone app (EAS Build) for real distribution, you'll need your own Google Maps API key added under `android.config.googleMaps.apiKey` in `app.json` — see [Expo's react-native-maps docs](https://docs.expo.dev/versions/latest/sdk/map-view/) when you get there.

## Design system

Reuses the same palette, type scale, and card/pill styling as the RideX360 web prototype (`src/theme/index.ts`) — deep plum, mauve, dusty rose, warm beige, soft cream — so the mobile app feels like the same product, not a separate one.

## Tech stack

- Expo SDK 54 (managed workflow) + TypeScript — pinned deliberately to match the current Expo Go app on the Play Store. If `npx expo start` ever reports an Expo Go incompatibility again, it means Expo Go has moved to a newer SDK than this project — run `npx expo install --fix` to re-align, or ask about bumping the SDK version.
- React Navigation (native-stack)
- `@react-native-async-storage/async-storage` for token persistence
- `expo-location` for foreground GPS
- `react-native-maps` installed and ready for a live map view (not yet wired into a screen — see Next steps)

## Project structure

```
ridex360-mobile-app/
├── App.tsx                          # Entry point: providers + navigation
├── src/
│   ├── api/
│   │   ├── client.ts                 # Fetch wrapper: JWT attach, auto-refresh, typed errors
│   │   └── endpoints.ts              # One typed function per backend endpoint
│   ├── context/AuthContext.tsx       # Login/session state, available app-wide via useAuth()
│   ├── navigation/
│   │   ├── RootNavigator.tsx         # Chooses Login / Parent / Driver based on role
│   │   └── ParentNavigator.tsx       # Parent's stack: children list → child trip detail
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── parent/ChildrenListScreen.tsx
│   │   ├── parent/ChildTripScreen.tsx
│   │   └── driver/DriverTripScreen.tsx
│   ├── theme/index.ts                # Shared colors/spacing/radius tokens
│   └── types/index.ts                # TypeScript types matching the Django serializers exactly
```

## Getting started

**1. Get the backend running first** — see `ridex360-backend/README.md`. You need it running and reachable from your phone/emulator before this app is useful.

**2. Point the app at your backend.** Open `src/api/client.ts` and set `API_BASE_URL`:

- **Physical phone via Expo Go** (recommended — easiest path on Windows): use your computer's LAN IP, e.g. `http://192.168.1.42:8000/api`. Find your IP with `ipconfig` (Windows) — look for IPv4 Address under your Wi-Fi adapter. Your phone and computer must be on the same Wi-Fi network. Also run the Django server with `python manage.py runserver 0.0.0.0:8000` (not just `runserver`) so it accepts connections from other devices on the network.
- **Android emulator**: use `http://10.0.2.2:8000/api`.
- **iOS simulator (Mac only)**: `http://localhost:8000/api` works as-is.

**3. Install and run:**

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (install it from the Play Store/App Store first). The app should open with the RideX360 login screen.

**Demo accounts** (from the backend's `seed_demo` command, password `ridex360demo` for all):
- Driver: `driver1`
- Parents: `parent1` through `parent5`

## Trying the core loop on two devices

This is the demo moment worth showing anyone you pitch to:

1. Log in as `parent1` on one phone (or the Expo web preview) → open Aarav Mehta's trip.
2. Log in as `driver1` on a second device → Start Trip.
3. On the parent's screen, tap **Mark Absent** for a child. Since the seed data has two children per stop for Stop 1, mark absent both `parent1` (Aarav) and `parent2` (Diya) to see Stop 1 flip to "skipped."
4. Refresh (or wait ~8s for the poll) on the driver's screen — the stop shows as skipped and that passenger shows as removed, live.

## What's intentionally deferred

Matches the backend's scope notes — this is a 3-month solo MVP, not the full production brief:

- **Polling, not WebSockets** — both the parent (8s) and driver GPS (10s) screens poll on an interval rather than using Django Channels/Redis. Simple to build and reason about solo; swappable for real push later without changing screen logic.
- **No live map view yet** — `react-native-maps` is installed, but the trip screens currently show stop-list + ETA rather than a rendered map. Wiring an actual `<MapView>` with the vehicle marker is the natural next increment.
- **Foreground GPS only** — the driver app broadcasts location only while the app is open and active, per Expo's simpler permission model. Background tracking is a later, more involved addition (see backend README).
- **No push notifications** — Firebase Cloud Messaging integration comes after the core loop is validated with a real pilot.
- **No Organization/Admin mobile screens** — Django Admin is the V1 org dashboard (see backend).

## Next steps (per the roadmap)

This completes the mobile half of Weeks 5–9. Next: wire an actual `<MapView>` with a live vehicle marker into the Track screens (the visual "where's the bus" moment), then move into Weeks 10–12 — deploying the backend and testing the whole thing with your actual Meridian contact on real devices.
