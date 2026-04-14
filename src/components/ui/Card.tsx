"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface CardProps extends HTMLMotionProps<"div"> {
  isFloating?: boolean;
  hoverable?: boolean;
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, isFloating = false, hoverable = true, glass = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        whileHover="hover"
        variants={{
          initial: { y: 0 },
          animate: isFloating 
            ? {
                y: [0, -4, 0],
                transition: {
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }
            : {},
          hover: {
            y: -2,
            transition: { duration: 0.2 },
          },
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] p-6 shadow-2xl transition-all",
          hoverable && "hover:border-white/10 hover:bg-[#0c0c0c] hover:shadow-glow",
          glass && "bg-white/5 backdrop-blur-3xl",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
