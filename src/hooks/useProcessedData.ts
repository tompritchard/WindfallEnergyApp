import { useMemo } from "react";
import type {
  DailyDataPoint,
  DashboardSummary,
  MonthlyDataPoint,
  SupplierComparison,
  UsageRow,
} from "../types";
import {
  formatDisplayDate,
  formatDisplayMonth,
} from "../utils/formatters";

export function useProcessedData(rows: UsageRow[]) {
  const dayStandingCharges = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      if (!map.has(row.dateKey)) {
        map.set(row.dateKey, row.standing);
      }
    }
    return map;
  }, [rows]);

  const summary = useMemo<DashboardSummary>(() => {
    let totalKwh = 0;
    let usageCost = 0;
    let offPeakKwh = 0;
    let peakKwh = 0;
    let offPeakCost = 0;
    let peakCost = 0;

    for (const row of rows) {
      totalKwh += row.kwh;
      usageCost += row.calculatedCost;
      if (row.isOffPeak) {
        offPeakKwh += row.kwh;
        offPeakCost += row.calculatedCost;
      } else {
        peakKwh += row.kwh;
        peakCost += row.calculatedCost;
      }
    }

    const standingChargeTotal = Array.from(dayStandingCharges.values()).reduce(
      (sum, value) => sum + value,
      0
    );
    const totalCost = usageCost + standingChargeTotal;
    const firstDate = rows.length > 0 ? rows[0].dateKey : null;
    const lastDate = rows.length > 0 ? rows[rows.length - 1].dateKey : null;

    return {
      totalKwh,
      usageCost,
      standingChargeTotal,
      totalCost,
      offPeakKwh,
      peakKwh,
      offPeakCost,
      peakCost,
      dayCount: dayStandingCharges.size,
      firstDate,
      lastDate,
      averageDailyUsage:
        dayStandingCharges.size > 0 ? totalKwh / dayStandingCharges.size : 0,
      averageDailyCost:
        dayStandingCharges.size > 0 ? totalCost / dayStandingCharges.size : 0,
    };
  }, [rows, dayStandingCharges]);

  const dailyData = useMemo<DailyDataPoint[]>(() => {
    const byDay = new Map<string, DailyDataPoint>();

    for (const row of rows) {
      const existing = byDay.get(row.dateKey) ?? {
        date: row.dateKey,
        displayDate: formatDisplayDate(row.dateKey),
        kwh: 0,
        usageCost: 0,
        totalCost: 0,
        offPeakKwh: 0,
        peakKwh: 0,
        offPeakCost: 0,
        peakCost: 0,
        standing: row.standing,
      };

      existing.kwh += row.kwh;
      existing.usageCost += row.calculatedCost;
      existing.standing = row.standing;

      if (row.isOffPeak) {
        existing.offPeakKwh += row.kwh;
        existing.offPeakCost += row.calculatedCost;
      } else {
        existing.peakKwh += row.kwh;
        existing.peakCost += row.calculatedCost;
      }

      byDay.set(row.dateKey, existing);
    }

    return Array.from(byDay.values())
      .map((day) => ({
        ...day,
        totalCost: day.usageCost + day.standing,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  const monthlyData = useMemo<MonthlyDataPoint[]>(() => {
    const byMonth = new Map<string, MonthlyDataPoint>();

    for (const day of dailyData) {
      const monthKey = day.date.slice(0, 7);

      const existing = byMonth.get(monthKey) ?? {
        month: monthKey,
        displayMonth: formatDisplayMonth(monthKey),
        kwh: 0,
        totalCost: 0,
        usageCost: 0,
        standing: 0,
        offPeakKwh: 0,
        peakKwh: 0,
        offPeakCost: 0,
        peakCost: 0,
      };

      existing.kwh += day.kwh;
      existing.totalCost += day.totalCost;
      existing.usageCost += day.usageCost;
      existing.standing += day.standing;
      existing.offPeakKwh += day.offPeakKwh;
      existing.peakKwh += day.peakKwh;
      existing.offPeakCost += day.offPeakCost;
      existing.peakCost += day.peakCost;

      byMonth.set(monthKey, existing);
    }

    return Array.from(byMonth.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }, [dailyData]);

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      kwh: 0,
    }));

    for (const row of rows) {
      hours[row.hour].kwh += row.kwh;
    }

    return hours;
  }, [rows]);

  const peakSplitData = useMemo(
    () => [
      { name: "Off-Peak", value: summary.offPeakKwh },
      { name: "Peak", value: summary.peakKwh },
    ],
    [summary.offPeakKwh, summary.peakKwh]
  );

  const supplierComparison = useMemo<SupplierComparison | null>(() => {
    const rowsWithSupplierCost = rows.filter(
      (row) => row.supplierCost !== undefined
    );
    if (rowsWithSupplierCost.length === 0) return null;

    const supplierUsageCost = rowsWithSupplierCost.reduce(
      (sum, row) => sum + (row.supplierCost ?? 0),
      0
    );

    return {
      supplierUsageCost,
      difference: summary.usageCost - supplierUsageCost,
    };
  }, [rows, summary.usageCost]);

  return {
    summary,
    dailyData,
    monthlyData,
    hourlyData,
    peakSplitData,
    supplierComparison,
  };
}