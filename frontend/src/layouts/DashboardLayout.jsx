import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";

const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef(null);

  return (
    <div className="min-h-dvh md:h-dvh bg-background text-text-primary font-sans">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-col min-h-dvh md:h-dvh md:pl-16 relative z-0">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-card border-b border-border-light flex items-center px-4 shrink-0">
          <button
            className="text-text-secondary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <img
            src="/icon.png"
            alt="Logo"
            className="w-6 h-6 object-contain ml-4"
          />
          <span className="ml-2 text-lg font-bold text-primary">
            CloudServe Functions
          </span>
        </header>

        <main
          ref={mainRef}
          className="flex-1 p-6 pb-24 md:pb-6 md:overflow-y-auto"
        >
          <Outlet context={{ scrollRef: mainRef }} />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
