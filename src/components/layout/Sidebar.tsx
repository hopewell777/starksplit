"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  X 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "New Split", href: "/split/create", icon: PlusCircle },
  { label: "History", href: "/split/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  const SidebarContent = (
    <div className="flex flex-col h-full bg-void border-r border-white/5">
      <div className="flex h-12 items-center justify-between px-6 lg:hidden">
        <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">StarkSplit</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-text-muted hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4 mt-2 lg:mt-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "group flex h-12 items-center space-x-4 rounded-xl px-4 text-sm font-semibold transition-all duration-300",
                isActive
                  ? "bg-white text-void shadow-glow"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-2 h-3.5 w-3.5 shrink-0 transition-colors",
                  isActive ? "text-void" : "text-text-muted group-hover:text-white"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="rounded-[2px] p-3 bg-white/[0.01] border border-white/5 group hover:border-white/10 transition-all">
          <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
            Protocol Status
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Protocol</span>
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"></span>
          </div>
          <p className="text-[8px] font-black text-text-muted mt-2 opacity-20 uppercase tracking-widest">Stable • Mainnet</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-void/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
      >
        {SidebarContent}
      </motion.aside>
    </>
  );
};
