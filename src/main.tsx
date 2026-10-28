import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./index.css";
import { App } from "./App";
import { ThemeProvider } from "./context/ThemeProvider";
import { StoreProvider } from "./context/StoreProvider";
import { ToastProvider } from "./components/ui/Toast";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <StoreProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </StoreProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
