interface FiltersProps {
  filters: {
    type: string;
    startDate: string;
    endDate: string;
  };
  onChange: (name: string, value: string) => void;
}

export const Filters = ({ filters, onChange }: FiltersProps) => (
  <div className="filters">
    <label>
      Event type
      <select value={filters.type} onChange={(event) => onChange("type", event.target.value)}>
        <option value="">All</option>
        <option value="error">Error</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>
    </label>
    <label>
      Start date
      <input
        type="date"
        value={filters.startDate}
        onChange={(event) => onChange("startDate", event.target.value)}
      />
    </label>
    <label>
      End date
      <input
        type="date"
        value={filters.endDate}
        onChange={(event) => onChange("endDate", event.target.value)}
      />
    </label>
  </div>
);
