"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useMemo } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  seed?: string; // e.g. wallet address or email to generate fallback gradient
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

export const Avatar = ({ src, alt, seed, size = "md", className, onClick }: AvatarProps) => {
  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-16 w-16 text-sm",
    xl: "h-24 w-24 text-base",
  };

  const gradient = useMemo(() => {
    if (!seed) return "from-accent-purple to-accent-cyan";
    const colors = [
      "from-accent-purple to-accent-cyan",
      "from-blue-500 to-purple-500",
      "from-emerald-500 to-cyan-500",
      "from-orange-500 to-rose-500",
      "from-indigo-500 to-purple-500",
    ];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [seed]);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-glass-border",
        sizes[size],
        !src && `bg-gradient-to-br ${gradient}`,
        className
      )}
      onClick={onClick}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || "Avatar"}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold text-white uppercase">
          {alt ? alt.substring(0, 2) : seed ? seed.substring(2, 4) : "SS"}
        </span>
      )}
    </div>
  );
};
