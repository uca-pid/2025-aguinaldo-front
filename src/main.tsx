import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MachineProvider } from "./providers/MachineProvider";
import { AuthProvider } from "./providers/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <MachineProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </MachineProvider>
  </AuthProvider>
);
