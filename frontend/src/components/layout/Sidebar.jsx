import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import {
  LayoutDashboard,
  Code2,
  Settings,
  LogOut,
  User,
  X,
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/functions", label: "Functions", icon: Code2 },
    { path: "/profile", label: "Profile", icon: User },
  ];

  const sidebarVariants = {
    collapsed: { width: "4rem" },
    expanded: { width: "20rem" },
  };

  return (
    <motion.aside
      initial="collapsed"
      animate={isHovered || isMobileMenuOpen ? "expanded" : "collapsed"}
      variants={sidebarVariants}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ zIndex: 9999 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "fixed inset-y-0 left-0 z-[9999] bg-card border-r border-border-light flex flex-col transition-transform duration-300 ease-in-out md:transition-none",
        isMobileMenuOpen
          ? "translate-x-0 !w-72"
          : "-translate-x-full md:translate-x-0"
      )}
    >
      {}
      <div className="h-16 flex items-center px-4 border-b border-border-light overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-3 min-w-max">
          <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
          <motion.span
            animate={{ opacity: isHovered || isMobileMenuOpen ? 1 : 0 }}
            className="text-lg font-bold text-primary"
          >
            CloudServe Functions
          </motion.span>
        </div>
        <button
          className="ml-auto md:hidden text-text-secondary"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      {}
      <div className="p-4 border-b border-border-light overflow-hidden whitespace-nowrap">
        <div className="flex items-center gap-3 min-w-max">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <motion.div
            animate={{ opacity: isHovered || isMobileMenuOpen ? 1 : 0 }}
            className="flex-1"
          >
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-[10px] text-text-muted truncate max-w-[140px]">
              {user?.email}
            </p>
          </motion.div>
        </div>
      </div>

      {}
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-background-hover hover:text-text-primary"
              )}
              onClick={handleNavClick}
              title={!isHovered ? item.label : ""}
            >
              <Icon size={20} className="shrink-0" />
              <motion.span
                animate={{
                  opacity: isHovered || isMobileMenuOpen ? 1 : 0,
                  width: isHovered || isMobileMenuOpen ? "auto" : 0,
                }}
                className="font-medium overflow-hidden"
              >
                {item.label}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {}
      <div className="p-4 border-t border-border-light overflow-hidden whitespace-nowrap space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 text-text-secondary hover:bg-background-hover hover:text-text-primary rounded-lg transition-colors min-w-max"
          title={
            !isHovered ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""
          }
        >
          {theme === "dark" ? (
            <Sun size={20} className="shrink-0" />
          ) : (
            <Moon size={20} className="shrink-0" />
          )}
          <motion.span
            animate={{ opacity: isHovered || isMobileMenuOpen ? 1 : 0 }}
            className="font-medium"
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </motion.span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors min-w-max"
          title={!isHovered ? "Sign Out" : ""}
        >
          <LogOut size={20} className="shrink-0" />
          <motion.span
            animate={{ opacity: isHovered || isMobileMenuOpen ? 1 : 0 }}
            className="font-medium"
          >
            Sign Out
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
