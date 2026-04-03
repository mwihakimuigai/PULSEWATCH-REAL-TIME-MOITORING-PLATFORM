import { useEffect, useState } from "react";
import { AlertList } from "../components/AlertList";
import { PageHeader } from "../components/PageHeader";
import api from "../lib/api";
import { socket } from "../lib/socket";
import { useAuth } from "../state/AuthContext";
import { AlertRecord } from "../types";

export const AlertsPage = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState("");
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);

  const loadAlerts = async () => {
    const response = await api.get("/alerts", {
      params: {
        status: status || undefined,
        limit: 100
      }
    });
    setAlerts(response.data.data);
  };

  const resolveAlert = async (id: number) => {
    await api.patch(`/alerts/${id}/resolve`);
    void loadAlerts();
  };

  useEffect(() => {
    void loadAlerts();
  }, [status]);

  useEffect(() => {
    socket.connect();
    const onAlert = () => void loadAlerts();
    socket.on("alert:created", onAlert);
    return () => {
      socket.off("alert:created", onAlert);
      socket.disconnect();
    };
  }, [status]);

  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Escalations and incident response"
        description="Track unresolved alerts, browse history, and close issues when they are handled."
      />
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Status filter</p>
            <h3>Alert history</h3>
          </div>
          <select className="select-inline" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All alerts</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <AlertList alerts={alerts} onResolve={resolveAlert} canResolve={user?.role === "admin"} />
      </section>
    </>
  );
};
