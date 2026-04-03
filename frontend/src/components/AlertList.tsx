import { AlertRecord } from "../types";

export const AlertList = ({
  alerts,
  onResolve,
  canResolve
}: {
  alerts: AlertRecord[];
  onResolve?: (id: number) => void;
  canResolve?: boolean;
}) => (
  <div className="alert-list">
    {alerts.length === 0 ? (
      <div className="empty-state">No alerts triggered yet.</div>
    ) : (
      alerts.map((alert) => (
        <article className="alert-card" key={alert.id}>
          <div>
            <p className="eyebrow">{alert.status}</p>
            <h4>{alert.message ?? "High severity threshold exceeded"}</h4>
            <p className="alert-meta">
              {alert.event_type} · {alert.severity} · {new Date(alert.created_at).toLocaleString()}
            </p>
          </div>
          {canResolve && alert.status === "unresolved" ? (
            <button className="ghost-button" onClick={() => onResolve?.(alert.id)}>
              Mark resolved
            </button>
          ) : (
            <span>{alert.resolved_at ? `Resolved ${new Date(alert.resolved_at).toLocaleString()}` : "Open"}</span>
          )}
        </article>
      ))
    )}
  </div>
);
