import React from "react";
import type { DashboardTheme } from "../theme";

type SummaryCardProps = {
  title: string;
  value: string;
  accent?: string;
  theme: DashboardTheme;
};

export default function SummaryCard({
  title,
  value,
  accent,
  theme,
}: SummaryCardProps) {
  const ui = theme.components.summaryCard;
  const resolvedAccent = accent ?? theme.tokens.colors.primary;

  return (
    <div style={ui.card}>
      <div
        style={{
          ...ui.glowOverlay,
          background: `linear-gradient(135deg, ${resolvedAccent}18 0%, transparent 74%)`,
        }}
      />

      <div
        style={{
          ...ui.accentBar,
          background: resolvedAccent,
        }}
      />

      <div style={ui.label}>{title}</div>
      <div style={ui.value}>{value}</div>
    </div>
  );
}