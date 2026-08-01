import React from "react";
import ReactDOM from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import { lightTheme } from "./theme/theme";
import App from "./App";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <FluentProvider theme={lightTheme} style={{ height: "100vh" }}>
        <App />
      </FluentProvider>
    </HashRouter>
  </React.StrictMode>,
);
