import React from "react";
import type { DashboardTheme } from "../theme";

type ChartCardProps = {
  title: string;
  children: React.ReactNode;
  compact?: boolean;
  theme: DashboardTheme;
};

export default function ChartCard({
  title,
  children,
  compact = false,
  theme,
}: ChartCardProps) {
  const ui = theme.components.chartCard;

  return (
    <section
      style={{
        ...ui.card,
        padding: compact ? theme.tokens.spacing.md : theme.tokens.spacing.lg,
      }}
    >
      <h2 style={ui.title}>{title}</h2>

      <div
        style={{
          ...ui.inner,
          minHeight: compact ? undefined : 220,
        }}
      >
        {children}
      </div>
    </section>
  );
}