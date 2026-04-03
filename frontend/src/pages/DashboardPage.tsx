import { Activity, AlertTriangle, Clock3, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AlertList } from "../components/AlertList";
import { ChartCard } from "../components/ChartCard";
import { EventComposer } from "../components/EventComposer";
import { EventDetailModal } from "../components/EventDetailModal";
import { EventTable } from "../components/EventTable";
import { Filters } from "../components/Filters";
import { MetricGrid } from "../components/MetricGrid";
import { PageHeader } from "../components/PageHeader";
import api from "../lib/api";
import { socket } from "../lib/socket";
import { AlertRecord, AnalyticsPoint, EventRecord } from "../types";

const typeColors: Record<string, string> = {
  error: "#ef4444",
  warning: "#facc15",
  info: "#38bdf8"
};

const severityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#facc15",
  low: "#22c55e"
};

interface DashboardAnalytics {
  eventsOverTime: AnalyticsPoint[];
  eventsByType: AnalyticsPoint[];
  severityDistribution: AnalyticsPoint[];
  severityByType: Array<{ type: string; high: number; medium: number; low: number }>;
  sourceBreakdown: Array<{ source: string; count: number }>;
  activityHeatmap: AnalyticsPoint[];
}

const formatTrend = (current: number, previous: number) => {
  if (previous === 0 && current > 0) {
    return "New activity vs previous period";
  }
  if (previous === 0) {
    return "No change";
  }
  const delta = ((current - previous) / previous) * 100;
  const prefix = delta >= 0 ? "+" : "";
  return `${prefix}${delta.toFixed(0)}% vs previous period`;
};

