import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Register } from "./register-v2"; // ← Importamos como named export

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Register />
  </StrictMode>
);
