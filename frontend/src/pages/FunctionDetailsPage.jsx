import { useEffect } from "react";
import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFunctions,
  redeployFunction,
} from "../store/slices/functionsSlice";
import {
  Activity,
  Code2,
  FileText,
  Settings,
  Terminal,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import CloudDeployAnimation from "../components/ui/CloudDeployAnimation";

const FunctionDetailsPage = () => {
  const { functionId } = useParams(); 
  const location = useLocation();
  const dispatch = useDispatch();
  const { list, loading } = useSelector((state) => state.functions);

  const func = list.find((f) => f.name === functionId);

  useEffect(() => {
    if (list.length === 0 && !loading) {
      dispatch(fetchFunctions());
    }
  }, [dispatch, list.length, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary gap-4">
        <CloudDeployAnimation size="lg" />
        <p className="animate-pulse">Loading function details...</p>
      </div>
    );
  }

  if (!func && !loading && list.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary">
        <p className="text-xl mb-4">Function not found</p>
        <Link to="/functions" className="text-primary hover:underline">
          Back to Functions
        </Link>
      </div>
    );
  }

  if (!func) return null;

  const tabs = [
    { name: "Overview", path: "overview", icon: Activity },
    { name: "Editor", path: "editor", icon: Code2 },
    { name: "Logs", path: "logs", icon: Terminal },
    { name: "Settings", path: "settings", icon: Settings },
  ];

  const isFixedLayout =
    location.pathname.includes("/editor") ||
    location.pathname.includes("/logs");

  return (
    <div
      className={`flex flex-col min-h-full ${isFixedLayout ? "md:h-full" : ""}`}
    >
      {}
      <header className="mb-6 shrink-0">
        <Link
          to="/functions"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Functions
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-text-primary mb-1">
              {func.name}
            </h1>
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              {}
              <span
                className={`px-2 py-0.5 rounded border ${
                  func.isActive
                    ? "border-success/30 text-success bg-success/5"
                    : "border-text-muted/30 text-text-muted bg-text-muted/5"
                } font-bold text-xs flex items-center gap-1.5`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    func.isActive ? "bg-success" : "bg-text-muted"
                  }`}
                />
                {func.isActive ? "Enabled" : "Disabled"}
              </span>

              {}
              {(func.status === "deploying" || func.status === "pending") && (
                <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                  <Loader2 size={12} className="animate-spin" />
                  Deploying...
                </span>
              )}
              {func.status === "failed" && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-error font-bold bg-error/10 px-2 py-0.5 rounded">
                    <XCircle size={12} />
                    Deployment Failed
                  </span>
                  {func.version > 1 && (
                    <span className="text-xs text-text-secondary italic">
                      ⚠️ Serving previous version
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(redeployFunction(func._id));
                    }}
                    className="flex items-center gap-1 text-xs bg-primary text-background px-2 py-1 rounded hover:bg-primary-hover transition-colors"
                    title="Retry Deployment"
                  >
                    <RotateCcw size={10} />
                    Retry
                  </button>
                </div>
              )}
              {func.status === "active" && (
                <span className="flex items-center gap-1 text-xs text-success font-bold bg-success/10 px-2 py-0.5 rounded">
                  <CheckCircle size={12} />
                  Deployed
                </span>
              )}
            </div>
          </div>
          {}
        </div>
      </header>

      {}
      <div className="flex items-center gap-1 border-b border-border-light mb-6 overflow-x-auto shrink-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.includes(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-heavy"
              )}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {}
      <div
        className={`flex-1 min-h-0 flex flex-col ${
          isFixedLayout ? "md:h-full" : ""
        }`}
      >
        <Outlet context={{ func }} />
      </div>
    </div>
  );
};

export default FunctionDetailsPage;
