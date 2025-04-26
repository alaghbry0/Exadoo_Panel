// src/theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4A90E2",
    },
    secondary: {
      main: "#7ED321",
    },
    background: {
      default: "#F8F9FC",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
          textTransform: "none",
          fontSize: "1rem",
          padding: "8px 16px",
        },
      },
    },
  },
});
