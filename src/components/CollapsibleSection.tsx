import React from "react";
import type { DashboardTheme } from "../theme";

type CollapsibleSectionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  theme: DashboardTheme;
};

export default function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
  theme,
}: CollapsibleSectionProps) {
  const ui = theme.components.collapsibleSection;

  return (
    <section style={ui.wrapper}>
      <button
        type="button"
        onClick={onToggle}
        style={ui.headerButton}
      >
        <h2 style={ui.title}>{title}</h2>
        <span style={ui.caret}>{isOpen ? "Hide" : "Show"}</span>
      </button>

      {isOpen && <div style={ui.body}>{children}</div>}
    </section>
  );
}
