import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MachineProvider } from "./providers/MachineProvider";

createRoot(document.getElementById("root")!).render(
  <MachineProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </MachineProvider>
);
