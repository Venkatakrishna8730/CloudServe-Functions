import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Activity, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 md:px-6 h-16 md:h-20 flex items-center justify-between border-b border-border-light bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
          <img
            src="/icon.png"
            alt="CloudServe Logo"
            className="w-8 h-8 md:w-10 md:h-10 object-contain"
          />
          CloudServe Functions
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-primary transition-colors"
            title={theme === "dark" ? "Light Mode" : "Dark Mode"}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link
            to="/login"
            className="text-xs md:text-base text-text-secondary hover:text-primary transition-colors font-medium px-2 py-1"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-background px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-base rounded-full font-bold hover:bg-primary-hover transition-colors whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {}
        <section className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex flex-col justify-center py-12 md:py-20 px-4 md:px-6 text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Deploy Serverless Functions <br />
            <span className="text-primary">in Seconds</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-text-secondary mb-8 md:mb-10 max-w-2xl mx-auto"
          >
            Focus on your code. We handle the infrastructure, scaling, and
            execution. The developer-first CloudServe Functions you've been
            waiting for.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="bg-primary text-background px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-hover transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Start Building <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-lg font-bold text-lg border border-border-light hover:border-primary text-text-primary transition-colors w-full sm:w-auto justify-center"
            >
              View Documentation
            </Link>
          </motion.div>
        </section>

        {}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-card/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap size={32} />}
              title="Instant Deployment"
              description="Push your code and get a live endpoint instantly. No configuration required."
            />
            <FeatureCard
              icon={<Shield size={32} />}
              title="Secure Execution"
              description="Your functions run in isolated sandboxes with strict resource limits."
            />
            <FeatureCard
              icon={<Activity size={32} />}
              title="Real-time Analytics"
              description="Monitor execution logs, latency, and memory usage in real-time."
            />
          </div>
        </section>
      </main>

      <footer className="py-8 px-6 border-t border-border-light text-center text-text-muted">
        <p>&copy; 2025 CloudServe Functions. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 md:p-8 rounded-2xl bg-card border border-border-light hover:border-primary transition-colors group">
    <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
