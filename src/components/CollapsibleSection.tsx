import React, { useEffect, useState } from "react";
import type { DashboardTheme } from "../theme";

type CollapsibleSectionProps = {
  title: string;
  storageKey?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  theme: DashboardTheme;
};

export default function CollapsibleSection({
  title,
  storageKey,
  defaultOpen = false,
  children,
  theme,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (!storageKey) return defaultOpen;
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored !== null ? stored === "true" : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, String(isOpen));
    } catch {
      // localStorage unavailable — ignore
    }
  }, [isOpen, storageKey]);

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
