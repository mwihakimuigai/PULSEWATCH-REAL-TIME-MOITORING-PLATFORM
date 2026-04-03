import { UserRole } from "./auth";

export type EventType = "error" | "info" | "warning";
export type EventSeverity = "low" | "medium" | "high";
export type EventSource = "system" | "user";
export type AlertTriggerType = "high_severity_threshold";
export type AlertStatus = "resolved" | "unresolved";

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
}

export interface Event {
  id: number;
  type: EventType;
  message: string;
  severity: EventSeverity;
  source: EventSource;
  created_at: string;
}

export interface Alert {
  id: number;
  event_id: number;
  trigger_type: AlertTriggerType;
  status: AlertStatus;
  resolved_at: string | null;
  created_at: string;
}
