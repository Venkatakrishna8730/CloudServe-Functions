import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Activity, Server, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { fetchFunctions } from "../store/slices/functionsSlice";
import { fetchAllUsages } from "../store/slices/usageSlice";

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const { list, loading } = useSelector((state) => state.functions);
  const { recentActivity, loading: usageLoading } = useSelector(
    (state) => state.usage
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (list.length === 0 && !loading) {
      dispatch(fetchFunctions());
    }
    dispatch(fetchAllUsages());
  }, [dispatch]);

  // Calculate stats
  const totalFunctions = list.length;
  const totalInvocations = list.reduce(
    (acc, func) => acc + (func.stats?.executed || 0),
    0
  );
  const avgLatency =
    totalFunctions > 0
      ? Math.round(
          list.reduce((acc, func) => acc + (func.stats?.avgLatency || 0), 0) /
            totalFunctions
        )
      : 0;

  const stats = [
    {
      label: "Total Functions",
      value: totalFunctions.toString(),
      icon: Server,
      color: "text-primary",
    },
    {
      label: "Total Invocations",
      value: totalInvocations.toString(),
      icon: Activity,
      color: "text-success",
    },
    {
      label: "Avg Latency",
      value: `${avgLatency}ms`,
      icon: Clock,
      color: "text-warning",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto"
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back, {user?.fullName}. Here's what's happening with your
          functions.
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              variants={item}
              key={index}
              className={`bg-card p-6 rounded-xl border border-border-light hover:border-border-heavy transition-colors ${
                index === 2 ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-background ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <motion.div variants={item} className="lg:col-span-2 space-y-8">
          <div className="bg-card rounded-xl border border-border-light overflow-hidden">
            <div className="p-6 border-b border-border-light flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <Link
                to="/functions"
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="p-6">
              {usageLoading && recentActivity.length === 0 ? (
                <div className="text-center py-10 text-text-secondary">
                  Loading activity...
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border-light"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            activity.status === "success"
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          <Activity size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm truncate max-w-[150px] sm:max-w-xs">
                            {activity.functionId?.name || "Unknown Function"}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            activity.status === "success"
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {activity.status.toUpperCase()}
                        </span>
                        <p className="text-xs text-text-secondary mt-1 font-mono">
                          {activity.duration}ms
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-text-muted">
                  <Activity size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No recent activity to show.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Area */}
        <motion.div variants={item} className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border-light">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <Link
              to="/functions/create"
              className="flex items-center justify-center gap-2 w-full bg-primary text-background font-bold py-3 rounded-lg hover:bg-primary-hover transition-colors mb-3"
            >
              <Plus size={20} />
              New Function
            </Link>
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 w-full bg-background border border-border-light text-text-primary font-medium py-3 rounded-lg hover:border-primary transition-colors"
            >
              Manage API Keys
            </Link>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-transparent p-6 rounded-xl border border-primary/20">
            <h3 className="font-bold text-primary mb-2">Documentation</h3>
            <p className="text-sm text-text-secondary mb-4">
              Learn how to deploy your first function and integrate with your
              apps.
            </p>
            <Link
              to="/docs"
              className="text-sm font-bold text-primary hover:underline"
            >
              Read Docs &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DashboardPage;
