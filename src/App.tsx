import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ExportPreparedMonth, MonthlyDataPoint, ParseIssue, StoredUsageRow, UsageRow } from "./types";
import {
  formatCurrency,
  formatDisplayDate,
  formatDisplayDateFromDate,
  formatKwh,
  monthKeyFromDate,
  monthKeyFromDisplayMonth,
  monthLabelFromDate,
  parseUkDateToMonthKey,
  safeFiniteNumber,
  sortMonthKeysAscending,
} from "./utils/formatters";
import {
  fromStoredUsageRow,
  parseCsvFile,
  toStoredUsageRow,
} from "./utils/parsing";
import {
  fromStoredExportRow,
  parseExportCsvFile,
  toStoredExportRow,
  type ExportRow,
} from "./utils/exportParsing";
import freeElectricityCredits from "./data/freeElectricityCredits";
import { SEED_EXPORT_MONTHS } from "./data/seedExportData";
import { TARIFF_PERIODS } from "./utils/tariffs";
import { deduplicateByKey } from "./utils/dedup";
import { useProcessedData } from "./hooks/useProcessedData";
import SummaryCard from "./components/SummaryCard";
import ChartCard from "./components/ChartCard";
import CustomTooltip from "./components/CustomTooltip";
import UploadPanel from "./components/UploadPanel";
import CostBreakdownTable from "./components/CostBreakdownTable";
import ExportPrepTable from "./components/ExportPrepTable";
import CollapsibleSection from "./components/CollapsibleSection";
import { defaultThemeId, getThemeById, themes } from "./theme";

const STORAGE_KEY = "windfall-energy-dashboard-state-v3";

type StoredDashboardState = {
  rows?: StoredUsageRow[];
  exportRows?: Array<{
    date: string;
    revenue: number;
    inferredKwh: number | null;
  }>;
  fileNames?: string[];
  exportFileNames?: string[];
  appendMode?: boolean;
  exportAppendMode?: boolean;
  selectedThemeId?: string;
};

