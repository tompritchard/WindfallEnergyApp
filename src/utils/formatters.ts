export function formatCurrency(value: number): string {
  return `£${value.toFixed(2)}`;
}

export function formatKwh(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

export function formatDateKey(timestamp: Date): string {
  return timestamp.toISOString().slice(0, 10);
}

export function formatMonthKey(timestamp: Date): string {
  return timestamp.toISOString().slice(0, 7);
}

export function formatDisplayDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
}

export function formatDisplayDateFromDate(date: Date): string {
  return formatDisplayDate(formatDateKey(date));
}

export function formatDisplayMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const monthIndex = Number(month) - 1;

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${monthNames[monthIndex]} ${year}`;
}

export function monthKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function monthLabelFromDate(date: Date): string {
  return date.toLocaleString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function monthKeyFromDisplayMonth(displayMonth: string): string {
  const [monthLabel, yearLabel] = displayMonth.trim().split(/\s+/);
  const monthMap: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const month = monthMap[monthLabel] ?? "01";
  const year = /^\d{4}$/.test(yearLabel ?? "") ? yearLabel : "1970";
  return `${year}-${month}`;
}

export function sortMonthKeysAscending(a: string, b: string): number {
  return a.localeCompare(b);
}

export function parseUkDateToMonthKey(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, , mm, yyyy] = match;
  return `${yyyy}-${mm}`;
}

export function safeFiniteNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function summariseFileNameList(files: unknown): string {
  if (!Array.isArray(files) || files.length === 0) return "No files loaded";
  if (files.length === 1) return String(files[0] ?? "");
  if (files.length <= 3) return files.map((f) => String(f ?? "")).join(", ");
  return `${files.length} files loaded`;
}