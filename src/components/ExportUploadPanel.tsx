import React from "react";
import type { DashboardTheme } from "../theme";

type ExportUploadPanelProps = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
  fileNames: string[];
  theme: DashboardTheme;
};

export default function ExportUploadPanel({
  inputRef,
  onFileChange,
  onClearData,
  fileNames,
  theme,
}: ExportUploadPanelProps) {
  const ui = theme.components.uploadPanel;

  return (
    <section style={ui.section} className="windfall-compact-panel">
      <div style={ui.topRow}>
        <div>
          <h2 style={ui.title}>Export data</h2>
          <p style={ui.body}>
            Upload one or more electricity export CSV files.
          </p>
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
          marginBottom: "8px",
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

      <div
        style={{
          ...ui.statsGrid,
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "8px",
        }}
      >
        <div style={ui.statCard} className="windfall-stat-card">
          <div style={ui.statLabel} className="windfall-stat-label">
            Files loaded
          </div>
          <div style={ui.statValue} className="windfall-stat-value">
            {fileNames.length}
          </div>
        </div>

        <div style={ui.statCard} className="windfall-stat-card">
          <div style={ui.statLabel} className="windfall-stat-label">
            Export type
          </div>
          <div style={ui.statBody}>
            <div>Solar export</div>
            <div>CSV import</div>
          </div>
        </div>

        <div style={ui.statCard} className="windfall-stat-card">
          <div style={ui.statLabel} className="windfall-stat-label">
            Status
          </div>
          <div style={ui.statBody}>
            <div>{fileNames.length > 0 ? "Files loaded" : "No files loaded"}</div>
            <div>{fileNames.length > 0 ? "Ready" : "-"}</div>
          </div>
        </div>
      </div>
    </section>
  );
}