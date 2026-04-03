import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  trend?: string;
  tone?: "high" | "warning" | "success" | "info";
}

export const StatCard = ({ label, value, detail, icon, trend, tone = "info" }: StatCardProps) => (
  <div className={`stat-card stat-card-${tone}`}>
    <div>
      <p className="eyebrow">{label}</p>
      <h3>{value}</h3>
      <span>{detail}</span>
      {trend ? <div className="stat-trend">{trend}</div> : null}
    </div>
    <div className="stat-icon">{icon}</div>
  </div>
);
