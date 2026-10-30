import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";
import "./style.css";
const queryClient = new QueryClient();
const theme = createTheme({
  palette: { mode: "light", primary: { main: "#3157d5" }, secondary: { main: "#64748b" }, background: { default: "#f5f7fb" } },
  shape: { borderRadius: 12 },
  typography: { fontFamily: "Inter, system-ui, Arial, sans-serif", h4: { fontWeight: 800 }, h5: { fontWeight: 750 } }
});
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><QueryClientProvider client={queryClient}><ThemeProvider theme={theme}><CssBaseline /><BrowserRouter><App /></BrowserRouter></ThemeProvider></QueryClientProvider></React.StrictMode>
);
