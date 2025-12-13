import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchFunctions } from "../store/slices/functionsSlice";
import {
  Plus,
  Search,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import CloudDeployAnimation from "../components/ui/CloudDeployAnimation";

const FunctionsListPage = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.functions);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchFunctions());

    
    const interval = setInterval(() => {
      const hasDeploying = list.some(
        (f) => f.status === "deploying" || f.status === "pending"
      );
      if (hasDeploying && !loading) {
        dispatch(fetchFunctions());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch, list, loading]);

  const filteredList = list.filter((func) =>
    func.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Functions</h1>
          <p className="text-text-secondary">
            Manage your deployed serverless functions.
          </p>
        </div>
        <Link
          to="/functions/create"
          className="bg-primary text-background font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={20} />
          Create Function
        </Link>
      </header>

      {}
      <div className="mb-6 flex items-center gap-4 bg-card p-2 rounded-lg border border-border-light max-w-md">
        <Search size={20} className="text-text-muted ml-2" />
        <input
          type="text"
          placeholder="Search functions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-none focus:outline-none text-text-primary w-full"
        />
      </div>

      {}
      {loading && list.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-4">
          <CloudDeployAnimation size="lg" />
          <p className="animate-pulse">Loading functions...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 text-error">{error}</div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border-light">
          <h3 className="text-xl font-bold mb-2">
            {searchQuery ? "No matching functions found" : "No functions yet"}
          </h3>
          {!searchQuery && (
            <Link
              to="/functions/create"
              className="inline-flex items-center gap-2 bg-primary text-background font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors"
            >
              <Plus size={20} />
              Create Function
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((func) => (
            <div
              key={func._id}
              className="bg-card p-6 rounded-xl border border-border-light hover:border-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group relative"
            >
              <Link
                to={`/functions/${func.name}/overview`}
                className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1 pr-8 md:pr-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-bold group-hover:text-primary transition-colors">
                      {func.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-success/20 text-success">
                      v{func.version}
                    </span>

                    {}
                    <span
                      className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
                        func.isActive
                          ? "border-success/30 text-success bg-success/5"
                          : "border-text-muted/30 text-text-muted bg-text-muted/5"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          func.isActive ? "bg-success" : "bg-text-muted"
                        }`}
                      />
                      {func.isActive ? "Enabled" : "Disabled"}
                    </span>

                    {}
                    {(func.status === "deploying" ||
                      func.status === "pending") && (
                      <span className="flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                        <Loader2 size={12} className="animate-spin" />
                        Deploying
                      </span>
                    )}
                    {func.status === "failed" && (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-error font-bold bg-error/10 px-2 py-0.5 rounded">
                          <XCircle size={12} />
                          Failed
                        </span>
                      </div>
                    )}
                    {func.status === "active" && (
                      <span className="flex items-center gap-1 text-xs text-success font-bold bg-success/10 px-2 py-0.5 rounded">
                        <CheckCircle size={12} />
                        Deployed
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                    <span>
                      Last executed:{" "}
                      {func.stats?.lastExecuted
                        ? new Date(func.stats.lastExecuted).toLocaleString()
                        : "Never"}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>Invocations: {func.stats?.executed || 0}</span>
                  </div>
                </div>
              </Link>

              <div className="flex items-center gap-3 absolute top-6 right-6 md:static">
                <Link
                  to={`/functions/${func.name}/overview`}
                  className="p-2 text-text-secondary hover:text-primary hover:bg-background rounded-lg transition-colors group-hover:translate-x-1 duration-300"
                  title="View Details"
                >
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunctionsListPage;
