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

      <div style={statsRowStyle}>
        <span>Files <strong style={statValueStyle}>{fileNames.length}</strong></span>
        <span style={sepStyle}>·</span>
        <span>Intervals <strong style={statValueStyle}>{intervalCount.toLocaleString()}</strong></span>
        <span style={sepStyle}>·</span>
        <span>From <strong style={statValueStyle}>{firstDate ?? "–"}</strong></span>
        <span style={sepStyle}>·</span>
        <span>To <strong style={statValueStyle}>{lastDate ?? "–"}</strong></span>
      </div>

      {issues.length > 0 && (
        <div style={ui.issueBox}>
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
