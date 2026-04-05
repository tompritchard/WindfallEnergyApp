import React from "react";
import type { DashboardTheme } from "../theme";
import type { ExportPreparedMonth } from "../types";
import { formatCurrency, formatKwh } from "../utils/formatters";

type ExportPrepTableProps = {
  exportPreparedMonths: ExportPreparedMonth[];
  exportFileNames: string[];
  theme: DashboardTheme;
};

function safeCurrency(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? formatCurrency(value)
    : "Pending";
}

function safeKwh(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? formatKwh(value)
    : "Pending";
}

export default function ExportPrepTable({
  exportPreparedMonths,
  exportFileNames,
  theme,
}: ExportPrepTableProps) {
  const ui = theme.components.dataTable;
  const safeRows = Array.isArray(exportPreparedMonths) ? exportPreparedMonths : [];

  const headCellCentered: React.CSSProperties = {
    ...ui.headCell,
    textAlign: "center",
    verticalAlign: "middle",
  };

  const bodyCellCentered: React.CSSProperties = {
    ...ui.bodyCell,
    textAlign: "center",
    verticalAlign: "middle",
  };

  const monthCell: React.CSSProperties = {
    ...ui.bodyCell,
    fontWeight: 700,
  };

  const importCostCell: React.CSSProperties = {
    ...bodyCellCentered,
    fontWeight: 700,
  };

  return (
    <section style={ui.wrapper}>
      <h2 style={ui.title}>Export / net position preparation</h2>

      <p style={ui.intro}>
        {exportFileNames.length > 0
          ? "Export files uploaded. Export revenue and inferred exported kWh are now included where data exists."
          : "Upload export files to populate monthly export revenue, inferred exported kWh, and running total."}
      </p>

      <div style={ui.tableWrap}>
        <table style={ui.table}>
          <thead>
            <tr>
              <th style={ui.headCell}>Month</th>
              <th style={headCellCentered}>Import Cost</th>
              <th style={headCellCentered}>Export Revenue</th>
              <th style={headCellCentered}>Exported kWh</th>
              <th style={headCellCentered}>Net Position</th>
              <th style={headCellCentered}>Running Total</th>
            </tr>
          </thead>

          <tbody>
            {safeRows.map((row, index) => (
              <tr
                key={`${row.displayMonth}-${index}`}
                style={index % 2 ? ui.rowAlt : undefined}
              >
                <td style={monthCell}>{row.displayMonth}</td>
                <td style={importCostCell}>{formatCurrency(row.importCost)}</td>
                <td style={bodyCellCentered}>{safeCurrency(row.exportRevenue)}</td>
                <td style={bodyCellCentered}>{safeKwh(row.exportKwh)}</td>
                <td style={bodyCellCentered}>{safeCurrency(row.netPosition)}</td>
                <td style={bodyCellCentered}>{safeCurrency(row.runningTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}