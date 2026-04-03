import { EventRecord } from "../types";

export const EventDetailModal = ({
  event,
  onClose
}: {
  event: EventRecord | null;
  onClose: () => void;
}) => {
  if (!event) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">Event detail</p>
            <h3>Event #{event.id}</h3>
          </div>
          <button className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="detail-grid">
          <div>
            <strong>Type</strong>
            <p>
              <span className={`pill pill-${event.type}`}>{event.type}</span>
            </p>
          </div>
          <div>
            <strong>Severity</strong>
            <p>{event.severity}</p>
          </div>
          <div>
            <strong>Source</strong>
            <p>{event.source}</p>
          </div>
          <div>
            <strong>Created</strong>
            <p>{new Date(event.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="detail-message">
          <strong>Message</strong>
          <p>{event.message}</p>
        </div>
      </div>
    </div>
  );
};
