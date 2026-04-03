import type React from "react";

export type DashboardTheme = {
  id: string;
  label: string;
  tokens: {
    colors: {
      bg: string;
      bgElevated: string;
      bgPanel: string;
      bgPanelAlt: string;
      border: string;
      text: string;
      textMuted: string;
      heading: string;
      primary: string;
      primarySoft: string;
      accent: string;
      success: string;
      warning: string;
      danger: string;

      summaryBlue: string;
      summaryGreen: string;
      summaryOrange: string;
      summaryCyan: string;
      summaryPurple: string;
      summarySlate: string;

      chartBlue: string;
      chartBlueFill: string;
      chartGreen: string;
      chartOrange: string;
      chartCyan: string;
      chartPurple: string;
    };
    typography: {
      fontFamilyBase: string;
      fontFamilyHeading: string;
      fontFamilyMono: string;
      letterSpacingCaps: string;

      heroTitleSize: number;
      heroBodySize: number;
      sectionTitleSize: number;
      bodySize: number;
      smallSize: number;
      labelSize: number;
      tableSize: number;
      cardLabelSize: number;
      cardValueSize: number;
    };
    radii: {
      sm: number;
      md: number;
      lg: number;
      xl: number;
      pill: number;
    };
    spacing: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      glow: string;
    };
    chart: {
      tickFontSize: number;
      yAxisWidthCurrency: number;
      yAxisWidthKwh: number;
      smallHeight: number;
      mediumHeight: number;
      largeHeight: number;
    };
  };
  styles: {
    appShell: React.CSSProperties;
    pageContainer: React.CSSProperties;
    heroCard: React.CSSProperties;
    heroInnerGrid: React.CSSProperties;
    heroTitle: React.CSSProperties;
    heroBody: React.CSSProperties;
    heroMetaCard: React.CSSProperties;
    heroMetaTitle: React.CSSProperties;
    heroMetaBody: React.CSSProperties;
    panelCard: React.CSSProperties;
    sectionTitle: React.CSSProperties;
    bodyText: React.CSSProperties;
  };
  charts: {
    cartesianGridStroke: string;
  };
  tables: {
    dense: boolean;
    striped: boolean;
    hoverHighlight: boolean;
  };
  layout: {
    pageMaxWidth: string;
    sidebarWidth: string;
    contentGap: string;
    cardGap: string;
    uploadRow: React.CSSProperties;
    summaryGrid: React.CSSProperties;
    secondarySummaryGrid: React.CSSProperties;
    stackedSections: React.CSSProperties;
    twoColumnCharts: React.CSSProperties;
    detailedChartsGrid: React.CSSProperties;
    summarySectionSpacing: React.CSSProperties;
  };
  components: {
    themeSelector: {
      wrapper: React.CSSProperties;
      label: React.CSSProperties;
      select: React.CSSProperties;
      caret: React.CSSProperties;
    };
    summaryCard: {
      card: React.CSSProperties;
      accentBar: React.CSSProperties;
      glowOverlay: React.CSSProperties;
      label: React.CSSProperties;
      value: React.CSSProperties;
    };
    chartCard: {
      card: React.CSSProperties;
      title: React.CSSProperties;
      inner: React.CSSProperties;
    };
    uploadPanel: {
      section: React.CSSProperties;
      topRow: React.CSSProperties;
      title: React.CSSProperties;
      body: React.CSSProperties;
      ghostButton: React.CSSProperties;
      primaryButton: React.CSSProperties;
      optionChip: React.CSSProperties;
      statsGrid: React.CSSProperties;
      statCard: React.CSSProperties;
      statLabel: React.CSSProperties;
      statValue: React.CSSProperties;
      statBody: React.CSSProperties;
      issueBox: React.CSSProperties;
      issueTitle: React.CSSProperties;
      issueList: React.CSSProperties;
    };
    exportUploadPanel: {
      section: React.CSSProperties;
      topRow: React.CSSProperties;
      title: React.CSSProperties;
      body: React.CSSProperties;
      ghostButton: React.CSSProperties;
      primaryButton: React.CSSProperties;
      countCard: React.CSSProperties;
      countLabel: React.CSSProperties;
      countValue: React.CSSProperties;
    };
    tooltip: {
      container: React.CSSProperties;
      label: React.CSSProperties;
      row: React.CSSProperties;
      keyWrap: React.CSSProperties;
      dot: React.CSSProperties;
      keyText: React.CSSProperties;
      value: React.CSSProperties;
    };
    collapsibleSection: {
      wrapper: React.CSSProperties;
      headerButton: React.CSSProperties;
      title: React.CSSProperties;
      caret: React.CSSProperties;
      body: React.CSSProperties;
    };
    dataTable: {
      wrapper: React.CSSProperties;
      title: React.CSSProperties;
      intro: React.CSSProperties;
      tableWrap: React.CSSProperties;
      table: React.CSSProperties;
      headCell: React.CSSProperties;
      bodyCell: React.CSSProperties;
      rowAlt: React.CSSProperties;
    };
  };
};

export type ThemeDefinition = Omit<DashboardTheme, "id" | "label">;