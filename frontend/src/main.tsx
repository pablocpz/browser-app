import App from "./pages/app/App"; //prev import App from "@/pages/app/App";

import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css"; //prev import "@/styles/index.css";


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
