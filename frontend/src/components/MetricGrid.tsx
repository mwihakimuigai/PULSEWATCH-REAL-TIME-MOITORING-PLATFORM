import { ReactNode } from "react";
import { StatCard } from "./StatCard";

export const MetricGrid = ({
  items
}: {
  items: Array<{
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
    trend?: string;
    tone?: "high" | "warning" | "success" | "info";
  }>;
}) => (
  <section className="stats-grid">
    {items.map((item) => (
      <StatCard key={item.label} {...item} />
    ))}
  </section>
);
