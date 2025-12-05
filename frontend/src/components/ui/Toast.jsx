import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "bg-card border-success/20 text-success",
  error: "bg-card border-error/20 text-error",
  info: "bg-card border-primary/20 text-primary",
  warning: "bg-card border-warning/20 text-warning",
};

const Toast = ({ message, type = "info", onClose }) => {
  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-md ${colors[type]}`}
    >
      <Icon size={20} className="shrink-0" />
      <p className="text-sm font-medium text-text-primary flex-1">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-background/20 rounded transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
