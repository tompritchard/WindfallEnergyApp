import type { DashboardTheme } from "./types";

export function getThemeCssVariables(theme: DashboardTheme): Record<string, string> {
  const colors = theme.tokens?.colors;
  const typography = theme.tokens?.typography;
  const radii = theme.tokens?.radii;
  const shadows = theme.tokens?.shadows;
  const effects = theme.tokens?.effects;
  const layout = theme.layout;

  const primary = colors?.primary ?? "#4f46e5";
  const accent = colors?.accent ?? "#22c55e";
  const success = colors?.success ?? "#22c55e";
  const warning = colors?.warning ?? "#f59e0b";

  const chartSeries = colors?.chartSeries ?? [primary, accent, success, warning];

  return {
    "--theme-bg": colors?.bg ?? "#0b1020",
    "--theme-bg-elevated": colors?.bgElevated ?? "#121a2b",
    "--theme-bg-panel": colors?.bgPanel ?? "#182235",
    "--theme-bg-panel-alt": colors?.bgPanelAlt ?? "#24324a",
    "--theme-border": colors?.border ?? "rgba(255,255,255,0.08)",
    "--theme-text": colors?.text ?? "#f8fafc",
    "--theme-text-muted": colors?.textMuted ?? "rgba(248,250,252,0.7)",
    "--theme-heading": colors?.heading ?? "#ffffff",
    "--theme-primary": primary,
    "--theme-primary-soft": colors?.primarySoft ?? "rgba(79,70,229,0.15)",
    "--theme-accent": accent,
    "--theme-success": success,
    "--theme-warning": warning,
    "--theme-danger": colors?.danger ?? "#ef4444",
    "--theme-chart-grid": colors?.chartGrid ?? "rgba(255,255,255,0.08)",
    "--theme-chart-axis": colors?.chartAxis ?? "rgba(255,255,255,0.45)",
    "--theme-chart-series-1": chartSeries[0] ?? primary,
    "--theme-chart-series-2": chartSeries[1] ?? accent,
    "--theme-chart-series-3": chartSeries[2] ?? success,
    "--theme-chart-series-4": chartSeries[3] ?? warning,

    "--theme-font-family-base":
      typography?.fontFamilyBase ??
      '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--theme-font-family-heading":
      typography?.fontFamilyHeading ??
      '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    "--theme-font-family-mono":
      typography?.fontFamilyMono ??
      '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
    "--theme-letter-spacing-caps": typography?.letterSpacingCaps ?? "0.08em",

    "--theme-radius-sm": radii?.sm ?? "8px",
    "--theme-radius-md": radii?.md ?? "12px",
    "--theme-radius-lg": radii?.lg ?? "20px",
    "--theme-radius-xl": radii?.xl ?? "28px",
    "--theme-radius-pill": radii?.pill ?? "999px",

    "--theme-shadow-sm": shadows?.sm ?? "0 4px 12px rgba(0,0,0,0.12)",
    "--theme-shadow-md": shadows?.md ?? "0 10px 24px rgba(0,0,0,0.18)",
    "--theme-shadow-lg": shadows?.lg ?? "0 16px 40px rgba(0,0,0,0.24)",
    "--theme-shadow-glow": shadows?.glow ?? "0 0 0 1px rgba(255,255,255,0.04)",

    "--theme-backdrop-blur": effects?.backdropBlur ?? "12px",
    "--theme-panel-opacity": String(effects?.panelOpacity ?? 0.92),

    "--theme-page-max-width": layout?.pageMaxWidth ?? "1440px",
    "--theme-sidebar-width": layout?.sidebarWidth ?? "280px",
    "--theme-content-gap": layout?.contentGap ?? "24px",
    "--theme-card-gap": layout?.cardGap ?? "24px",
  };
}