import { ReactNode } from "react";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="page-header">
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="page-description">{description}</p>
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);
