import type { TariffPeriod } from "../types";
import { formatDateKey } from "./formatters";

export const TARIFF_PERIODS: TariffPeriod[] = [
  {
    name: "Nov 2025 to Mar 2026",
    start: "2025-11-01",
    end: "2026-03-31",
    offPeak: 0.0856,
    peak: 0.228,
    standing: 0.5953,
    offPeakStartHour: 0,
    offPeakEndHour: 5,
  },
  {
    name: "Apr 2026 onwards",
    start: "2026-04-01",
    end: null,
    offPeak: 0.0548,
    peak: 0.2043,
    standing: 0.6251,
    offPeakStartHour: 23,
    offPeakEndHour: 6,
  },
];

export function getTariffPeriod(timestamp: Date): TariffPeriod {
  const dateKey = formatDateKey(timestamp);

  const period = TARIFF_PERIODS.find((candidate) => {
    const afterStart = dateKey >= candidate.start;
    const beforeEnd = candidate.end === null || dateKey <= candidate.end;
    return afterStart && beforeEnd;
  });

  if (!period) {
    throw new Error(`No tariff period found for ${dateKey}`);
  }

  return period;
}

export function isHourWithinOffPeak(
  hour: number,
  startHour: number,
  endHour: number
): boolean {
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

export function getTariffForTimestamp(timestamp: Date): {
  isOffPeak: boolean;
  tariff: number;
  standing: number;
  tariffPeriodName: string;
} {
  const hour = timestamp.getUTCHours();
  const period = getTariffPeriod(timestamp);
  const isOffPeak = isHourWithinOffPeak(
    hour,
    period.offPeakStartHour,
    period.offPeakEndHour
  );

  return {
    isOffPeak,
    tariff: isOffPeak ? period.offPeak : period.peak,
    standing: period.standing,
    tariffPeriodName: period.name,
  };
}