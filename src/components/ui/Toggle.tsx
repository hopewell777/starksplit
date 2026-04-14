"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ToggleProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Toggle = ({ options, value, onChange, className }: ToggleProps) => {
  return (
    <div
      className={cn(
        "relative flex h-10 w-fit items-center rounded-lg bg-surface p-1 border border-glass-border",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex h-full items-center justify-center px-4 text-sm font-medium transition-colors",
              isActive ? "text-white" : "text-text-secondary hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="toggle-background"
                className="absolute inset-0 z-[-1] rounded-md bg-accent-purple shadow-glow/30"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
