export type Role = "parent" | "driver" | "org_admin";

export interface Me {
  id: string;
  username: string;
  full_name: string;
  role: Role;
  phone: string;
  organization?: { id: string; name: string; org_type: string };
}

export interface Passenger {
  id: string;
  full_name: string;
  detail: string;
  organization: string;
  organization_type: string;
  branch: string;
  pickup_stop: string | null;
  active: boolean;
}

export interface Stop {
  id: string;
  sequence: number;
  name: string;
  latitude: string;
  longitude: string;
}

export type TripStopStatus = "pending" | "approaching" | "arrived" | "skipped";

export interface TripStop {
  id: string;
  stop: Stop;
  status: TripStopStatus;
  arrived_at: string | null;
  eta_minutes: number | null;
  scheduled_arrival_at: string | null;
  live_arrival_at: string | null;
  delay_minutes: number | null;
}

export type TripPassengerStatus =
  | "scheduled" | "absent" | "waiting" | "boarded" | "dropped_off" | "no_show";

export interface TripPassenger {
  id: string;
  passenger: string;
  passenger_name: string;
  passenger_detail: string;
  pickup_stop_id: string | null;
  pickup_stop_name: string | null;
  status: TripPassengerStatus;
  boarded_at: string | null;
  dropped_off_at: string | null;
}

export type TripStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface Trip {
  id: string;
  route: { id: string; name: string; route_type: "morning" | "evening"; stops: Stop[] };
  date: string;
  status: TripStatus;
  vehicle: string | null;
  vehicle_label: string | null;
  driver: string | null;
  driver_name: string | null;
  is_replacement_driver: boolean;
  started_at: string | null;
  completed_at: string | null;
  last_lat: string | null;
  last_lng: string | null;
  last_ping_at: string | null;
  current_speed_kmh: number | null;
  driver_phone: string | null;
  traffic_detected: boolean;
  alt_route_active: boolean;
  trip_stops: TripStop[];
  trip_passengers: TripPassenger[];
}


export interface OrgDashboardMetrics {
  organization: { id: string; name: string; org_type: string };
  total_vehicles: number;
  active_vehicles: number;
  total_drivers: number;
  active_drivers: number;
  total_passengers: number;
  total_parents: number;
  total_employees: number;
  active_routes: number;
  todays_trips: number;
  active_alerts: number;
}

export type FleetTripStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface FleetTrip {
  trip_id: string;
  vehicle_label: string | null;
  driver_name: string | null;
  route_name: string;
  route_type: "morning" | "evening";
  status: FleetTripStatus;
  is_replacement_driver: boolean;
  last_lat: string | null;
  last_lng: string | null;
  last_ping_at: string | null;
  traffic_detected: boolean;
  alt_route_active: boolean;
  next_stop_name: string | null;
  eta_minutes: number | null;
  passengers_total: number;
  passengers_boarded: number;
  passengers_absent: number;
}
