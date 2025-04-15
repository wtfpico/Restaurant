import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import StoreContextProvider from "./Context/StoreContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </StrictMode>
);