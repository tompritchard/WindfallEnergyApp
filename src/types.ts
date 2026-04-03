export type CsvRow = {
  Timestamp?: string;
  "Electricity consumption (kWh)"?: string;
  "Electricity cost (£)"?: string;
};

export type TariffPeriod = {
  name: string;
  start: string;
  end: string | null;
  offPeak: number;
  peak: number;
  standing: number;
  offPeakStartHour: number;
  offPeakEndHour: number;
};

export type UsageRow = {
  sourceFile: string;
  timestamp: Date;
  dateKey: string;
  monthKey: string;
  kwh: number;
  hour: number;
  isOffPeak: boolean;
  tariff: number;
  standing: number;
  tariffPeriodName: string;
  calculatedCost: number;
  supplierCost?: number;
};

export type StoredUsageRow = {
  sourceFile: string;
  timestamp: string;
  dateKey: string;
  monthKey: string;
  kwh: number;
  hour: number;
  isOffPeak: boolean;
  tariff: number;
  standing: number;
  tariffPeriodName: string;
  calculatedCost: number;
  supplierCost?: number;
};

export type ParseIssue = {
  fileName: string;
  message: string;
};

export type DailyDataPoint = {
  date: string;
  displayDate: string;
  kwh: number;
  usageCost: number;
  totalCost: number;
  offPeakKwh: number;
  peakKwh: number;
  offPeakCost: number;
  peakCost: number;
  standing: number;
};

export type MonthlyDataPoint = {
  month: string;
  displayMonth: string;
  kwh: number;
  totalCost: number;
  usageCost: number;
  standing: number;
  offPeakKwh: number;
  peakKwh: number;
  offPeakCost: number;
  peakCost: number;
};

export type DashboardSummary = {
  totalKwh: number;
  usageCost: number;
  standingChargeTotal: number;
  totalCost: number;
  offPeakKwh: number;
  peakKwh: number;
  offPeakCost: number;
  peakCost: number;
  dayCount: number;
  firstDate: string | null;
  lastDate: string | null;
  averageDailyUsage: number;
  averageDailyCost: number;
};

export type SupplierComparison = {
  supplierUsageCost: number;
  difference: number;
};

export type ExportPreparedMonth = {
  month: string;
  importCost: number;
  exportRevenue: null;
  netPosition: null;
};