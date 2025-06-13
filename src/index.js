import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
var rootElement = document.getElementById("root");
var root = ReactDOM.createRoot(rootElement);
root.render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
