import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { API_BASE } from "./lib/api";

// Wake up Render backend on first page load (fire-and-forget, no UI impact)
fetch(`${API_BASE}/health`).catch(() => {});

createRoot(document.getElementById("root")).render(<App />);
