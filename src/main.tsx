import React from "react";
import ReactDOM from "react-dom/client";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import App from "./App";
 
const customTheme = createTheme({
  palette: {primary: { main: '#1976d2'}}
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider theme={customTheme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,

);
