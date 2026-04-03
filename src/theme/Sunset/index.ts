import type { ThemeDefinition } from "../types";
import tokens from "./tokens";
import layout from "./layout";
import components from "./components";

const appBackground =
  "linear-gradient(135deg, #fbf3ec 0%, #f7e4d2 42%, #efc08b 100%)";

const theme: ThemeDefinition = {
  tokens,

  styles: {
    appShell: {
      minHeight: "100vh",
      color: tokens.colors.text,
      fontFamily: tokens.typography.fontFamilyBase,
      background: appBackground,
      padding: "16px",
    },

    pageContainer: {
      maxWidth: layout.pageMaxWidth,
      width: "100%",
      margin: "0 auto",
      padding: "8px 8px 20px",
      display: "grid",
      gap: "20px",
    },

    heroCard: {
      background:
        "linear-gradient(135deg, rgba(255,248,242,0.88), rgba(250,229,210,0.72))",
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: `${tokens.radii.xl}px`,
      boxShadow: tokens.shadows.lg,
      padding: "26px",
    },

    heroInnerGrid: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 2fr) minmax(320px, 1fr)",
      gap: "24px",
      alignItems: "start",
    },

    heroTitle: {
      margin: 0,
      fontFamily: tokens.typography.fontFamilyHeading,
      fontSize: `${tokens.typography.heroTitleSize}px`,
      lineHeight: 1.03,
      fontWeight: 800,
      color: tokens.colors.heading,
      letterSpacing: "-0.03em",
    },

    heroBody: {
      marginTop: "12px",
      marginBottom: "18px",
      fontSize: `${tokens.typography.heroBodySize}px`,
      lineHeight: 1.6,
      color: tokens.colors.textSecondary ?? tokens.colors.textMuted,
      maxWidth: "820px",
    },

    heroMetaCard: {
      background: "rgba(255,250,245,0.72)",
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: `${tokens.radii.lg}px`,
      padding: "18px 20px",
      boxShadow: tokens.shadows.md,
    },

    heroMetaTitle: {
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color: tokens.colors.textMuted,
      marginBottom: "10px",
    },

    heroMetaBody: {
      fontSize: "14px",
      lineHeight: 1.75,
      color: tokens.colors.text,
    },

    panelCard: {
      background: "rgba(255,248,242,0.76)",
      border: `1px solid ${tokens.colors.border}`,
      borderRadius: `${tokens.radii.lg}px`,
      boxShadow: tokens.shadows.md,
      padding: "20px",
    },

    sectionTitle: {
      margin: 0,
      fontSize: `${tokens.typography.sectionTitleSize}px`,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: tokens.typography.letterSpacingCaps,
      color: tokens.colors.textMuted,
    },

    bodyText: {
      fontSize: `${tokens.typography.bodySize}px`,
      lineHeight: 1.65,
      color: tokens.colors.text,
    },
  },

  charts: {
    cartesianGridStroke: "rgba(91,62,46,0.10)",
  },

  tables: {
    dense: false,
    striped: true,
    hoverHighlight: true,
  },

  layout,

  components,
};

export default theme;