import Papa from "papaparse";
import type { CsvRow, StoredUsageRow, UsageRow } from "../types";
import { formatDateKey, formatMonthKey } from "./formatters";
import { getTariffForTimestamp } from "./tariffs";

export function parseUkTimestamp(value: string): Date | null {
  if (!value) return null;

  const parts = value.trim().split(" ");
  if (parts.length !== 2) return null;

  const [timePart, datePart] = parts;
  const datePieces = datePart.split("/");
  if (datePieces.length !== 3) return null;

  const [day, month, year] = datePieces;
  const isoLike = `${year}-${month}-${day}T${timePart}`;
  const parsed = new Date(isoLike);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function processCsvRows(rows: CsvRow[], fileName: string): UsageRow[] {
  return rows
    .filter((row) => {
      const ts = row.Timestamp?.trim();
      const kwh = row["Electricity consumption (kWh)"]?.trim();
      return Boolean(ts && kwh);
    })
    .map((row) => {
      const timestamp = parseUkTimestamp(row.Timestamp!.trim());
      if (!timestamp) return null;

      const kwh = Number.parseFloat(row["Electricity consumption (kWh)"] || "");
      if (Number.isNaN(kwh)) return null;

      const supplierCostRaw = row["Electricity cost (£)"]?.trim();
      const supplierCost = supplierCostRaw
        ? Number.parseFloat(supplierCostRaw)
        : undefined;

      const { isOffPeak, tariff, standing, tariffPeriodName } =
        getTariffForTimestamp(timestamp);

      return {
        sourceFile: fileName,
        timestamp,
        dateKey: formatDateKey(timestamp),
        monthKey: formatMonthKey(timestamp),
        kwh,
        hour: timestamp.getHours(),
        isOffPeak,
        tariff,
        standing,
        tariffPeriodName,
        calculatedCost: kwh * tariff,
        supplierCost:
          supplierCost !== undefined && !Number.isNaN(supplierCost)
            ? supplierCost
            : undefined,
      } satisfies UsageRow;
    })
    .filter((row) => row !== null) as UsageRow[];
}

export function parseCsvFile(file: File): Promise<UsageRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: { data: CsvRow[] }) => {
        try {
          resolve(processCsvRows(results.data, file.name));
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => reject(error),
    });
  });
}

export function toStoredUsageRow(row: UsageRow): StoredUsageRow {
  return {
    ...row,
    timestamp: row.timestamp.toISOString(),
  };
}

export function fromStoredUsageRow(row: StoredUsageRow): UsageRow | null {
  const timestamp = new Date(row.timestamp);
  if (Number.isNaN(timestamp.getTime())) return null;

  return {
    ...row,
    timestamp,
  };
}