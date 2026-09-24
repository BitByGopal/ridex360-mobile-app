import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

import { Api } from "../api/endpoints";
import { ApiError } from "../api/client";
import { Trip } from "../types";

const GPS_INTERVAL_MS = 10000;

interface DriverTripContextValue {
  trip: Trip | null;
  loading: boolean;
  busy: boolean;
  gpsError: string | null;
  reload: () => Promise<void>;
  startTrip: () => Promise<void>;
  completeTrip: () => Promise<{ ok: true } | { ok: false; message: string }>;
  boardPassenger: (tripPassengerId: string) => Promise<void>;
  dropOffPassenger: (tripPassengerId: string) => Promise<void>;
  detectTraffic: () => Promise<void>;
  useAlternateRoute: () => Promise<void>;
  clearTraffic: () => Promise<void>;
}

const DriverTripContext = createContext<DriverTripContextValue | undefined>(undefined);

/**
 * Owns the driver's trip state, action handlers, and the GPS-pinging
 * interval, all in ONE place above the Driver tab navigator -- not
 * inside any individual tab screen. This is what lets GPS pings and
 * trip data keep updating no matter which of Home/Route/Passengers/
 * More the driver is currently looking at, since tab screens mount
 * and unmount independently but this provider does not.
 */
export function DriverTripProvider({ children }: { children: React.ReactNode }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const gpsTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(async () => {
    try {
      const trips = await Api.myTripsToday();
      setTrip(trips[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // GPS pinging -- lives here, not in a screen, so switching tabs
  // never interrupts it.
  useEffect(() => {
    if (trip?.status !== "active") {
      if (gpsTimer.current) clearInterval(gpsTimer.current);
      return;
    }

    async function sendPing() {
      if (!trip) return;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setGpsError("Location permission not granted.");
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const updated = await Api.sendGpsPing(
          trip.id,
          Number(pos.coords.latitude.toFixed(6)),
          Number(pos.coords.longitude.toFixed(6)),
        );
        setTrip(updated);
        setGpsError(null);
      } catch (e) {
        setGpsError(e instanceof Error ? e.message : "Couldn't get GPS location.");
      }
    }

    sendPing();
    gpsTimer.current = setInterval(sendPing, GPS_INTERVAL_MS);
    return () => { if (gpsTimer.current) clearInterval(gpsTimer.current); };
  }, [trip?.status, trip?.id]);

  async function startTrip() {
    if (!trip) return;
    setBusy(true);
    try {
      setTrip(await Api.startTrip(trip.id));
    } finally {
      setBusy(false);
    }
  }

  async function completeTrip(): Promise<{ ok: true } | { ok: false; message: string }> {
    if (!trip) return { ok: false, message: "No trip loaded." };
    setBusy(true);
    try {
      setTrip(await Api.completeTrip(trip.id));
      return { ok: true };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Couldn't complete the trip.";
      return { ok: false, message };
    } finally {
      setBusy(false);
    }
  }

  async function boardPassenger(tripPassengerId: string) {
    if (!trip) return;
    setTrip(await Api.markPassengerBoarded(trip.id, tripPassengerId));
  }

  async function dropOffPassenger(tripPassengerId: string) {
    if (!trip) return;
    setTrip(await Api.markPassengerDroppedOff(trip.id, tripPassengerId));
  }

  async function detectTraffic() {
    if (!trip) return;
    setTrip(await Api.detectTraffic(trip.id));
  }

  async function useAlternateRoute() {
    if (!trip) return;
    setTrip(await Api.useAlternateRoute(trip.id));
  }

  async function clearTraffic() {
    if (!trip) return;
    setTrip(await Api.clearTraffic(trip.id));
  }

  return (
    <DriverTripContext.Provider
      value={{
        trip, loading, busy, gpsError, reload,
        startTrip, completeTrip, boardPassenger, dropOffPassenger,
        detectTraffic, useAlternateRoute, clearTraffic,
      }}
    >
      {children}
    </DriverTripContext.Provider>
  );
}

export function useDriverTrip() {
  const ctx = useContext(DriverTripContext);
  if (!ctx) throw new Error("useDriverTrip must be used within DriverTripProvider");
  return ctx;
}