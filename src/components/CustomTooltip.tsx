import type { DashboardTheme } from "../theme";

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  theme: DashboardTheme;
};

function formatValue(value: number | string | undefined): string {
  if (value === undefined || value === null) return "-";
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toString() : value.toFixed(2);
  }
  return String(value);
}

export default function CustomTooltip({
  active,
  payload,
  label,
  theme,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const ui = theme.components.tooltip;

  return (
    <div style={ui.container}>
      {label !== undefined && label !== null && (
        <div style={ui.label}>{String(label)}</div>
      )}

      <div style={{ display: "grid", gap: theme.tokens.spacing.xs }}>
        {payload.map((entry, index) => (
          <div
            key={`${entry.dataKey ?? entry.name ?? "value"}-${index}`}
            style={ui.row}
          >
            <div style={ui.keyWrap}>
              <span
                style={{
                  ...ui.dot,
                  background: entry.color ?? theme.tokens.colors.primary,
                }}
              />
              <span style={ui.keyText}>
                {entry.name ?? entry.dataKey ?? "Value"}
              </span>
            </div>

            <span style={ui.value}>{formatValue(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}