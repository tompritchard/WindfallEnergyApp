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

export function summariseFileNameList(files: unknown): string {
  if (!Array.isArray(files) || files.length === 0) return "No files loaded";
  if (files.length === 1) return String(files[0] ?? "");
  if (files.length <= 3) return files.map((f) => String(f ?? "")).join(", ");
  return `${files.length} files loaded`;
}