import Papa from "papaparse";
import type { CsvRow, StoredUsageRow, UsageRow } from "../types";
import { formatDateKey, formatMonthKey } from "./formatters";
import { getTariffForTimestamp } from "./tariffs";

// Returns the UK UTC offset in hours: 0 for GMT (winter), 1 for BST (summer).
// BST runs from the last Sunday of March to the last Sunday of October.
// The check is date-granular; the two half-hour intervals on DST boundary days
// are an acceptable approximation for a half-hourly energy dashboard.
function getUkOffsetHours(year: number, month: number, day: number): number {
  function lastSundayOf(y: number, m: number): number {
    const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const dow = new Date(Date.UTC(y, m, lastDay)).getUTCDay();
    return lastDay - dow;
  }
  const d = Date.UTC(year, month - 1, day);
  const bstStart = Date.UTC(year, 2, lastSundayOf(year, 2)); // last Sun of March
  const bstEnd = Date.UTC(year, 9, lastSundayOf(year, 9));   // last Sun of October
  return d >= bstStart && d < bstEnd ? 1 : 0;
}

export function parseUkTimestamp(value: string): Date | null {
  if (!value) return null;

  const parts = value.trim().split(" ");
  if (parts.length !== 2) return null;

  const [timePart, datePart] = parts;
  const datePieces = datePart.split("/");
  if (datePieces.length !== 3) return null;

  const [day, month, year] = datePieces;
  // Normalise to HH:MM:SS before appending Z so the string is always valid ISO-8601
  const timeFull = timePart.split(":").length >= 3 ? timePart : `${timePart}:00`;
  // Parse as UTC, then subtract the UK wall-clock offset so the stored instant
  // reflects the correct UTC moment for Europe/London local time.
  const utcMs = new Date(`${year}-${month}-${day}T${timeFull}Z`).getTime();
  if (Number.isNaN(utcMs)) return null;

  const offsetMs = getUkOffsetHours(Number(year), Number(month), Number(day)) * 3_600_000;
  return new Date(utcMs - offsetMs);
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