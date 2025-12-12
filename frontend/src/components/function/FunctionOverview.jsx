import { useOutletContext } from "react-router-dom";
import {
  Activity,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Globe,
  Calendar,
  Zap,
  HardDrive,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsages } from "../../store/slices/usageSlice";
import { copyText } from "../../utils/clipboard.util";

const FunctionOverview = () => {
  const { func } = useOutletContext();
  const dispatch = useDispatch();
  const { list: usages, loading: usageLoading } = useSelector(
    (state) => state.usage
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (func?._id) {
      dispatch(fetchUsages(func._id));
    }
  }, [dispatch, func?._id]);

  const handleCopyEndpoint = async () => {
    if (func?.endpoint) {
      const success = await copyText(func.endpoint);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!func) return null;

  const totalExecutions = func.stats?.executed || 0;
  const errorCount = func.stats?.errors || 0;
  const errorRate =
    totalExecutions > 0 ? Math.round((errorCount / totalExecutions) * 100) : 0;

  const stats = [
    {
      label: "Total Invocations",
      value: totalExecutions,
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Avg Latency",
      value: `${func.stats?.avgLatency || 0}ms`,
      icon: Clock,
      color: "text-success",
    },
    {
      label: "Error Rate",
      value: `${errorRate}%`,
      icon: AlertTriangle,
      color: errorRate > 0 ? "text-error" : "text-success",
    },
    {
      label: "Avg Memory",
      value: `${func.stats?.avgMemory || 0}MB`,
      icon: HardDrive,
      color: "text-text-primary",
    },
  ];

  return (
    <div className="w-full flex flex-col space-y-8">
      {/* Stats Grid */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Overview</h2>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              func.isActive
                ? "bg-success/10 text-success border-success/20"
                : "bg-text-muted/10 text-text-muted border-text-muted/20"
            }`}
          >
            {func.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-card p-6 rounded-xl border border-border-light"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Details & Endpoint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card rounded-xl border border-border-light overflow-hidden">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe size={20} className="text-primary" />
              Endpoint
            </h2>
          </div>
          <div className="p-6">
            <p className="text-text-secondary mb-4">
              Invoke your function by sending a request to this URL.
            </p>
            <div className="bg-background border border-border-light rounded-lg p-4 flex items-center justify-between gap-4">
              <code className="font-mono text-primary text-sm break-all">
                {func.endpoint}
              </code>
              <button
                onClick={handleCopyEndpoint}
                className="p-2 text-text-secondary hover:text-primary hover:bg-card rounded-lg transition-colors shrink-0"
                title="Copy Endpoint"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border-light overflow-hidden">
          <div className="p-6 border-b border-border-light">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              Configuration
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-light pb-3">
              <span className="text-text-secondary">Runtime</span>
              <span className="font-medium">Node.js</span>
            </div>
            <div className="flex justify-between items-center border-b border-border-light pb-3">
              <span className="text-text-secondary">Version</span>
              <span className="font-medium">v{func.version}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border-light pb-3">
              <span className="text-text-secondary">Memory</span>
              <span className="font-medium">128 MB (Default)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary flex items-center gap-2">
                <Calendar size={16} /> Last Executed
              </span>
              <span className="font-medium">
                {func.stats?.lastExecuted
                  ? new Date(func.stats.lastExecuted).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Usage */}
      <div className="bg-card rounded-xl border border-border-light overflow-hidden">
        <div className="p-6 border-b border-border-light">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Recent Activity
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {usageLoading ? (
            <div className="p-8 text-center text-text-secondary">
              Loading activity...
            </div>
          ) : usages.length === 0 ? (
            <div className="p-8 text-center text-text-secondary">
              No recent activity found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-border-light text-text-secondary text-sm">
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Duration</th>
                  <th className="p-4 font-medium">Memory</th>
                  <th className="p-4 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {[...usages]
                  .reverse()
                  .slice(0, 10)
                  .map((usage) => (
                    <tr
                      key={usage._id}
                      className="border-b border-border-light last:border-0 hover:bg-background/50 transition-colors"
                    >
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            usage.status === "success"
                              ? "bg-success/20 text-success"
                              : "bg-error/20 text-error"
                          }`}
                        >
                          {usage.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-sm">
                        {usage.duration}ms
                      </td>
                      <td className="p-4 font-mono text-sm">
                        {usage.memoryUsed} MB
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {new Date(usage.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunctionOverview;
