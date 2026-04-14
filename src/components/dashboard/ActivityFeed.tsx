"use client";

import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { cn, formatAmount } from "@/lib/utils";
import { Clock, CheckCircle2 } from "lucide-react";
import { SplitStatus } from "@/types";

interface ActivityItem {
  id: string;
  expenseId: string;
  title: string;
  amount: string;
  currency: string;
  date: string;
  status: SplitStatus;
  type: "OWED_BY_ME" | "OWED_TO_ME";
  participant: {
    name: string;
    address: string;
    avatar?: string;
  };
}

export const ActivityFeed = ({ 
  items, 
  onPay,
  onSelect,
  isPayingId,
}: { 
  items: ActivityItem[]; 
  onPay?: (id: string, recipient: string, amount: string, currency: string) => void;
  onSelect?: (expenseId: string) => void;
  isPayingId?: string | null;
}) => {
  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">RECENT ACTIVITY</h3>
        <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
          [ View All ]
        </button>
      </div>
 
      <div className="space-y-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center rounded-[2px] border border-white/5 bg-white/[0.01]">
            <Clock className="mb-3 h-10 w-10 text-text-muted opacity-5" />
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">No protocol activity detected</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect?.(item.expenseId)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 rounded-[2px] border border-white/5 bg-white/[0.01] transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 cursor-pointer"
            >
              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                <Avatar seed={item.participant.address} alt={item.participant.name} className="h-7 w-7 border border-white/10 group-hover:border-white/20 transition-all rounded-[2px]" />
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-white tracking-tight uppercase group-hover:tracking-widest transition-all">
                    {item.title}
                  </p>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">
                    {item.type === "OWED_BY_ME" ? "Counterparty " : "Recipient "}
                    <span className="text-white group-hover:underline cursor-pointer">{item.participant.name}</span>
                    <span className="mx-1 opacity-20">/</span>
                    <span className="opacity-60">{item.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2 sm:p-0 rounded-[2px] bg-white/5 sm:bg-transparent sm:space-y-1">
                <p className="text-sm font-bold text-white tracking-tighter">
                  {formatAmount(item.amount)} <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.currency}</span>
                </p>
                <div className="flex items-center space-x-2">
                  {item.status === "UNPAID" && item.type === "OWED_BY_ME" && onPay && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPay(item.id, item.participant.address, item.amount, item.currency);
                      }}
                      disabled={isPayingId === item.id}
                      className="text-[9px] font-bold uppercase tracking-[0.2em] text-void bg-white px-3 py-1 rounded-[1px] hover:bg-white/90 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {isPayingId === item.id ? "..." : "Settle"}
                    </button>
                  )}
                  <div className={cn(
                    "px-1.5 py-0.25 rounded-[1px] text-[8px] font-bold uppercase tracking-[0.1em] border",
                    item.status === "PAID" 
                      ? "bg-white/10 text-white border-white/20" 
                      : "bg-white/[0.02] text-text-muted border-white/5"
                  )}>
                    {item.status}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
