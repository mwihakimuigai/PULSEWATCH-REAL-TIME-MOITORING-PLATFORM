import { EventSeverity, EventSource, EventType } from "../types/models";

interface EventTemplate {
  type: EventType;
  severity: EventSeverity;
  source: EventSource;
  message: string;
}

const templates: EventTemplate[] = [
  { type: "error", severity: "high", source: "system", message: "Route calculation failed for district dispatch corridor" },
  { type: "error", severity: "medium", source: "system", message: "Websocket heartbeat dropped for monitoring gateway" },
  { type: "warning", severity: "medium", source: "system", message: "Elevated latency detected in geofence event processor" },
  { type: "warning", severity: "low", source: "user", message: "Operator retried alert acknowledgement after timeout" },
  { type: "info", severity: "low", source: "user", message: "Analyst exported event ledger snapshot for review" },
  { type: "info", severity: "medium", source: "system", message: "Event ingestion worker scaled to handle peak traffic" },
  { type: "error", severity: "high", source: "system", message: "Incident correlation engine exceeded retry threshold" },
  { type: "warning", severity: "high", source: "system", message: "Spike in unresolved alerts detected across east region" },
  { type: "info", severity: "low", source: "user", message: "Supervisor updated response notes for open escalation" },
  { type: "warning", severity: "medium", source: "system", message: "API response time trending above baseline on analytics cluster" }
];

const rand = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export const generateDemoEvent = (createdAt?: string) => {
  const template = rand(templates);
  return {
    ...template,
    createdAt
  };
};

export const generateDemoEvents = (count: number) => {
  const now = Date.now();
  const span = 1000 * 60 * 60 * 24 * 14;

  return Array.from({ length: count }, () => {
    const timestamp = new Date(now - Math.floor(Math.random() * span)).toISOString().slice(0, 19).replace("T", " ");
    return generateDemoEvent(timestamp);
  }).sort((a, b) => (a.createdAt! < b.createdAt! ? -1 : 1));
};
