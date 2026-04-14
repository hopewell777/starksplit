"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { AnimatedText } from "@/components/AnimatedText";
const buttonVariantClasses = {
  primary: "bg-white text-void hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
  secondary: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
  ghost: "bg-transparent text-text-muted hover:text-white hover:bg-white/5",
  danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20",
};

const buttonSizeClasses = {
  default: "h-11 px-6 text-sm",
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  icon: "h-10 w-10",
};

const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag" | "style">, Omit<HTMLMotionProps<"button">, "children"> {
  variant?: keyof typeof buttonVariantClasses;
  size?: keyof typeof buttonSizeClasses;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    // Check if children is a plain string to apply animated text effect
    const renderChildren = () => {
      if (isLoading) {
        return (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {typeof children === 'string' ? (
              <AnimatedText text={children} className="ml-2" />
            ) : (
              children
            )}
          </>
        );
      }

      if (typeof children === 'string') {
        return <AnimatedText text={children} />;
      }

      return children;
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          baseStyles,
          buttonVariantClasses[variant || "primary"],
          buttonSizeClasses[size || "default"],
          className
        )}
        {...props}
      >
        {renderChildren()}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
