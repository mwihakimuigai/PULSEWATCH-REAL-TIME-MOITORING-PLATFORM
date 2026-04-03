import { EventRecord } from "../types";

export const EventTable = ({
  events,
  onSelect
}: {
  events: EventRecord[];
  onSelect?: (event: EventRecord) => void;
}) => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Message</th>
          <th>Severity</th>
          <th>Source</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event.id} className={onSelect ? "table-row-clickable" : ""} onClick={() => onSelect?.(event)}>
            <td>
              <span className={`pill pill-${event.type}`}>{event.type}</span>
            </td>
            <td>{event.message}</td>
            <td>{event.severity}</td>
            <td>{event.source}</td>
            <td>{new Date(event.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
