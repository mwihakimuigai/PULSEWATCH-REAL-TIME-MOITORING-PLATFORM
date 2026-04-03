import { PropsWithChildren } from "react";

export const ChartCard = ({ children, title, subtitle }: PropsWithChildren<{ title: string; subtitle: string }>) => (
  <section className="panel chart-panel">
    <div className="panel-header">
      <div>
        <p className="eyebrow">{title}</p>
        <h3>{subtitle}</h3>
      </div>
    </div>
    {children}
  </section>
);
