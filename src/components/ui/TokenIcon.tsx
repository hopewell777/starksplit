"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface TokenIconProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const TokenIcon = ({ symbol, className, size = 20 }: TokenIconProps) => {
  const getIconSource = (sym: string) => {
    switch (sym.toUpperCase()) {
      case "STRK":
        return "/tokens/strk.svg";
      case "USDC":
        return "/tokens/usdc.svg";
      case "ETH":
        return "/tokens/eth.png";
      default:
        return null;
    }
  };

  const src = getIconSource(symbol);

  if (!src) return null;

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", className)} style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={symbol}
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
};
