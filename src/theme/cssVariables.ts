import type { DashboardTheme } from "./types";

export function getThemeCssVariables(theme: DashboardTheme): Record<string, string> {
  const colors = theme.tokens?.colors;
  const typography = theme.tokens?.typography;
  const radii = theme.tokens?.radii;
  const shadows = theme.tokens?.shadows;
  const layout = theme.layout;

  const primary = colors?.primary ?? "#4f46e5";
  const accent = colors?.accent ?? "#22c55e";
  const success = colors?.success ?? "#22c55e";
  const warning = colors?.warning ?? "#f59e0b";

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
    "--theme-chart-grid": "rgba(255,255,255,0.08)",
    "--theme-chart-axis": "rgba(255,255,255,0.45)",
    "--theme-chart-series-1": primary,
    "--theme-chart-series-2": accent,
    "--theme-chart-series-3": success,
    "--theme-chart-series-4": warning,

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

    "--theme-radius-sm": radii?.sm != null ? `${radii.sm}px` : "8px",
    "--theme-radius-md": radii?.md != null ? `${radii.md}px` : "12px",
    "--theme-radius-lg": radii?.lg != null ? `${radii.lg}px` : "20px",
    "--theme-radius-xl": radii?.xl != null ? `${radii.xl}px` : "28px",
    "--theme-radius-pill": radii?.pill != null ? `${radii.pill}px` : "999px",

    "--theme-shadow-sm": shadows?.sm ?? "0 4px 12px rgba(0,0,0,0.12)",
    "--theme-shadow-md": shadows?.md ?? "0 10px 24px rgba(0,0,0,0.18)",
    "--theme-shadow-lg": shadows?.lg ?? "0 16px 40px rgba(0,0,0,0.24)",
    "--theme-shadow-glow": shadows?.glow ?? "0 0 0 1px rgba(255,255,255,0.04)",

    "--theme-backdrop-blur": "12px",
    "--theme-panel-opacity": "0.92",

    "--theme-page-max-width": layout?.pageMaxWidth ?? "1440px",
    "--theme-sidebar-width": layout?.sidebarWidth ?? "280px",
    "--theme-content-gap": layout?.contentGap ?? "24px",
    "--theme-card-gap": layout?.cardGap ?? "24px",
  };
}