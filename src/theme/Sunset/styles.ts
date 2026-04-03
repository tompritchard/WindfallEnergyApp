export const styles = {
  appShell: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f6efe9 0%, #fbe3d4 40%, #f4c7a1 100%)",
  },

  pageContainer: {}, // handled in layout

  panelCard: {
    background: "rgba(255,255,255,0.7)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.5)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    backdropFilter: "blur(10px)",
    padding: "20px",
  },

  heroCard: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,230,210,0.6))",
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,0.6)",
    padding: "28px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },

  heroInnerGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },

  heroTitle: {
    fontSize: "36px",
    fontWeight: 700,
    color: "#2a1f1b",
    marginBottom: "8px",
  },

  heroBody: {
    color: "#5c463d",
    fontSize: "15px",
  },

  heroMetaCard: {
    background: "rgba(255,255,255,0.6)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(255,255,255,0.5)",
  },

  heroMetaTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#8a6b5c",
    marginBottom: "8px",
  },

  heroMetaBody: {
    fontSize: "13px",
    color: "#2a1f1b",
    lineHeight: 1.5,
  },

  sectionTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#2a1f1b",
  },

  bodyText: {
    fontSize: "14px",
    color: "#5c463d",
  },
};