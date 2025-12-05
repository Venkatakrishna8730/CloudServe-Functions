import { useEffect } from "react";
import { useParams, Link, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchFunctions } from "../store/slices/functionsSlice";
import {
  Activity,
  Code2,
  FileText,
  Settings,
  Terminal,
  ArrowLeft,
} from "lucide-react";
import clsx from "clsx";

const FunctionDetailsPage = () => {
  const { functionId } = useParams(); // This is actually the function name based on current routing
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
      <div className="flex items-center justify-center h-full text-text-secondary">
        Loading function details...
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
      {/* Header */}
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
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span
                className={`px-2 py-0.5 rounded bg-success/20  ${
                  func.isActive ? "text-success" : "text-gray-500"
                } font-bold text-xs`}
              >
                {func.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          {/* Action buttons could go here */}
        </div>
      </header>

      {/* Tabs */}
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

      {/* Content */}
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
