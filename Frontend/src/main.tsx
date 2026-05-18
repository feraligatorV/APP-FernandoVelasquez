import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

const theme = createTheme({
  palette: {
    primary: { main: "#ea580c" },
    secondary: { main: "#0f172a" },
    background: { default: "#fff7ed" }
  },
  shape: { borderRadius: 14 }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
