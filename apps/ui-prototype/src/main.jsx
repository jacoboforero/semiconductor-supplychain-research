import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import V2App from "./v2/V2App";
import V3App from "./v3/V3App";
import "./styles.css";

const searchParams = new URLSearchParams(window.location.search);
const uiVersion = searchParams.get("ui");
const RootApp = uiVersion === "v1" ? App : uiVersion === "v2" ? V2App : V3App;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RootApp />
    </ErrorBoundary>
  </React.StrictMode>
);
