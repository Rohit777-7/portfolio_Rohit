import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import { themeShifraWidget } from "./lib/shifraTheme";

// Restyle the embedded AI assistant as soon as it appears
themeShifraWidget();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
