"use client";

import { Card } from "@/components/ui/Card";
import { ArrowDownLeft, ArrowUpRight, Wallet, ChevronDown } from "lucide-react";
import { TokenIcon } from "@/components/ui/TokenIcon";
import { cn } from "@/lib/utils";

interface BalanceSummaryProps {
  totalOwed: string | number;
  totalToReceive: string | number;
  activeSplits: number;
  owedCurrency?: string;
  onOwedCurrencyChange?: (currency: string) => void;
  receiveCurrency?: string;
  onReceiveCurrencyChange?: (currency: string) => void;
}

export const BalanceSummary = ({
  totalOwed,
  totalToReceive,
  activeSplits,
  owedCurrency = "STRK",
  onOwedCurrencyChange,
  receiveCurrency = "STRK",
  onReceiveCurrencyChange,
}: BalanceSummaryProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="relative overflow-hidden group p-4 border border-white/5 bg-white/[0.02]">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-all duration-500 scale-125 group-hover:scale-90">
          <ArrowUpRight size={16} className="text-white" />
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted transition-colors group-hover:text-white">You owe</p>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{totalOwed}</span>
            
            <div className="relative group/select h-8 flex items-center bg-white/5 border border-white/10 rounded-full px-3 hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center justify-center w-4 h-4 mr-2 shrink-0">
                <TokenIcon symbol={owedCurrency} size={16} />
              </div>
              <select 
                value={owedCurrency}
                onChange={(e) => onOwedCurrencyChange?.(e.target.value)}
                className="appearance-none bg-transparent border-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] focus:outline-none pr-5 cursor-pointer"
              >
                <option value="STRK">STRK</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="relative overflow-hidden group p-4 border border-white/5 bg-white/[0.02]">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-all duration-500 scale-125 group-hover:scale-90">
          <ArrowDownLeft size={16} className="text-white" />
        </div>
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted transition-colors group-hover:text-white">You are owed</p>
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-black text-white tracking-tighter tabular-nums">{totalToReceive}</span>
            <div className="relative group/select h-8 flex items-center bg-white/5 border border-white/10 rounded-full px-3 hover:bg-white/10 transition-all cursor-pointer">
              <div className="flex items-center justify-center w-4 h-4 mr-2 shrink-0">
                <TokenIcon symbol={receiveCurrency} size={16} />
              </div>
              <select 
                value={receiveCurrency}
                onChange={(e) => onReceiveCurrencyChange?.(e.target.value)}
                className="appearance-none bg-transparent border-none text-[10px] font-black text-text-muted uppercase tracking-[0.2em] focus:outline-none pr-5 cursor-pointer"
              >
                <option value="STRK">STRK</option>
                <option value="USDC">USDC</option>
                <option value="ETH">ETH</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="sm:col-span-2 lg:col-span-1 group p-4 border border-white/5 bg-white/[0.02]">
        <div className="flex items-center space-x-5">
          <div className="rounded-xl bg-white/5 p-3 text-white border border-white/10 group-hover:bg-white group-hover:text-void transition-all duration-500 shadow-glow">
            <Wallet size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted group-hover:text-white transition-colors">Active Splits</p>
            <p className="text-2xl font-black text-white tracking-tight tabular-nums">{activeSplits}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
