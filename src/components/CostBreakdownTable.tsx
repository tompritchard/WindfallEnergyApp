import React from "react";
import type { DashboardTheme } from "../theme";
import { formatCurrency } from "../utils/formatters";

type MonthlyRow = {
  displayMonth: string;
  totalCost?: number;
  offPeakCost?: number;
  offPeakPercent?: number;
  peakCost?: number;
  peakPercent?: number;
  standing?: number;
  standingPercent?: number;
};

type CostBreakdownTableProps = {
  monthlyData: MonthlyRow[];
  theme: DashboardTheme;
};

function safeCurrency(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? formatCurrency(value)
    : "-";
}

function derivedPercent(part: number | undefined, total: number | undefined): string {
  if (
    typeof part === "number" &&
    Number.isFinite(part) &&
    typeof total === "number" &&
    Number.isFinite(total) &&
    total > 0
  ) {
    return `${((part / total) * 100).toFixed(1)}%`;
  }

  return "-";
}

function explicitOrDerivedPercent(
  explicit: number | undefined,
  part: number | undefined,
  total: number | undefined
): string {
  if (typeof explicit === "number" && Number.isFinite(explicit)) {
    return `${explicit.toFixed(1)}%`;
  }

  return derivedPercent(part, total);
}

function getMonthLabel(row: MonthlyRow): string {
  return row.displayMonth;
}

const centeredOverlay: React.CSSProperties = { textAlign: "center", verticalAlign: "middle" };
const boldOverlay: React.CSSProperties = { fontWeight: 700 };

export default function CostBreakdownTable({
  monthlyData,
  theme,
}: CostBreakdownTableProps) {
  const ui = theme.components.dataTable;
  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : [];

  const headCellCentered: React.CSSProperties = { ...ui.headCell, ...centeredOverlay };
  const bodyCellCentered: React.CSSProperties = { ...ui.bodyCell, ...centeredOverlay };
  const monthCell: React.CSSProperties = { ...ui.bodyCell, ...boldOverlay };
  const totalCostCell: React.CSSProperties = { ...bodyCellCentered, ...boldOverlay };

  return (
    <section style={ui.wrapper}>
      <h2 style={ui.title}>Monthly cost breakdown table</h2>

      <div style={ui.tableWrap}>
        <table style={ui.table}>
          <thead>
            <tr>
              <th style={ui.headCell} rowSpan={2}>
                Month
              </th>
              <th style={headCellCentered} rowSpan={2}>
                Total Cost
              </th>
              <th style={headCellCentered} colSpan={2}>
                Off-Peak
              </th>
              <th style={headCellCentered} colSpan={2}>
                Peak
              </th>
              <th style={headCellCentered} colSpan={2}>
                Standing Charge
              </th>
            </tr>
            <tr>
              <th style={headCellCentered}>Cost</th>
              <th style={headCellCentered}>% of Total</th>
              <th style={headCellCentered}>Cost</th>
              <th style={headCellCentered}>% of Total</th>
              <th style={headCellCentered}>Cost</th>
              <th style={headCellCentered}>% of Total</th>
            </tr>
          </thead>

          <tbody>
            {safeMonthlyData.map((row, index) => (
              <tr
                key={`${getMonthLabel(row)}-${index}`}
                style={index % 2 ? ui.rowAlt : undefined}
              >
                <td style={monthCell}>{getMonthLabel(row)}</td>
                <td style={totalCostCell}>{safeCurrency(row.totalCost)}</td>

                <td style={bodyCellCentered}>{safeCurrency(row.offPeakCost)}</td>
                <td style={bodyCellCentered}>
                  {explicitOrDerivedPercent(
                    row.offPeakPercent,
                    row.offPeakCost,
                    row.totalCost
                  )}
                </td>

                <td style={bodyCellCentered}>{safeCurrency(row.peakCost)}</td>
                <td style={bodyCellCentered}>
                  {explicitOrDerivedPercent(
                    row.peakPercent,
                    row.peakCost,
                    row.totalCost
                  )}
                </td>

                <td style={bodyCellCentered}>{safeCurrency(row.standing)}</td>
                <td style={bodyCellCentered}>
                  {explicitOrDerivedPercent(
                    row.standingPercent,
                    row.standing,
                    row.totalCost
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}