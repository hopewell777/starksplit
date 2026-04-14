"use client";

import { useEffect, useState } from "react";
import { Search, ArrowUpRight, ArrowDownLeft, Clock, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useExpenses } from "@/hooks/useExpenses";
import { useUser } from "@/hooks/useUser";
import { SplitDetailsModal } from "@/components/dashboard/SplitDetailsModal";

export default function SplitHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isReady } = useUser();
  const { expenses, isLoading, fetchExpenses } = useExpenses();
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchExpenses();
    }
  }, [user?.id, fetchExpenses]);

  // Transform raw expenses into history rows based on paid/settled status
  const historyData = expenses.flatMap(exp => {
    if (!exp.splits) return [];
    
    const isCreator = exp.creatorId === user?.id;
    const mySplit = exp.splits.find(s => s.debtorId === user?.id);
    
    // As Creator: Show expense if there are ANY splits (maybe they're paid, maybe unpaid). 
    // The history typically shows past or overarching items. We'll show all expenses.
    if (isCreator) {
      const paidMembers = exp.splits.filter(s => s.status === "PAID").length;
      return [{
        id: exp.id,
        expenseId: exp.id,
        title: exp.title,
        amount: exp.totalAmount.toString(),
        currency: exp.currency,
        date: new Date(exp.createdAt).toLocaleDateString(),
        type: "OWED_TO_ME", // The creator is owed money
        // Overall status heuristic: if all paid -> COMPLETED else PENDING
        status: paidMembers === exp.splits.length ? "COMPLETED" : "PENDING",
        membersMeta: `${paidMembers}/${exp.splits.length} Paid`,
      }];
    } 
    // As Debtor: Show individual split records for history
    else if (mySplit) {
      return [{
        id: mySplit.id,
        expenseId: exp.id,
        title: exp.title,
        amount: mySplit.amountOwed.toString(),
        currency: exp.currency,
        date: new Date(exp.createdAt).toLocaleDateString(),
        type: "I_OWED", 
        status: mySplit.status,
        membersMeta: `To ${exp.creator?.username || formatAddress(exp.creator?.walletAddress || "0x0")} (Creator)`,
      }];
    }
    
    return [];
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = historyData.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (!isReady || isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white opacity-20" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm font-semibold tracking-widest text-text-muted uppercase">
            <span>Activity Log</span>
            <div className="h-px w-12 bg-white/10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none font-[family-name:var(--font-outfit)]">History</h1>
          <p className="text-base text-text-secondary max-w-2xl leading-relaxed">
            A comprehensive record of your split payments and settlement history on Starknet.
          </p>
        </div>
        
        <Link 
          href="/dashboard"
          className="flex items-center gap-3 px-6 h-11 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 transition-all"
        >
          <X size={16} /> Close Log
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <Input 
            className="pl-14 h-12 bg-white/5 border-white/5 rounded-xl placeholder:text-text-muted/60" 
            placeholder="Search activity records..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-[2px] border border-dashed border-white/5 bg-white/[0.01]">
            <Clock className="mb-4 h-12 w-12 text-text-muted opacity-10" />
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted">[ No historical records found ]</p>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const exp = expenses.find(e => e.id === item.expenseId);
                if (exp) setSelectedExpense(exp);
              }}
              className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-[2px] border border-white/5 bg-white/[0.01] transition-all duration-500 hover:bg-white/[0.02] hover:border-white/10 cursor-pointer"
            >
              <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                <div className="p-2.5 rounded-[2px] bg-white/5 text-white transition-all duration-500 group-hover:bg-white group-hover:text-void group-hover:scale-105">
                  {item.type === "OWED_TO_ME" ? <ArrowDownLeft size={16} strokeWidth={3} /> : <ArrowUpRight size={16} strokeWidth={3} />}
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-white tracking-tight uppercase group-hover:tracking-widest transition-all">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={10} className="opacity-60" /> {item.date}
                    </span>
                    <span className="opacity-20">/</span>
                    <span className="text-white/60">{item.membersMeta}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center p-2.5 sm:p-0 rounded-[2px] bg-white/5 sm:bg-transparent sm:space-y-1">
                <p className="text-base font-black text-white tracking-tighter leading-none">
                  {parseFloat(item.amount).toFixed(2)} <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.currency}</span>
                </p>
                <div className={cn(
                  "px-2 py-0.5 rounded-[1px] text-[8px] font-black uppercase tracking-[0.2em] border transition-all",
                  item.status === "PAID" || item.status === "COMPLETED"
                    ? "bg-white/10 text-white border-white/20" 
                    : "bg-white/[0.02] text-text-muted border-white/5"
                )}>
                  {item.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SplitDetailsModal 
        isOpen={!!selectedExpense} 
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        currentUserId={user?.id}
      />
    </div>
  );
}
