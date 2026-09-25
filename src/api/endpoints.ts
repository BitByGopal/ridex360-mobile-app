import { apiRequest } from "./client";
import { Me, Passenger, Trip, OrgDashboardMetrics, FleetTrip } from "../types";

export const Api = {
  me: () => apiRequest<Me>("/me/"),

  // Parent
  myChildren: () => apiRequest<Passenger[]>("/parent/children/"),
  childToday: (passengerId: string) =>
    apiRequest<Trip>(`/parent/children/${passengerId}/today/`),
  markAbsent: (passengerId: string) =>
    apiRequest<Trip>(`/parent/children/${passengerId}/mark-absent/`, { method: "POST" }),

  // Driver
  myTripsToday: () => apiRequest<Trip[]>("/driver/trips/today/"),
  startTrip: (tripId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/start/`, { method: "POST" }),
  completeTrip: (tripId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/complete/`, { method: "POST" }),
  sendGpsPing: (tripId: string, latitude: number, longitude: number) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/gps/`, {
      method: "POST",
      body: { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) },
    }),
  markStopArrived: (tripId: string, tripStopId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/stops/${tripStopId}/arrived/`, { method: "POST" }),
  markPassengerBoarded: (tripId: string, tripPassengerId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/passengers/${tripPassengerId}/boarded/`, { method: "POST" }),
  markPassengerDroppedOff: (tripId: string, tripPassengerId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/passengers/${tripPassengerId}/dropped-off/`, { method: "POST" }),
  markPassengerNoShow: (tripId: string, tripPassengerId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/passengers/${tripPassengerId}/no-show/`, { method: "POST" }),
  // Traffic / alternate route
  detectTraffic: (tripId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/traffic/detect/`, { method: "POST" }),
  useAlternateRoute: (tripId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/traffic/use-alternate/`, { method: "POST" }),
  clearTraffic: (tripId: string) =>
    apiRequest<Trip>(`/driver/trips/${tripId}/traffic/clear/`, { method: "POST" }),

  orgDashboard: () => apiRequest<OrgDashboardMetrics>("/org/dashboard/"),
  orgLiveFleet: () => apiRequest<FleetTrip[]>("/org/fleet/live/"),

};
