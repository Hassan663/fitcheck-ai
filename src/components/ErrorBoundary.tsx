import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { buttonClasses } from "./ui/variants";

interface State {
  error: Error | null;
}

const RELOAD_KEY = "fitcheck:chunk-reload";

/** A stale tab can request route chunks that no longer exist after a rebuild. */
function isChunkLoadError(e: Error) {
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk/i.test(e.message);
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(RELOAD_KEY)) {
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
      return;
    }
    console.error("FitCheck crashed:", error, info.componentStack);
  }

  componentDidMount() {
    sessionStorage.removeItem(RELOAD_KEY);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div role="alert" className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-line bg-surface p-6 text-center shadow-card">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-danger/15 text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-semibold">Something went wrong</h1>
          <p className="mt-1 text-sm text-muted">This page failed to load. Reloading usually fixes it.</p>
          <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-fg/[0.04] p-3 text-left text-xs text-subtle">{error.message}</pre>
          <button type="button" onClick={() => window.location.reload()} className={buttonClasses("primary", "md", "mt-5")}>
            <RotateCw className="h-4 w-4" /> Reload page
          </button>
        </div>
      </div>
    );
  }
}
