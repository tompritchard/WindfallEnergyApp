import React from "react";
import type { ParseIssue } from "../types";
import type { DashboardTheme } from "../theme";

type UploadPanelProps = {
  appendMode: boolean;
  onAppendModeChange: (value: boolean) => void;
  onClearData: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileNames: string[];
  intervalCount: number;
  firstDate: string | null;
  lastDate: string | null;
  issues: ParseIssue[];
  theme: DashboardTheme;
};

export default function UploadPanel({
  appendMode,
  onAppendModeChange,
  onClearData,
  onFileChange,
  inputRef,
  fileNames,
  intervalCount,
  firstDate,
  lastDate,
  issues,
  theme,
}: UploadPanelProps) {
  const ui = theme.components.uploadPanel;

  return (
    <section style={ui.section} className="windfall-compact-panel">
      <div style={ui.topRow}>
        <div>
          <h2 style={ui.title}>Import data</h2>
          <p style={ui.body}>
            Upload one or more electricity import CSV files.
          </p>
        </div>

        <button type="button" onClick={onClearData} style={ui.ghostButton}>
          Clear import data
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

        <label style={ui.optionChip}>
          <input
            type="checkbox"
            checked={appendMode}
            onChange={(e) => onAppendModeChange(e.target.checked)}
          />
          Append to existing data
        </label>

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
            Intervals loaded
          </div>
          <div style={ui.statValue} className="windfall-stat-value">
            {intervalCount}
          </div>
        </div>

        <div style={ui.statCard} className="windfall-stat-card">
          <div style={ui.statLabel} className="windfall-stat-label">
            Date range
          </div>
          <div style={ui.statBody}>
            <div>From: {firstDate ?? "-"}</div>
            <div>To: {lastDate ?? "-"}</div>
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div style={{ ...ui.issueBox, marginTop: "8px" }}>
          <div style={ui.issueTitle}>Import issues</div>

          <ul style={ui.issueList}>
            {issues.map((issue, index) => (
              <li key={`${issue.fileName}-${index}`}>
                <strong>{issue.fileName}:</strong> {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}