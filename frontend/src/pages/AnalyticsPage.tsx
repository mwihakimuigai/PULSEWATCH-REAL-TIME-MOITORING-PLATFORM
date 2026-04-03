import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ChartCard } from "../components/ChartCard";
import { Filters } from "../components/Filters";
import { PageHeader } from "../components/PageHeader";
import api from "../lib/api";
import { socket } from "../lib/socket";
import { AlertRecord, AnalyticsPoint } from "../types";

const weekDayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pieColors = ["#38bdf8", "#facc15", "#ef4444", "#22c55e", "#ff5fa2"];

export const AnalyticsPage = () => {
  const [filters, setFilters] = useState({ type: "", startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<{
    eventsOverTime: AnalyticsPoint[];
    eventsByType: AnalyticsPoint[];
    severityDistribution: AnalyticsPoint[];
    activityHeatmap: AnalyticsPoint[];
    recentAlerts: AlertRecord[];
  }>({
    eventsOverTime: [],
    eventsByType: [],
    severityDistribution: [],
    activityHeatmap: [],
    recentAlerts: []
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get("/analytics/dashboard", {
        params: {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate ? `${filters.endDate} 23:59:59` : undefined
        }
      });
      setAnalytics(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [filters.startDate, filters.endDate]);

  useEffect(() => {
    socket.connect();
    const refresh = () => void loadAnalytics();
    socket.on("event:created", refresh);
    socket.on("alert:created", refresh);
    return () => {
      socket.off("event:created", refresh);
      socket.off("alert:created", refresh);
      socket.disconnect();
    };
  }, [filters.startDate, filters.endDate]);

  const hasData =
    analytics.eventsOverTime.length > 0 ||
    analytics.eventsByType.length > 0 ||
    analytics.severityDistribution.length > 0;

  const heatmapCells = weekDayLabels.flatMap((label, index) =>
    Array.from({ length: 24 }, (_, hour) => {
      const point = analytics.activityHeatmap.find(
        (entry) => Number(entry.weekDay) === index + 1 && Number(entry.hour) === hour
      );
      return {
        key: `${label}-${hour}`,
        label,
        hour,
        count: Number(point?.count ?? 0)
      };
    })
  );

  const renderState = (hasItems: boolean, chart: React.ReactNode) => {
    if (loading) {
      return <div className="chart-state">Loading analytics...</div>;
    }
    if (!hasItems) {
      return <div className="chart-state">No analytics data yet. Run the simulator or seed demo events.</div>;
    }
    return chart;
  };

  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Trends, distribution, and risk patterns"
        description="Explore the event stream with dedicated visual analysis and date-based slices."
      />
      <Filters filters={filters} onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))} />
      <section className="analytics-grid analytics-grid-stack">
        <ChartCard title="Timeline" subtitle="Events over time">
          {renderState(
            analytics.eventsOverTime.length > 0,
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={analytics.eventsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23324b" />
                <XAxis dataKey="day" stroke="#97a6c1" />
                <YAxis stroke="#97a6c1" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#ff7a18" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Distribution" subtitle="Events by type">
          {renderState(
            analytics.eventsByType.length > 0,
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={analytics.eventsByType} dataKey="count" nameKey="type" outerRadius={110}>
                  {analytics.eventsByType.map((entry, index) => (
                    <Cell key={`${entry.type ?? "slice"}-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
        <ChartCard title="Severity" subtitle="Bar chart by severity">
          {renderState(
            analytics.severityDistribution.length > 0,
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.severityDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23324b" />
                <XAxis dataKey="severity" stroke="#97a6c1" />
                <YAxis stroke="#97a6c1" />
                <Tooltip />
                <Bar dataKey="count" fill="#ff7a18" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Activity heatmap</p>
            <h3>Peak hours across the week</h3>
          </div>
        </div>
        {loading ? (
          <div className="chart-state">Loading analytics...</div>
        ) : !hasData ? (
          <div className="chart-state">No activity yet. Generate demo traffic to reveal weekly patterns.</div>
        ) : (
          <div className="heatmap">
            {weekDayLabels.map((label) => (
              <div key={label} className="heatmap-row-label">
                {label}
              </div>
            ))}
            <div className="heatmap-grid">
              {heatmapCells.map((cell) => (
                <div
                  key={cell.key}
                  className="heatmap-cell"
                  title={`${cell.label} ${String(cell.hour).padStart(2, "0")}:00 - ${cell.count} events`}
                  style={{
                    opacity: cell.count === 0 ? 0.18 : Math.min(0.25 + cell.count / 8, 1)
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
};