export default function App() {
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [exportRows, setExportRows] = useState<ExportRow[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [exportFileNames, setExportFileNames] = useState<string[]>([]);
  const [issues, setIssues] = useState<ParseIssue[]>([]);
  const [exportIssues, setExportIssues] = useState<ParseIssue[]>([]);
  const [appendMode, setAppendMode] = useState<boolean>(true);
  const [exportAppendMode, setExportAppendMode] = useState<boolean>(true);
  const [mobileUploadVisible, setMobileUploadVisible] =
    useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [selectedThemeId, setSelectedThemeId] =
    useState<string>(defaultThemeId);
  const [hasRestoredState, setHasRestoredState] = useState<boolean>(false);

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const exportInputRef = useRef<HTMLInputElement | null>(null);

  const theme = getThemeById(selectedThemeId);

  const {
    summary,
    dailyData,
    monthlyData,
    hourlyData,
    peakSplitData,
    supplierComparison,
  } = useProcessedData(rows);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasRestoredState(true);
        return;
      }

      const parsed = JSON.parse(raw) as StoredDashboardState;

      const restoredRows = Array.isArray(parsed.rows)
        ? parsed.rows
            .map(fromStoredUsageRow)
            .filter((row): row is UsageRow => row !== null)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        : [];

      const restoredExportRows = Array.isArray(parsed.exportRows)
        ? parsed.exportRows
            .map(fromStoredExportRow)
            .filter((row): row is ExportRow => row !== null)
            .sort((a, b) => a.date.getTime() - b.date.getTime())
        : [];

      setRows(restoredRows);
      setExportRows(restoredExportRows);
      setFileNames(Array.isArray(parsed.fileNames) ? parsed.fileNames : []);
      setExportFileNames(
        Array.isArray(parsed.exportFileNames) ? parsed.exportFileNames : []
      );
      setAppendMode(
        typeof parsed.appendMode === "boolean" ? parsed.appendMode : true
      );
      setExportAppendMode(
        typeof parsed.exportAppendMode === "boolean" ? parsed.exportAppendMode : true
      );
      setSelectedThemeId(
        typeof parsed.selectedThemeId === "string"
          ? parsed.selectedThemeId
          : defaultThemeId
      );
      setIssues([]);
    } catch (error) {
      console.error("Failed to restore saved dashboard state", error);
      setRows([]);
      setExportRows([]);
      setFileNames([]);
      setExportFileNames([]);
      setIssues([]);
      setAppendMode(true);
      setExportAppendMode(true);
      setSelectedThemeId(defaultThemeId);
    } finally {
      setHasRestoredState(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredState) return;

    try {
      const payload: StoredDashboardState = {
        rows: rows.map(toStoredUsageRow),
        exportRows: exportRows.map(toStoredExportRow),
        fileNames,
        exportFileNames,
        appendMode,
        exportAppendMode,
        selectedThemeId,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to save dashboard state", error);
    }
  }, [
    rows,
    exportRows,
    fileNames,
    exportFileNames,
    appendMode,
    exportAppendMode,
    selectedThemeId,
    hasRestoredState,
  ]);

  useEffect(() => {
    document.body.style.background = "transparent";
  }, [theme]);

  useEffect(() => {
    const BREAKPOINT = 768;
    const handler = () => {
      const w = window.innerWidth;
      setWindowWidth((prev) => {
        const wasBelow = prev <= BREAKPOINT;
        const isBelow = w <= BREAKPOINT;
        return wasBelow !== isBelow ? w : prev;
      });
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Sync from server once after localStorage restore
  useEffect(() => {
    if (!hasRestoredState) return;

    async function syncFromServer() {
      try {
        const [importNames, exportNames] = await Promise.all([
          fetch("/api/import/list").then((r) => {
            if (!r.ok) throw new Error(`Server error: ${r.status}`);
            return r.json() as Promise<string[]>;
          }),
          fetch("/api/export/list").then((r) => {
            if (!r.ok) throw new Error(`Server error: ${r.status}`);
            return r.json() as Promise<string[]>;
          }),
        ]);

        if (importNames.length === 0 && exportNames.length === 0) return;

        const [importResults, exportResults] = await Promise.all([
          Promise.allSettled(
            importNames.map(async (name) => {
              const response = await fetch(`/api/import/file/${encodeURIComponent(name)}`);
              if (!response.ok) throw new Error(`Failed to fetch ${name}`);
              const blob = await response.blob();
              return parseCsvFile(new File([blob], name, { type: "text/csv" }));
            })
          ),
          Promise.allSettled(
            exportNames.map(async (name) => {
              const response = await fetch(`/api/export/file/${encodeURIComponent(name)}`);
              if (!response.ok) throw new Error(`Failed to fetch ${name}`);
              const blob = await response.blob();
              return parseExportCsvFile(new File([blob], name, { type: "text/csv" }));
            })
          ),
        ]);

        const importBatches = importResults
          .filter((r): r is PromiseFulfilledResult<UsageRow[]> => r.status === "fulfilled")
          .map((r) => r.value);
        const exportBatches = exportResults
          .filter((r): r is PromiseFulfilledResult<ExportRow[]> => r.status === "fulfilled")
          .map((r) => r.value);

        setRows(
          deduplicateByKey(importBatches.flat(), (row) => row.timestamp.toISOString()).sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          )
        );
        setFileNames(importNames.sort());
        setExportRows(
          deduplicateByKey(exportBatches.flat(), (row) => row.date.toISOString()).sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          )
        );
        setExportFileNames(exportNames.sort());
      } catch {
        // Server unavailable — localStorage state remains
      }
    }

    void syncFromServer();
  }, [hasRestoredState]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const files = Array.from(selectedFiles);
    const newIssues: ParseIssue[] = [];
    const parsedBatches: UsageRow[][] = [];

    for (const file of files) {
      try {
        const processed = await parseCsvFile(file);
        if (processed.length === 0) {
          newIssues.push({
            fileName: file.name,
            message: "No valid electricity rows were found in this file.",
          });
        }
        parsedBatches.push(processed);
      } catch (error) {
        newIssues.push({
          fileName: file.name,
          message:
            error instanceof Error ? error.message : "Unknown parsing error.",
        });
      }
    }

    const combinedNewRows = parsedBatches.flat();
    const baseRows = appendMode ? rows : [];

    const finalRows = deduplicateByKey(
      [...baseRows, ...combinedNewRows],
      (row) => row.timestamp.toISOString()
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const mergedFileNames = appendMode
      ? Array.from(
          new Set([...(fileNames ?? []), ...files.map((file) => file.name)])
        ).sort()
      : files.map((file) => file.name).sort();

    setRows(finalRows);
    setFileNames(mergedFileNames);
    setIssues(newIssues);

    // Persist to server
    const importForm = new FormData();
    for (const file of files) importForm.append("files", file);
    fetch("/api/import/upload", { method: "POST", body: importForm }).catch(
      () => {}
    );

    if (importInputRef.current) {
      importInputRef.current.value = "";
    }
  }

  async function handleExportFileUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const files = Array.from(selectedFiles);
    const newExportIssues: ParseIssue[] = [];
    const parsedBatches: ExportRow[][] = [];

    for (const file of files) {
      try {
        const processed = await parseExportCsvFile(file);
        if (processed.length === 0) {
          newExportIssues.push({
            fileName: file.name,
            message: "No valid export rows found.",
          });
        }
        parsedBatches.push(processed);
      } catch (error) {
        newExportIssues.push({
          fileName: file.name,
          message:
            error instanceof Error
              ? error.message
              : "Unknown export parsing error.",
        });
      }
    }

    setExportIssues(newExportIssues);

    const combinedNewRows = parsedBatches.flat();
    const baseRows = exportAppendMode ? exportRows : [];

    const finalRows = deduplicateByKey(
      [...baseRows, ...combinedNewRows],
      (row) => row.date.toISOString()
    ).sort((a, b) => a.date.getTime() - b.date.getTime());

    const baseFileNames = exportAppendMode ? (exportFileNames ?? []) : [];
    const merged = Array.from(
      new Set([...baseFileNames, ...files.map((file) => file.name)])
    ).sort();

    setExportRows(finalRows);
    setExportFileNames(merged);

    // Persist to server
    const exportForm = new FormData();
    for (const file of files) exportForm.append("files", file);
    fetch("/api/export/upload", { method: "POST", body: exportForm }).catch(
      () => {}
    );

    if (exportInputRef.current) {
      exportInputRef.current.value = "";
    }
  }

  function clearImportData() {
    setRows([]);
    setFileNames([]);
    setIssues([]);
    // The save useEffect re-runs automatically and writes the cleared state to localStorage
    fetch("/api/import/clear", { method: "DELETE" }).catch(() => {});
    if (importInputRef.current) importInputRef.current.value = "";
  }

  function clearExportData() {
    setExportRows([]);
    setExportFileNames([]);
    setExportIssues([]);
    // The save useEffect re-runs automatically and writes the cleared state to localStorage
    fetch("/api/export/clear", { method: "DELETE" }).catch(() => {});
    if (exportInputRef.current) exportInputRef.current.value = "";
  }

  const freeCreditByMonth = useMemo(() => {
    const map = new Map<string, number>();

    for (const item of freeElectricityCredits) {
      const key = parseUkDateToMonthKey(item.date);
      if (!key) continue;

      map.set(key, (map.get(key) ?? 0) + item.credit);
    }

    return map;
  }, []);

  const adjustedMonthlyData = useMemo(() => {
    return monthlyData.map((row: MonthlyDataPoint) => {
      const key = monthKeyFromDisplayMonth(row.displayMonth);
      const freeCredit = freeCreditByMonth.get(key) ?? 0;

      const originalPeakCost = safeFiniteNumber(row.peakCost);
      const originalOffPeakCost = safeFiniteNumber(row.offPeakCost);
      const originalStanding = safeFiniteNumber(row.standing);

      const adjustedPeakCost = Math.max(0, originalPeakCost - freeCredit);
      const adjustedTotalCost =
        originalOffPeakCost + adjustedPeakCost + originalStanding;

      const adjustedOffPeakPercent =
        adjustedTotalCost > 0
          ? (originalOffPeakCost / adjustedTotalCost) * 100
          : 0;

      const adjustedPeakPercent =
        adjustedTotalCost > 0 ? (adjustedPeakCost / adjustedTotalCost) * 100 : 0;

      const adjustedStandingPercent =
        adjustedTotalCost > 0 ? (originalStanding / adjustedTotalCost) * 100 : 0;

      return {
        ...row,
        totalCost: adjustedTotalCost,
        peakCost: adjustedPeakCost,
        offPeakPercent: adjustedOffPeakPercent,
        peakPercent: adjustedPeakPercent,
        standingPercent: adjustedStandingPercent,
      };
    });
  }, [monthlyData, freeCreditByMonth]);

  const exportPreparedMonths: ExportPreparedMonth[] = useMemo(() => {
    const importMonthMap = new Map<
      string,
      { displayMonth: string; importCost: number }
    >();

    for (const row of adjustedMonthlyData) {
      const key = monthKeyFromDisplayMonth(row.displayMonth);
      importMonthMap.set(key, {
        displayMonth: row.displayMonth,
        importCost: safeFiniteNumber(row.totalCost),
      });
    }

    const exportMonthMap = new Map<
      string,
      { displayMonth: string; exportRevenue: number; exportKwh: number }
    >();

    for (const row of exportRows) {
      const key = monthKeyFromDate(row.date);
      const existing = exportMonthMap.get(key);

      if (existing) {
        existing.exportRevenue += row.revenue;
        existing.exportKwh += row.inferredKwh ?? 0;
      } else {
        exportMonthMap.set(key, {
          displayMonth: monthLabelFromDate(row.date),
          exportRevenue: row.revenue,
          exportKwh: row.inferredKwh ?? 0,
        });
      }
    }

    for (const seed of SEED_EXPORT_MONTHS) {
      if (!exportMonthMap.has(seed.key)) {
        exportMonthMap.set(seed.key, {
          displayMonth: seed.displayMonth,
          exportRevenue: seed.exportRevenue,
          exportKwh: seed.exportKwh,
        });
      }
    }

    const allKeys = Array.from(
      new Set([...importMonthMap.keys(), ...exportMonthMap.keys()])
    ).sort(sortMonthKeysAscending);

    let runningTotal = 0;

    return allKeys.map((key) => {
      const importMonth = importMonthMap.get(key);
      const exportMonth = exportMonthMap.get(key);

      const importCost = importMonth?.importCost ?? 0;
      const exportRevenue = exportMonth ? exportMonth.exportRevenue : null;
      const exportKwh = exportMonth ? exportMonth.exportKwh : null;
      const netPosition =
        exportRevenue === null ? null : importCost - exportRevenue;

      if (netPosition !== null) {
        runningTotal += netPosition;
      }

      return {
        displayMonth:
          importMonth?.displayMonth ?? exportMonth?.displayMonth ?? key,
        importCost,
        exportRevenue,
        exportKwh,
        netPosition,
        runningTotal,
      };
    });
  }, [adjustedMonthlyData, exportRows]);

  const monthlyNetChartData = useMemo(() => {
    const importMap = new Map<
      string,
      {
        displayMonth: string;
        importCost: number;
        importKwh: number;
      }
    >();

    for (const row of adjustedMonthlyData) {
      const key = monthKeyFromDisplayMonth(row.displayMonth);
      importMap.set(key, {
        displayMonth: row.displayMonth,
        importCost: safeFiniteNumber(row.totalCost),
        importKwh: safeFiniteNumber(row.kwh),
      });
    }

    const exportMap = new Map<
      string,
      {
        displayMonth: string;
        exportRevenue: number;
        exportKwh: number;
      }
    >();

    for (const row of exportPreparedMonths) {
      const key = monthKeyFromDisplayMonth(row.displayMonth);

      exportMap.set(key, {
        displayMonth: row.displayMonth,
        exportRevenue: safeFiniteNumber(row.exportRevenue),
        exportKwh: safeFiniteNumber(row.exportKwh),
      });
    }

    const allKeys = Array.from(
      new Set([...importMap.keys(), ...exportMap.keys()])
    ).sort(sortMonthKeysAscending);

    return allKeys.map((key) => {
      const importMonth = importMap.get(key);
      const exportMonth = exportMap.get(key);

      const displayMonth =
        importMonth?.displayMonth ?? exportMonth?.displayMonth ?? key;

      const importCost = importMonth?.importCost ?? 0;
      const importKwh = importMonth?.importKwh ?? 0;
      const exportRevenue = exportMonth?.exportRevenue ?? 0;
      const exportKwh = exportMonth?.exportKwh ?? 0;

      return {
        displayMonth,
        netCost: importCost - exportRevenue,
        netKwh: importKwh - exportKwh,
      };
    });
  }, [adjustedMonthlyData, exportPreparedMonths]);

  const isMobile = windowWidth <= 768;

  const safeFileNames = useMemo(
    () => (Array.isArray(fileNames) ? fileNames : []),
    [fileNames]
  );
  const safeExportFileNames = useMemo(
    () => (Array.isArray(exportFileNames) ? exportFileNames : []),
    [exportFileNames]
  );
  const safeIssues = useMemo(
    () => (Array.isArray(issues) ? issues : []),
    [issues]
  );

  if (!theme) return null;

  const safeThemes = themes; // themes is always a stable array from the module

  const compactHeroCardStyle: React.CSSProperties = {
    ...theme.styles.heroCard,
    padding: "10px 16px",
  };

  const compactHeroInnerGridStyle: React.CSSProperties = {
    ...theme.styles.heroInnerGrid,
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.7fr) minmax(340px, 1fr)",
    gap: "10px",
    alignItems: isMobile ? "start" : "center",
  };

  const compactHeroTitleStyle: React.CSSProperties = {
    ...theme.styles.heroTitle,
    fontSize: isMobile ? "1.3rem" : "1.75rem",
    lineHeight: 1.1,
    marginBottom: "4px",
  };

  const compactHeroBodyStyle: React.CSSProperties = {
    ...theme.styles.heroBody,
    marginBottom: "6px",
    fontSize: "0.8rem",
    lineHeight: 1.2,
    display: isMobile ? "none" : undefined,
  };

  const compactHeroMetaCardStyle: React.CSSProperties = {
    ...theme.styles.heroMetaCard,
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    minHeight: isMobile ? "auto" : "100%",
  };

  const tariffGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "6px",
    marginTop: "6px",
  };

  const tariffBlockStyle: React.CSSProperties = {
    borderRadius: "10px",
    padding: "7px 10px",
    background: "rgba(255,255,255,0.35)",
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: "0.78rem",
    lineHeight: 1.3,
  };

  const topWorkingRowStyle: React.CSSProperties = isMobile
    ? { display: "grid", gridTemplateColumns: "1fr", gap: "8px" }
    : rows.length > 0
    ? { display: "grid", gridTemplateColumns: "28fr 72fr", gap: "8px", alignItems: "stretch" }
    : { ...theme.layout.uploadRow };

  const utilityColumnStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: isMobile ? "auto auto" : "1fr 1fr",
    gap: "8px",
    order: isMobile ? 3 : undefined,
  };

  const summaryGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))",
    gap: "8px",
    alignItems: "stretch",
    height: isMobile ? "auto" : "100%",
  };

  const sideBySideTableRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: "10px",
    alignItems: "start",
  };

  const fourColumnChartsStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))",
    gap: "10px",
    alignItems: "start",
  };

  const detailedChartsGridStyle: React.CSSProperties = isMobile
    ? { display: "grid", gridTemplateColumns: "1fr", gap: "10px", alignItems: "start" }
    : theme.layout.detailedChartsGrid;

  return (
    <div style={theme.styles.appShell}>
      <style>{`
        .windfall-table-compact table {
          border-collapse: separate !important;
          border-spacing: 0 !important;
          width: 100%;
        }

        .windfall-table-compact th,
        .windfall-table-compact td {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
          line-height: 1.2 !important;
        }

        /* Off-Peak: cyan — 3 shading levels */
        .windfall-cost-table table thead tr:first-child th:nth-child(3) {
          background: rgba(86, 204, 242, 0.32) !important;
        }
        .windfall-cost-table table thead tr:nth-child(2) th:nth-child(1),
        .windfall-cost-table table thead tr:nth-child(2) th:nth-child(2) {
          background: rgba(86, 204, 242, 0.20) !important;
        }
        .windfall-cost-table table tbody td:nth-child(3),
        .windfall-cost-table table tbody td:nth-child(4) {
          background: rgba(86, 204, 242, 0.09) !important;
        }

        /* Peak: orange — 3 shading levels */
        .windfall-cost-table table thead tr:first-child th:nth-child(4) {
          background: rgba(242, 153, 74, 0.32) !important;
        }
        .windfall-cost-table table thead tr:nth-child(2) th:nth-child(3),
        .windfall-cost-table table thead tr:nth-child(2) th:nth-child(4) {
          background: rgba(242, 153, 74, 0.20) !important;
        }
        .windfall-cost-table table tbody td:nth-child(5),
        .windfall-cost-table table tbody td:nth-child(6) {
          background: rgba(242, 153, 74, 0.09) !important;
        }

        /* Standing Charge: purple — 3 shading levels */
        .windfall-cost-table table thead tr:first-child th:nth-child(5) {
          background: rgba(187, 107, 217, 0.32) !important;
        }
        .windfall-cost-table table thead tr:nth-child(2) th:nth-child(5),
        .windfall-cost-table table thead tr:nth-child(2) th:nth-child(6) {
          background: rgba(187, 107, 217, 0.20) !important;
        }
        .windfall-cost-table table tbody td:nth-child(7),
        .windfall-cost-table table tbody td:nth-child(8) {
          background: rgba(187, 107, 217, 0.09) !important;
        }

        .windfall-export-table table thead th:nth-child(2),
        .windfall-export-table table tbody td:nth-child(2),
        .windfall-export-table table thead th:nth-child(4),
        .windfall-export-table table tbody td:nth-child(4),
        .windfall-export-table table thead th:nth-child(6),
        .windfall-export-table table tbody td:nth-child(6) {
          background: rgba(80, 160, 255, 0.08) !important;
        }

        .windfall-export-table table thead th:nth-child(3),
        .windfall-export-table table tbody td:nth-child(3),
        .windfall-export-table table thead th:nth-child(5),
        .windfall-export-table table tbody td:nth-child(5) {
          background: rgba(80, 160, 255, 0.04) !important;
        }

        .windfall-compact-panel .windfall-stat-card {
          min-height: 44px !important;
        }

        /* ── Mobile upload toggle button ─────────────────────────── */
        .wf-mobile-upload-toggle button {
          width: 100%;
          border: 1px solid rgba(91, 62, 46, 0.18);
          background: rgba(255, 255, 255, 0.5);
          color: #2c211d;
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          letter-spacing: 0.02em;
        }
      `}</style>

      <div style={theme.styles.pageContainer}>
        <div style={compactHeroCardStyle}>
          <div style={compactHeroInnerGridStyle}>
            <div>
              <h1 style={compactHeroTitleStyle}>
                15 Windfall Electricity Dashboard
              </h1>
              <p style={compactHeroBodyStyle}>
                This webapp presents analysis of the electricity usage and cost
                for 15 Windfall Way since export of solar produced electricity
                was introduced at the start of November 2025.
              </p>

              <div style={theme.components.themeSelector.wrapper}>
                <label
                  htmlFor="theme-selector-inline"
                  style={theme.components.themeSelector.label}
                >
                  Theme
                </label>

                <div style={{ position: "relative" }}>
                  <select
                    id="theme-selector-inline"
                    value={selectedThemeId}
                    onChange={(e) => setSelectedThemeId(e.target.value)}
                    style={theme.components.themeSelector.select}
                    disabled={safeThemes.length === 0}
                  >
                    {safeThemes.length === 0 ? (
                      <option value="">No themes available</option>
                    ) : (
                      safeThemes.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))
                    )}
                  </select>

                  <div style={theme.components.themeSelector.caret}>▼</div>
                </div>
              </div>
            </div>

            <div style={compactHeroMetaCardStyle}>
              <div style={theme.styles.heroMetaTitle}>
                Tariff Periods Configured
              </div>

              <div style={tariffGridStyle}>
                {TARIFF_PERIODS.map((period) => {
                  const fmt = (h: number) =>
                    `${String(h).padStart(2, "0")}:00`;
                  const offPeakRange = `${fmt(period.offPeakStartHour)}–${fmt(period.offPeakEndHour)}`;
                  const endLabel = period.end ?? "onwards";
                  return (
                    <div key={period.name} style={tariffBlockStyle}>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          opacity: 0.7,
                          marginBottom: "3px",
                        }}
                      >
                        {period.name}
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        Off-peak {offPeakRange} | {(period.offPeak * 100).toFixed(2)}p
                      </div>
                      <div style={{ marginTop: "3px" }}>
                        Peak other times | {(period.peak * 100).toFixed(2)}p
                      </div>
                      <div style={{ marginTop: "3px" }}>
                        Standing {(period.standing * 100).toFixed(2)}p/day
                      </div>
                      <div style={{ marginTop: "3px", fontSize: "0.72rem", opacity: 0.6 }}>
                        Until {endLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={topWorkingRowStyle}>
          {isMobile && rows.length > 0 && (
            <div className="wf-mobile-upload-toggle" style={{ order: 2 }}>
              <button
                type="button"
                onClick={() => setMobileUploadVisible((v) => !v)}
              >
                {mobileUploadVisible
                  ? "▲ Hide upload panels"
                  : "▼ Show upload panels"}
              </button>
            </div>
          )}

          <div
            style={{
              ...utilityColumnStyle,
              display:
                isMobile && rows.length > 0 && !mobileUploadVisible
                  ? "none"
                  : "grid",
            }}
          >
            <UploadPanel
              title="Import data"
              clearLabel="Clear import data"
              appendMode={appendMode}
              onAppendModeChange={setAppendMode}
              onClearData={clearImportData}
              onFileChange={handleFileUpload}
              inputRef={importInputRef}
              fileNames={safeFileNames}
              intervalCount={rows.length}
              firstDate={
                summary.firstDate ? formatDisplayDate(summary.firstDate) : null
              }
              lastDate={
                summary.lastDate ? formatDisplayDate(summary.lastDate) : null
              }
              issues={safeIssues}
              theme={theme}
            />

            <UploadPanel
              title="Export data"
              clearLabel="Clear export data"
              inputRef={exportInputRef}
              onFileChange={handleExportFileUpload}
              onClearData={clearExportData}
              fileNames={safeExportFileNames}
              intervalCount={exportRows.length}
              firstDate={exportRows.length > 0 ? formatDisplayDateFromDate(exportRows[0].date) : null}
              lastDate={exportRows.length > 0 ? formatDisplayDateFromDate(exportRows[exportRows.length - 1].date) : null}
              appendMode={exportAppendMode}
              onAppendModeChange={setExportAppendMode}
              issues={exportIssues}
              theme={theme}
            />
          </div>

          {rows.length > 0 && (
            <div
              className="windfall-summary-compact"
              style={{ height: isMobile ? "auto" : "100%", order: isMobile ? 1 : undefined }}
            >
              <div style={summaryGridStyle}>
                <SummaryCard
                  title="Total Usage"
                  value={formatKwh(summary.totalKwh)}
                  accent={theme.tokens.colors.summaryBlue}
                  theme={theme}
                />
                <SummaryCard
                  title="Estimated Total Cost"
                  value={formatCurrency(summary.totalCost)}
                  accent={theme.tokens.colors.summaryGreen}
                  theme={theme}
                />
                <SummaryCard
                  title="Peak Cost"
                  value={formatCurrency(summary.peakCost)}
                  accent={theme.tokens.colors.summaryOrange}
                  theme={theme}
                />
                <SummaryCard
                  title="Off-Peak Cost"
                  value={formatCurrency(summary.offPeakCost)}
                  accent={theme.tokens.colors.summaryCyan}
                  theme={theme}
                />
                <SummaryCard
                  title="Standing Charge"
                  value={formatCurrency(summary.standingChargeTotal)}
                  accent={theme.tokens.colors.summaryPurple}
                  theme={theme}
                />
                <SummaryCard
                  title="Days Loaded"
                  value={String(summary.dayCount)}
                  accent={theme.tokens.colors.summarySlate}
                  theme={theme}
                />
                <SummaryCard
                  title="Average Daily Cost"
                  value={formatCurrency(summary.averageDailyCost)}
                  accent={theme.tokens.colors.summaryGreen}
                  theme={theme}
                />
                <SummaryCard
                  title="Average Daily Usage"
                  value={formatKwh(summary.averageDailyUsage)}
                  accent={theme.tokens.colors.summaryBlue}
                  theme={theme}
                />
                <SummaryCard
                  title="Peak Usage"
                  value={formatKwh(summary.peakKwh)}
                  accent={theme.tokens.colors.summaryOrange}
                  theme={theme}
                />
                <SummaryCard
                  title="Off-Peak Usage"
                  value={formatKwh(summary.offPeakKwh)}
                  accent={theme.tokens.colors.summaryCyan}
                  theme={theme}
                />
                <SummaryCard
                  title="First Date"
                  value={
                    summary.firstDate
                      ? formatDisplayDate(summary.firstDate)
                      : "-"
                  }
                  accent={theme.tokens.colors.summarySlate}
                  theme={theme}
                />
                <SummaryCard
                  title="Last Date"
                  value={
                    summary.lastDate ? formatDisplayDate(summary.lastDate) : "-"
                  }
                  accent={theme.tokens.colors.summarySlate}
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div style={theme.styles.panelCard}>
            <p style={theme.styles.sectionTitle as React.CSSProperties}>
              No data loaded yet. Start by selecting your import CSV files.
            </p>
          </div>
        ) : (
          <>
            <div style={sideBySideTableRowStyle}>
              <div className="windfall-table-compact windfall-cost-table">
                <CostBreakdownTable
                  monthlyData={adjustedMonthlyData}
                  theme={theme}
                />
              </div>

              <div className="windfall-table-compact windfall-export-table">
                <ExportPrepTable
                  exportPreparedMonths={exportPreparedMonths}
                  exportFileNames={safeExportFileNames}
                  theme={theme}
                />
              </div>
            </div>

            <div style={fourColumnChartsStyle}>
              <ChartCard title="Monthly Cost Breakdown" compact theme={theme}>
                <ResponsiveContainer
                  width="100%"
                  height={theme.tokens.chart.mediumHeight}
                >
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.charts.cartesianGridStroke}
                    />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                    />
                    <YAxis
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                      unit=" £"
                      width={theme.tokens.chart.yAxisWidthCurrency}
                    />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Legend />
                    <Bar
                      dataKey="offPeakCost"
                      name="Off-Peak Cost"
                      stackId="cost"
                      fill={theme.tokens.colors.chartCyan}
                    />
                    <Bar
                      dataKey="peakCost"
                      name="Peak Cost"
                      stackId="cost"
                      fill={theme.tokens.colors.chartOrange}
                    />
                    <Bar
                      dataKey="standing"
                      name="Standing Charge"
                      stackId="cost"
                      fill={theme.tokens.colors.chartPurple}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Usage Totals" compact theme={theme}>
                <ResponsiveContainer
                  width="100%"
                  height={theme.tokens.chart.mediumHeight}
                >
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.charts.cartesianGridStroke}
                    />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                    />
                    <YAxis
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                      unit=" kWh"
                      width={theme.tokens.chart.yAxisWidthKwh}
                    />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Legend />
                    <Bar
                      dataKey="kwh"
                      name="Usage"
                      fill={theme.tokens.colors.chartBlue}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Net Cost" compact theme={theme}>
                <ResponsiveContainer
                  width="100%"
                  height={theme.tokens.chart.mediumHeight}
                >
                  <BarChart data={monthlyNetChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.charts.cartesianGridStroke}
                    />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                    />
                    <YAxis
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                      unit=" £"
                      width={theme.tokens.chart.yAxisWidthCurrency}
                    />
                    <ReferenceLine y={0} stroke="rgba(0,0,0,0.35)" />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Legend />
                    <Bar
                      dataKey="netCost"
                      name="Net Cost"
                      fill={theme.tokens.colors.chartGreen}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Monthly Net Usage" compact theme={theme}>
                <ResponsiveContainer
                  width="100%"
                  height={theme.tokens.chart.mediumHeight}
                >
                  <BarChart data={monthlyNetChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.charts.cartesianGridStroke}
                    />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                    />
                    <YAxis
                      tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                      unit=" kWh"
                      width={theme.tokens.chart.yAxisWidthKwh}
                    />
                    <ReferenceLine y={0} stroke="rgba(0,0,0,0.35)" />
                    <Tooltip content={<CustomTooltip theme={theme} />} />
                    <Legend />
                    <Bar
                      dataKey="netKwh"
                      name="Net Usage"
                      fill={theme.tokens.colors.chartBlue}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>

            <CollapsibleSection
              title="Detailed Daily Charts"
              storageKey="windfall-detailed-charts-open"
              defaultOpen={false}
              theme={theme}
            >
              <div style={detailedChartsGridStyle}>
                <ChartCard title="Daily Usage" compact theme={theme}>
                  <ResponsiveContainer
                    width="100%"
                    height={theme.tokens.chart.largeHeight}
                  >
                    <AreaChart data={dailyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.charts.cartesianGridStroke}
                      />
                      <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                        unit=" kWh"
                        width={theme.tokens.chart.yAxisWidthKwh}
                      />
                      <Tooltip content={<CustomTooltip theme={theme} />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="kwh"
                        name="Usage"
                        stroke={theme.tokens.colors.chartBlue}
                        fill={theme.tokens.colors.chartBlueFill}
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Peak Vs Off-Peak Split" compact theme={theme}>
                  <ResponsiveContainer
                    width="100%"
                    height={theme.tokens.chart.largeHeight}
                  >
                    <PieChart>
                      <Pie
                        data={peakSplitData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={86}
                        label={({ name, percent }) =>
                          `${name} ${(Number(percent) * 100).toFixed(1)}%`
                        }
                      >
                        <Cell fill={theme.tokens.colors.chartCyan} />
                        <Cell fill={theme.tokens.colors.chartOrange} />
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatKwh(Number(value ?? 0))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Daily Cost" compact theme={theme}>
                  <ResponsiveContainer
                    width="100%"
                    height={theme.tokens.chart.mediumHeight}
                  >
                    <LineChart data={dailyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.charts.cartesianGridStroke}
                      />
                      <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                        minTickGap={24}
                      />
                      <YAxis
                        tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                        unit=" £"
                        width={theme.tokens.chart.yAxisWidthCurrency}
                      />
                      <Tooltip content={<CustomTooltip theme={theme} />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalCost"
                        name="Total Cost"
                        stroke={theme.tokens.colors.chartGreen}
                        strokeWidth={3}
                        dot={dailyData.length <= 12}
                      />
                      <Line
                        type="monotone"
                        dataKey="peakCost"
                        name="Peak Cost"
                        stroke={theme.tokens.colors.chartOrange}
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="offPeakCost"
                        name="Off-Peak Cost"
                        stroke={theme.tokens.colors.chartCyan}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Hourly Usage Profile" compact theme={theme}>
                  <ResponsiveContainer
                    width="100%"
                    height={theme.tokens.chart.smallHeight}
                  >
                    <BarChart data={hourlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.charts.cartesianGridStroke}
                      />
                      <XAxis
                        dataKey="hour"
                        interval={1}
                        angle={-45}
                        textAnchor="end"
                        height={64}
                        tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                      />
                      <YAxis
                        tick={{ fontSize: theme.tokens.chart.tickFontSize }}
                        unit=" kWh"
                        width={theme.tokens.chart.yAxisWidthKwh}
                      />
                      <Tooltip content={<CustomTooltip theme={theme} />} />
                      <Bar
                        dataKey="kwh"
                        name="Usage"
                        fill={theme.tokens.colors.chartPurple}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </CollapsibleSection>

            {supplierComparison && (
              <div
                style={{
                  ...theme.styles.panelCard,
                  ...theme.layout.summarySectionSpacing,
                }}
              >
                <h2 style={theme.styles.sectionTitle}>
                  Supplier Cost Comparison
                </h2>
                <div style={theme.styles.bodyText}>
                  Supplier usage cost in CSV:{" "}
                  <strong>
                    {formatCurrency(supplierComparison.supplierUsageCost)}
                  </strong>
                  <br />
                  App recalculated usage cost:{" "}
                  <strong>{formatCurrency(summary.usageCost)}</strong>
                  <br />
                  Difference:{" "}
                  <strong>
                    {formatCurrency(supplierComparison.difference)}
                  </strong>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}