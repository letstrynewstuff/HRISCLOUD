import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./components/AuthContext.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import GlobalErrorProvider from "./components/GlobalErrorProvider.jsx";

import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <BrowserRouter>
      <GlobalErrorProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalErrorProvider>
    </BrowserRouter>
  </ErrorBoundary>,
);
