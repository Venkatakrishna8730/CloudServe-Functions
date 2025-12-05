import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Code, Server, Play, Activity, ArrowRight } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";

const DocumentationPage = () => {
  const { scrollRef } = useOutletContext() || {};
  const steps = [
    {
      id: 1,
      title: "Write Your Function",
      description:
        "Start by writing your serverless function in Node.js. Our platform supports standard Node.js modules. You can use the built-in editor or deploy from your local machine.",
      icon: Code,
      color: "bg-blue-500",
      imagePlaceholder: "Code Editor Screenshot",
    },
    {
      id: 2,
      title: "Deploy with One Click",
      description:
        "Once your code is ready, hit the deploy button. We handle the bundling, encryption, and distribution of your function to our edge network instantly.",
      icon: Server,
      color: "bg-purple-500",
      imagePlaceholder: "Deployment Success Screen",
    },
    {
      id: 3,
      title: "Test in Sandbox",
      description:
        "Verify your function's behavior in our isolated sandbox environment. Send test events and inspect the output before going live.",
      icon: Play,
      color: "bg-green-500",
      imagePlaceholder: "Sandbox Testing UI",
    },
    {
      id: 4,
      title: "Monitor & Scale",
      description:
        "Track execution logs, latency, and error rates in real-time. Your function automatically scales to handle incoming traffic without any configuration.",
      icon: Activity,
      color: "bg-orange-500",
      imagePlaceholder: "Analytics Dashboard",
    },
  ];

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollRef,
    offset: ["start center", "end center"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent"
        >
          How It Works
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-text-secondary text-lg max-w-2xl mx-auto"
        >
          From code to production in seconds. Follow this guide to master your
          serverless workflow.
        </motion.p>
      </header>

      <div ref={containerRef} className="relative">
        {/* Static Background Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border-light/30 hidden md:block" />

        {/* Animated Beam */}
        <motion.div
          style={{ scaleY }}
          className="absolute left-1/2 transform -translate-x-1/2 top-0 h-full w-1 bg-gradient-to-b from-primary via-purple-500 to-primary origin-top hidden md:block shadow-[0_0_20px_2px_rgba(168,85,247,0.6)]"
        />

        <div className="space-y-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content Side */}
                <div
                  className={`flex-1 ${
                    isEven ? "md:pr-16" : "md:pl-16"
                  } text-center md:text-left`}
                >
                  <div
                    className={`inline-flex p-3 rounded-xl ${step.color} bg-opacity-10 text-white mb-4`}
                  >
                    <step.icon
                      size={24}
                      className={step.color.replace("bg-", "text-")}
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                  <p className="text-text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Timeline Dot */}
                <div className="relative z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-card border-4 border-background shadow-xl">
                  <div className={`w-4 h-4 rounded-full ${step.color}`} />
                </div>

                {/* Image Side */}
                <div
                  className={`flex-1 ${
                    isEven ? "md:pl-16" : "md:pr-16"
                  } w-full`}
                >
                  <div className="aspect-video rounded-xl overflow-hidden bg-card border border-border-light shadow-2xl group hover:border-primary/50 transition-colors relative">
                    {/* Placeholder for actual image */}
                    <div
                      className={`absolute inset-0 ${step.color} opacity-5 group-hover:opacity-10 transition-opacity`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted font-mono text-sm">
                      {step.imagePlaceholder}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false }}
        className="mt-24 text-center"
      >
        <Link
          to="/functions/create"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-background font-bold rounded-full hover:bg-primary-hover transition-all transform hover:scale-105 shadow-lg shadow-primary/25"
        >
          Start Building Now <ArrowRight size={20} />
        </Link>
      </motion.div>
    </div>
  );
};

export default DocumentationPage;
