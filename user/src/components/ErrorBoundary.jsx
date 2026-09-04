// ─────────────────────────────────────────────────────────────
//  src/components/ErrorBoundary.jsx
//
//  Catches errors thrown while RENDERING. Without one, a single bad
//  `.map()` on an undefined field unmounts the whole React tree and
//  the user is left staring at a blank white page.
//
//  Note: error boundaries only catch render / lifecycle errors. Errors
//  inside event handlers and async code (an API call in onClick) are
//  handled by notifyError() instead.
// ─────────────────────────────────────────────────────────────

import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import C from "../styles/colors";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep the real stack in the console for developers.
    console.error("Render error caught by ErrorBoundary:", error, info);
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === "function"
        ? this.props.fallback(error, this.reset)
        : this.props.fallback;
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: C.surface, fontFamily: "Sora, sans-serif" }}
      >
        <div
          className="w-full max-w-md text-center px-8 py-10 rounded-3xl"
          style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: C.dangerLight }}
          >
            <AlertTriangle size={30} color={C.danger} />
          </div>

          <h1
            className="text-xl font-bold mb-2"
            style={{ color: C.textPrimary }}
          >
            Something went wrong
          </h1>
          <p className="text-sm mb-6" style={{ color: C.textMuted }}>
            This page ran into an unexpected problem. Your data is safe — try
            reloading, or head back to the dashboard.
          </p>

          {import.meta.env.MODE === "development" && (
            <pre
              className="text-[11px] text-left p-3 rounded-xl mb-6 overflow-auto max-h-40"
              style={{
                background: C.dangerLight,
                color: "#991B1B",
                whiteSpace: "pre-wrap",
              }}
            >
              {error?.stack ?? String(error)}
            </pre>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              }}
            >
              <RefreshCw size={15} />
              Reload
            </button>
            <button
              onClick={() => {
                this.reset();
                window.location.href = "/";
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold"
              style={{
                background: "transparent",
                border: `1.5px solid ${C.border}`,
                color: C.textSecondary,
              }}
            >
              <Home size={15} />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