export const DashboardPage = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    startDate: "",
    endDate: ""
  });
  const [chartFilters, setChartFilters] = useState({
    type: "",
    severity: "",
    day: ""
  });
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    eventsOverTime: [],
    eventsByType: [],
    severityDistribution: [],
    severityByType: [],
    sourceBreakdown: [],
    activityHeatmap: []
  });

  const activeType = chartFilters.type || filters.type;
  const activeSeverity = chartFilters.severity || filters.severity;
  const activeStartDate = chartFilters.day || filters.startDate;
  const activeEndDate = chartFilters.day || filters.endDate;

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const params = {
        type: activeType || undefined,
        severity: activeSeverity || undefined,
        startDate: activeStartDate || undefined,
        endDate: activeEndDate ? `${activeEndDate} 23:59:59` : undefined
      };

      const [eventsResponse, alertsResponse, analyticsResponse] = await Promise.all([
        api.get("/events", { params: { ...params, page: 1, pageSize: 6 } }),
        api.get("/alerts", { params: { limit: 6, status: "unresolved" } }),
        api.get("/analytics/dashboard", { params })
      ]);

      setEvents(eventsResponse.data.data);
      setAlerts(alertsResponse.data.data);
      setAnalytics(analyticsResponse.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [activeType, activeSeverity, activeStartDate, activeEndDate]);

  useEffect(() => {
    socket.connect();
    const onEvent = () => void loadDashboard();
    const onAlert = () => void loadDashboard();
    socket.on("event:created", onEvent);
    socket.on("alert:created", onAlert);
    return () => {
      socket.off("event:created", onEvent);
      socket.off("alert:created", onAlert);
      socket.disconnect();
    };
  }, [activeType, activeSeverity, activeStartDate, activeEndDate]);

  const insights = useMemo(() => {
    const totalEvents = analytics.eventsByType.reduce((sum, item) => sum + Number(item.count), 0);
    const highSeverity = Number(
      analytics.severityDistribution.find((item) => item.severity === "high")?.count ?? 0
    );
    const sortedTimeline = [...analytics.eventsOverTime];
    const todayCount = Number(sortedTimeline[sortedTimeline.length - 1]?.count ?? 0);
    const yesterdayCount = Number(sortedTimeline[sortedTimeline.length - 2]?.count ?? 0);
    const topSource = analytics.sourceBreakdown[0];
    const peakActivity = analytics.activityHeatmap.reduce(
      (peak, entry) => (Number(entry.count) > Number(peak.count) ? entry : peak),
      analytics.activityHeatmap[0] ?? { count: 0, hour: 0, weekDay: 1 }
    );

    return {
      totalEvents,
      highSeverity,
      todayCount,
      yesterdayCount,
      topSource,
      peakActivity
    };
  }, [analytics]);

  const metrics = useMemo(
    () => [
      {
        label: "Total events",
        value: String(insights.totalEvents),
        detail: "Filtered operational volume",
        trend: formatTrend(insights.todayCount, insights.yesterdayCount),
        icon: <TrendingUp />,
        tone: "info" as const
      },
      {
        label: "High severity",
        value: String(insights.highSeverity),
        detail: "Critical incidents requiring action",
        trend: `${Math.round((insights.highSeverity / Math.max(insights.totalEvents, 1)) * 100)}% of tracked events`,
        icon: <AlertTriangle />,
        tone: "high" as const
      },
      {
        label: "Top source",
        value: insights.topSource?.source ?? "No data",
        detail: "Most active event source right now",
        trend: insights.topSource ? `${insights.topSource.count} events in selected window` : "Awaiting traffic",
        icon: <ShieldAlert />,
        tone: "success" as const
      },
      {
        label: "Peak activity",
        value:
          insights.peakActivity?.hour !== undefined
            ? `${String(insights.peakActivity.hour).padStart(2, "0")}:00`
            : "No data",
        detail: "Busiest hour detected",
        trend:
          insights.peakActivity?.count !== undefined
            ? `${insights.peakActivity.count} events in the peak slot`
            : "Awaiting traffic",
        icon: <Clock3 />,
        tone: "warning" as const
      }
    ],
    [insights]
  );

  const hasData = analytics.eventsOverTime.length > 0 || events.length > 0 || alerts.length > 0;

  const resetChartFilters = () => {
    setChartFilters({ type: "", severity: "", day: "" });
  };

  const renderState = (ready: boolean, content: React.ReactNode, emptyMessage: string) => {
    if (loading) {
      return <div className="chart-state">Loading dashboard intelligence...</div>;
    }
    if (!ready) {
      return <div className="chart-state">{emptyMessage}</div>;
    }
    return content;
  };

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Interactive operations intelligence"
        description="Track trends, compare periods, and drill into live events with linked analytics across the dashboard."
        action={
          <button className="ghost-button" onClick={resetChartFilters}>
            Clear chart filters
          </button>
        }
      />

      <section className="panel dashboard-filters-panel">
        <div className="panel-header dashboard-panel-heading">
          <div>
            <p className="eyebrow">Global filters</p>
            <h3>Refine the entire dashboard</h3>
          </div>
          <div className="active-filter-summary">
            <span>{activeType ? `Type: ${activeType}` : "All types"}</span>
            <span>{activeSeverity ? `Severity: ${activeSeverity}` : "All severities"}</span>
          </div>
        </div>
        <Filters
          filters={{ type: filters.type, startDate: filters.startDate, endDate: filters.endDate }}
          onChange={(name, value) => setFilters((current) => ({ ...current, [name]: value }))}
        />
        <div className="dashboard-severity-filter">
          <label>
            Severity
            <select value={filters.severity} onChange={(event) => setFilters((current) => ({ ...current, severity: event.target.value }))}>
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>
      </section>

      <MetricGrid items={metrics} />

      <section className="analytics-grid dashboard-analytics-grid">
        <ChartCard title="Real-time trend" subtitle="Events over time">
          {renderState(
            analytics.eventsOverTime.length > 0,
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart
                data={analytics.eventsOverTime}
                onClick={(state) => {
                  const activeLabel = state?.activeLabel;
                  if (typeof activeLabel === "string") {
                    const selectedDay = new Date(activeLabel).toISOString().slice(0, 10);
                    setChartFilters((current) => ({ ...current, day: selectedDay }));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#284060" />
                <XAxis dataKey="day" stroke="#bfd0ea" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis stroke="#bfd0ea" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#38bdf8" fill="rgba(56,189,248,0.22)" />
              </AreaChart>
            </ResponsiveContainer>,
            "No timeline data in this period."
          )}
        </ChartCard>

        <ChartCard title="Event types" subtitle="Click a bar to filter the dashboard">
          {renderState(
            analytics.eventsByType.length > 0,
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={analytics.eventsByType}
                onClick={(state) => {
                  const entry = state?.activePayload?.[0]?.payload as { type?: string } | undefined;
                  if (entry?.type) {
                    setChartFilters((current) => ({ ...current, type: entry.type ?? "" }));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#284060" />
                <XAxis dataKey="type" stroke="#bfd0ea" />
                <YAxis stroke="#bfd0ea" />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {analytics.eventsByType.map((entry, index) => (
                    <Cell key={`${entry.type}-${index}`} fill={typeColors[entry.type ?? "info"] ?? "#38bdf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>,
            "No event type data available."
          )}
        </ChartCard>
      </section>

      <section className="analytics-grid dashboard-analytics-grid">
        <ChartCard title="Severity mix" subtitle="Stacked by event type">
          {renderState(
            analytics.severityByType.length > 0,
            <ResponsiveContainer width="100%" height={310}>
              <BarChart
                data={analytics.severityByType}
                onClick={(state) => {
                  const payload = state?.activePayload?.[0]?.payload as { type?: string } | undefined;
                  const activeDataKey = state?.activeTooltipIndex !== undefined
                    ? undefined
                    : undefined;
                  if (payload?.type) {
                    setChartFilters((current) => ({ ...current, type: payload.type ?? current.type }));
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#284060" />
                <XAxis dataKey="type" stroke="#bfd0ea" />
                <YAxis stroke="#bfd0ea" />
                <Tooltip />
                <Legend />
                <Bar dataKey="high" stackId="severity" fill={severityColors.high} onClick={() => setChartFilters((current) => ({ ...current, severity: "high" }))} />
                <Bar dataKey="medium" stackId="severity" fill={severityColors.medium} onClick={() => setChartFilters((current) => ({ ...current, severity: "medium" }))} />
                <Bar dataKey="low" stackId="severity" fill={severityColors.low} onClick={() => setChartFilters((current) => ({ ...current, severity: "low" }))} />
              </BarChart>
            </ResponsiveContainer>,
            "No severity mix available."
          )}
        </ChartCard>

        <section className="panel dashboard-insights-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Insights</p>
              <h3>Operational takeaways</h3>
            </div>
          </div>
          {loading ? (
            <div className="chart-state compact-state">Loading insight cards...</div>
          ) : !hasData ? (
            <div className="chart-state compact-state">No live activity yet. Run the simulator to unlock insights.</div>
          ) : (
            <div className="insight-list">
              <article className="insight-card insight-card-blue">
                <strong>Today vs yesterday</strong>
                <p>{formatTrend(insights.todayCount, insights.yesterdayCount)}</p>
              </article>
              <article className="insight-card insight-card-red">
                <strong>Highest risk signal</strong>
                <p>{insights.highSeverity} high severity events are active in this view.</p>
              </article>
              <article className="insight-card insight-card-green">
                <strong>Top source</strong>
                <p>
                  {insights.topSource
                    ? `${insights.topSource.source} is contributing the most events right now.`
                    : "No dominant source yet."}
                </p>
              </article>
            </div>
          )}
        </section>
      </section>

      <section className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h3>Newest events</h3>
            </div>
          </div>
          {renderState(
            events.length > 0,
            <EventTable events={events} onSelect={setSelectedEvent} />,
            "No recent events match the current filters."
          )}
        </section>
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Alert feed</p>
              <h3>Open escalations</h3>
            </div>
          </div>
          {renderState(
            alerts.length > 0,
            <AlertList alerts={alerts} />,
            "No unresolved alerts in the current view."
          )}
        </section>
      </section>

      <EventComposer onCreated={() => void loadDashboard()} />
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
};
