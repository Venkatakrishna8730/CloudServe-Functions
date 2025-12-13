import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RefreshCw,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api, { ROUTES } from "../../utils/api";

const FunctionLogs = () => {
  const { func } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchLogs = async () => {
    if (!func?._id) return;
    setLoading(true);
    try {
      const { data } = await api.get(ROUTES.LOGS.GET(func._id));
      setLogs(data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const confirmClearLogs = async () => {
    try {
      await api.delete(ROUTES.LOGS.CLEAR(func._id));
      setLogs([]);
      setShowClearConfirm(false);
    } catch (err) {
      setError("Failed to clear logs");
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); 
    return () => clearInterval(interval);
  }, [func?._id]);

  if (!func) return null;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border-light overflow-hidden relative">
      {}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border-light rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Clear All Logs?
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              This action cannot be undone. All execution history for this
              function will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-border-light/50 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearLogs}
                className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-light bg-background">
        <h2 className="font-bold text-text-primary">Execution Logs</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2 text-text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            title="Clear Logs"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-background">
        {error && (
          <div className="text-error mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {logs.length === 0 && !loading && (
          <div className="text-text-muted text-center py-10">
            No logs available. Execute your function to see logs here.
          </div>
        )}

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log._id}
              className="border-b border-border-light/20 pb-4 last:border-0"
            >
              <div className="flex items-center gap-3 mb-2 text-xs text-text-muted">
                <span
                  className={`flex items-center gap-1 ${
                    log.status === "success" ? "text-success" : "text-error"
                  }`}
                >
                  {log.status === "success" ? (
                    <CheckCircle size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  {log.status.toUpperCase()}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(log.startTime).toLocaleString()}
                </span>
                <span>•</span>
                <span>Duration: {log.duration}ms</span>
              </div>

              <div className="space-y-1 pl-4 border-l-2 border-border-light/30">
                {log.logs && log.logs.length > 0 ? (
                  log.logs.map((line, i) => (
                    <div
                      key={i}
                      className="text-text-secondary break-all whitespace-pre-wrap font-mono"
                    >
                      {typeof line === "object" ? (
                        <>
                          <span
                            className={
                              line.level === "error"
                                ? "text-error"
                                : "text-text-secondary"
                            }
                          >
                            {line.message}
                          </span>
                        </>
                      ) : (
                        line
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-text-muted italic">No output</div>
                )}
                {log.error && (
                  <div className="text-error mt-2 break-all whitespace-pre-wrap">
                    Error: {log.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunctionLogs;
