export type ExportRow = {
  date: Date;
  revenue: number;
  inferredKwh: number | null;
};

type StoredExportRow = {
  date: string;
  revenue: number;
  inferredKwh: number | null;
};

const SEG_RATE_GBP_PER_KWH = 0.24;
const SEG_START = new Date("2025-11-01T00:00:00");
const SEG_END_EXCLUSIVE = new Date("2026-11-01T00:00:00");

function parseUkDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseMoney(value: string): number | null {
  const cleaned = value.replace(/[£,\s]/g, "").trim();
  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferKwh(date: Date, revenue: number): number | null {
  if (date < SEG_START || date >= SEG_END_EXCLUSIVE) {
    return null;
  }

  return revenue / SEG_RATE_GBP_PER_KWH;
}

export async function parseExportCsvFile(file: File): Promise<ExportRow[]> {
  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Export CSV appears to be empty.");
  }

  const header = lines[0].split(",").map((cell) => cell.trim());
  const dateIndex = header.findIndex(
    (cell) => cell.toLowerCase() === "timestamp"
  );
  const soldIndex = header.findIndex(
    (cell) => cell.toLowerCase() === "electricity sold (£)"
  );

  if (dateIndex === -1 || soldIndex === -1) {
    throw new Error(
      "Expected export CSV columns: Timestamp, Electricity sold (£)."
    );
  }

  const rows: ExportRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cells = lines[i].split(",").map((cell) => cell.trim());
    const rawDate = cells[dateIndex];
    const rawRevenue = cells[soldIndex];

    if (!rawDate) continue;

    const date = parseUkDate(rawDate);
    if (!date) continue;

    const revenue = parseMoney(rawRevenue ?? "");
    if (revenue === null) continue;

    rows.push({
      date,
      revenue,
      inferredKwh: inferKwh(date, revenue),
    });
  }

  return rows.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function toStoredExportRow(row: ExportRow): StoredExportRow {
  return {
    date: row.date.toISOString(),
    revenue: row.revenue,
    inferredKwh: row.inferredKwh,
  };
}

export function fromStoredExportRow(value: unknown): ExportRow | null {
  if (!value || typeof value !== "object") return null;

  const obj = value as Record<string, unknown>;
  if (typeof obj["date"] !== "string" || typeof obj["revenue"] !== "number") {
    return null;
  }

  const date = new Date(obj["date"]);
  if (Number.isNaN(date.getTime())) return null;

  return {
    date,
    revenue: obj["revenue"],
    inferredKwh:
      typeof obj["inferredKwh"] === "number" ? obj["inferredKwh"] : null,
  };
}