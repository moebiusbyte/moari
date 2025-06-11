import React from "react";
import ReactDOM from "react-dom/client";
import  App from "./App";
import "./index.css";
import salesRoutes from './routes/salesRoutes';

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
