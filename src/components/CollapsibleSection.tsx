import React, { useState } from "react";
import type { DashboardTheme } from "../theme";

type CollapsibleSectionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  theme: DashboardTheme;
};

export default function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
  theme,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const ui = theme.components.collapsibleSection;

  return (
    <section style={ui.wrapper}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={ui.headerButton}
      >
        <h2 style={ui.title}>{title}</h2>
        <span style={ui.caret}>{isOpen ? "Hide" : "Show"}</span>
      </button>

      {isOpen && <div style={ui.body}>{children}</div>}
    </section>
  );
}