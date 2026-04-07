import React from "react";
import type { ParseIssue } from "../types";
import type { DashboardTheme } from "../theme";

type UploadPanelProps = {
  title: string;
  clearLabel: string;
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
  display: "grid",
  gridTemplateColumns: "18fr 27fr 30fr 25fr",
  background: "rgba(255,250,245,0.5)",
  border: "1px solid rgba(91,62,46,0.08)",
  borderRadius: "8px",
  padding: "5px 10px",
};

const statCellStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#7b6558",
};

const statValueStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#201714",
  fontSize: "12px",
  marginLeft: "8px",
};

export default function UploadPanel({
  title,
  clearLabel,
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
          <h2 style={ui.title}>{title}</h2>
        </div>

        <button type="button" onClick={onClearData} style={ui.ghostButton}>
          {clearLabel}
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
        <span style={statCellStyle}>Files <strong style={statValueStyle}>{fileNames.length}</strong></span>
        <span style={statCellStyle}>Intervals <strong style={statValueStyle}>{intervalCount.toLocaleString()}</strong></span>
        <span style={statCellStyle}>From <strong style={statValueStyle}>{firstDate ?? "–"}</strong></span>
        <span style={statCellStyle}>To <strong style={statValueStyle}>{lastDate ?? "–"}</strong></span>
      </div>

      {issues.length > 0 && (
        <div style={ui.issueBox}>
          <div style={ui.issueTitle}>Issues</div>
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
