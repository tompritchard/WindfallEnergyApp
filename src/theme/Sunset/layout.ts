const layout = {
  pageMaxWidth: "1760px",
  sidebarWidth: "280px",
  contentGap: "10px",
  cardGap: "10px",

  uploadRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    alignItems: "stretch",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  },

  secondarySummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  },

  stackedSections: {
    display: "grid",
    gap: "20px",
  },

  twoColumnCharts: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    alignItems: "start",
  },

  detailedChartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    alignItems: "start",
  },

  summarySectionSpacing: {
    marginTop: "6px",
  },
};

export default layout;