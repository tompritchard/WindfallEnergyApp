import React from "react";
import type { DashboardTheme } from "../theme";

type ExportUploadPanelProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
  fileNames: string[];
  intervalCount: number;
  firstDate: string | null;
  lastDate: string | null;
  theme: DashboardTheme;
};

const statsRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  alignItems: "center",
  fontSize: "11px",
  color: "#7b6558",
  background: "rgba(255,250,245,0.5)",
  border: "1px solid rgba(91,62,46,0.08)",
  borderRadius: "8px",
  padding: "5px 10px",
};

const statValueStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#201714",
  fontSize: "12px",
};

const sepStyle: React.CSSProperties = { opacity: 0.3, userSelect: "none" };

export default function ExportUploadPanel({
  inputRef,
  onFileChange,
  onClearData,
  fileNames,
  intervalCount,
  firstDate,
  lastDate,
  theme,
}: ExportUploadPanelProps) {
  const ui = theme.components.uploadPanel;

  return (
    <section style={ui.section} className="windfall-compact-panel">
      <div style={ui.topRow}>
        <div>
          <h2 style={ui.title}>Export data</h2>
        </div>

        <button type="button" onClick={onClearData} style={ui.ghostButton}>
          Clear export data
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: theme.tokens.spacing.sm,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={ui.primaryButton}
        >
          Select CSV files
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={onFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div style={statsRowStyle}>
        <span>Files <strong style={statValueStyle}>{fileNames.length}</strong></span>
        <span style={sepStyle}>·</span>
        <span>Intervals <strong style={statValueStyle}>{intervalCount.toLocaleString()}</strong></span>
        <span style={sepStyle}>·</span>
        <span>From <strong style={statValueStyle}>{firstDate ?? "–"}</strong></span>
        <span style={sepStyle}>·</span>
        <span>To <strong style={statValueStyle}>{lastDate ?? "–"}</strong></span>
      </div>
    </section>
  );
}
