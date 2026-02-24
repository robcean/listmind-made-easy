import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply persisted theme before first render to avoid flash
try {
  const stored = JSON.parse(localStorage.getItem("listmind-store") || "{}");
  const theme = stored?.state?.theme ?? "dark";
  document.documentElement.classList.toggle("dark", theme === "dark");
} catch {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
