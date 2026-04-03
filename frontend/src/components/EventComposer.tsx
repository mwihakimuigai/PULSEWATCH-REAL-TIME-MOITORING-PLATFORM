import { useState } from "react";
import api from "../lib/api";
import { EventSeverity, EventSource, EventType } from "../types";

export const EventComposer = ({ onCreated }: { onCreated: () => void }) => {
  const [form, setForm] = useState({
    type: "error" as EventType,
    message: "",
    severity: "medium" as EventSeverity,
    source: "system" as EventSource
  });
  const [submitting, setSubmitting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationCount, setSimulationCount] = useState("12");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/events", form);
      setForm({ ...form, message: "" });
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await api.post("/events/simulate", { count: Number(simulationCount) });
      onCreated();
    } finally {
      setSimulating(false);
    }
  };

  return (
    <form className="panel composer" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Ingestion</p>
          <h3>Simulate live event traffic</h3>
        </div>
        <div className="simulator-actions">
          <select value={simulationCount} onChange={(event) => setSimulationCount(event.target.value)}>
            <option value="6">6 events</option>
            <option value="12">12 events</option>
            <option value="24">24 events</option>
          </select>
          <button type="button" className="ghost-button" onClick={() => void handleSimulate()} disabled={simulating}>
            {simulating ? "Simulating..." : "Simulate Events"}
          </button>
        </div>
      </div>
      <textarea
        placeholder="Describe the event stream..."
        value={form.message}
        onChange={(event) => setForm({ ...form, message: event.target.value })}
        required
      />
      <div className="composer-grid">
        <select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value as EventType })}
        >
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
        <select
          value={form.severity}
          onChange={(event) => setForm({ ...form, severity: event.target.value as EventSeverity })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={form.source}
          onChange={(event) => setForm({ ...form, source: event.target.value as EventSource })}
        >
          <option value="system">System</option>
          <option value="user">User</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send Event"}
        </button>
      </div>
    </form>
  );
};
