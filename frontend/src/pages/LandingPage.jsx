import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-20 flex items-center justify-between border-b border-border-light bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="text-2xl font-bold text-primary flex items-center gap-2">
          <Zap className="fill-current" />
          FaaS Platform
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-text-secondary hover:text-primary transition-colors font-medium"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-background px-5 py-2 rounded-full font-bold hover:bg-primary-hover transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Deploy Serverless Functions <br />
            <span className="text-primary">in Seconds</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto"
          >
            Focus on your code. We handle the infrastructure, scaling, and
            execution. The developer-first FaaS platform you've been waiting
            for.
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

        {/* Features Grid */}
        <section className="py-20 px-6 bg-card/50">
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
        <p>&copy; 2024 FaaS Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-2xl bg-card border border-border-light hover:border-primary transition-colors group">
    <div className="mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3">{title}</h3>
    <p className="text-text-secondary leading-relaxed">{description}</p>
  </div>
);

export default LandingPage;
