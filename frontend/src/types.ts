export type UserRole = "admin" | "user";
export type EventType = "error" | "info" | "warning";
export type EventSeverity = "low" | "medium" | "high";
export type EventSource = "system" | "user";
export type AlertStatus = "resolved" | "unresolved";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface EventRecord {
  id: number;
  type: EventType;
  message: string;
  severity: EventSeverity;
  source: EventSource;
  created_at: string;
}

export interface AlertRecord {
  id: number;
  event_id: number;
  trigger_type: string;
  status: AlertStatus;
  resolved_at: string | null;
  created_at: string;
  event_type?: EventType;
  message?: string;
  severity?: EventSeverity;
  source?: EventSource;
}

export interface AnalyticsPoint {
  day?: string;
  type?: string;
  severity?: string;
  hour?: number;
  weekDay?: number;
  count: number;
}
