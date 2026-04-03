interface EventFiltersProps {
  filters: {
    search: string;
    type: string;
    severity: string;
    startDate: string;
    endDate: string;
  };
  onChange: (name: string, value: string) => void;
}

export const EventFilters = ({ filters, onChange }: EventFiltersProps) => (
  <div className="filters filters-wide">
    <label>
      Search events
      <input value={filters.search} onChange={(event) => onChange("search", event.target.value)} placeholder="Search by message" />
    </label>
    <label>
      Type
      <select value={filters.type} onChange={(event) => onChange("type", event.target.value)}>
        <option value="">All</option>
        <option value="error">Error</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>
    </label>
    <label>
      Severity
      <select value={filters.severity} onChange={(event) => onChange("severity", event.target.value)}>
        <option value="">All</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </label>
    <label>
      Start date
      <input type="date" value={filters.startDate} onChange={(event) => onChange("startDate", event.target.value)} />
    </label>
    <label>
      End date
      <input type="date" value={filters.endDate} onChange={(event) => onChange("endDate", event.target.value)} />
    </label>
  </div>
);
