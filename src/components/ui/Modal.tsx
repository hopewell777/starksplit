"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

import { MeshBackground } from "./MeshBackground";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-void/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-md rounded-[2.5rem] bg-black border border-white/10 p-6 sm:p-8 shadow-[0_40px_120px_rgba(0,0,0,0.9)] overflow-hidden",
              className
            )}
          >
            <MeshBackground />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                {title && (
                  <div className="flex items-center space-x-6">
                    <div className="h-[1px] w-12 bg-white/30" />
                    <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] font-outfit">{title}</h2>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="group relative h-10 w-10 flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/40 hover:bg-white hover:text-black transition-all duration-500"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
