// src/assets/chatbotSettingsStyle.js
const chatbotSettingsStyle = (theme) => ({
  container: {
    direction: "rtl",
    textAlign: "right",
  },
  card: {
    overflow: "visible",
  },
  cardHeader: {
    background: "linear-gradient(195deg, #49a3f1, #1A73E8)",
    color: "#fff",
    padding: "15px",
    marginTop: "-20px",
    borderRadius: "5px",
    boxShadow: "0 4px 20px 0 rgba(0, 0, 0, 0.14)",
  },
  tabsWrapper: {
    marginTop: "10px",
  },
  tab: {
    fontWeight: "500",
    fontSize: "0.875rem",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  formGroup: {
    marginBottom: "16px",
  },
  editor: {
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    minHeight: "150px",
  },
  alertBox: {
    borderRadius: "4px",
    marginBottom: "16px",
  },
  tooltip: {
    fontSize: "12px",
  },
  chipContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginBottom: "8px",
  },
});

export default chatbotSettingsStyle;
