import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { EventDetailModal } from "../components/EventDetailModal";
import { EventFilters } from "../components/EventFilters";
import { EventTable } from "../components/EventTable";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import api from "../lib/api";
import { socket } from "../lib/socket";
import { EventRecord } from "../types";

export const EventsPage = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    severity: "",
    startDate: "",
    endDate: ""
  });

  const loadEvents = async () => {
    const response = await api.get("/events", {
      params: {
        ...filters,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate ? `${filters.endDate} 23:59:59` : undefined,
        page,
        pageSize: 10
      }
    });
    setEvents(response.data.data);
    setTotalPages(response.data.totalPages);
  };

  const exportCsv = async () => {
    const response = await api.get("/events/export/csv", {
      params: {
        ...filters,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate ? `${filters.endDate} 23:59:59` : undefined
      },
      responseType: "blob"
    });
    const url = URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pulsewatch-events.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    void loadEvents();
  }, [page, filters.search, filters.type, filters.severity, filters.startDate, filters.endDate]);

  useEffect(() => {
    socket.connect();
    const onCreated = () => void loadEvents();
    socket.on("event:created", onCreated);
    return () => {
      socket.off("event:created", onCreated);
      socket.disconnect();
    };
  }, [page, filters.search, filters.type, filters.severity, filters.startDate, filters.endDate]);

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Operational event ledger"
        description="Search, filter, paginate, and inspect the full stream of incoming platform events."
        action={
          <button className="ghost-button" onClick={() => void exportCsv()}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        }
      />
      <section className="panel">
        <EventFilters
          filters={filters}
          onChange={(name, value) => {
            setPage(1);
            setFilters((current) => ({ ...current, [name]: value }));
          }}
        />
        <EventTable events={events} onSelect={setSelectedEvent} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </section>
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </>
  );
};
