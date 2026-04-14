"use client";

import { useEffect, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { SplitStatus } from "@/types";
import { BalanceSummary } from "@/components/dashboard/BalanceSummary";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { SplitWizard } from "@/components/dashboard/SplitWizard";
import { SplitDetailsModal } from "@/components/dashboard/SplitDetailsModal";
import { Button } from "@/components/ui/Button";
import { Plus, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { usePayment } from "@/hooks/usePayment";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user, isReady } = useUser();
  const { expenses, isLoading, fetchExpenses } = useExpenses();
  const { paySplit, isPayingId } = usePayment();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [owedCurrency, setOwedCurrency] = useState("STRK");
  const [receiveCurrency, setReceiveCurrency] = useState("STRK");

  useEffect(() => {
    const controller = new AbortController();
    if (user?.id) {
      fetchExpenses(controller.signal);
    }
    return () => controller.abort();
  }, [user?.id, fetchExpenses]);

  // Calculate balances
  const totalOwed = expenses.reduce((acc, exp) => {
    if (exp.currency !== owedCurrency) return acc;
    const mySplit = exp.splits?.find(s => s.debtorId === user?.id && s.status === "UNPAID");
    return acc + (mySplit ? parseFloat(mySplit.amountOwed) : 0);
  }, 0);

  const totalToReceive = expenses.reduce((acc, exp) => {
    if (exp.currency !== receiveCurrency) return acc;
    if (exp.creatorId !== user?.id) return acc;
    const unpaidSplits = exp.splits?.filter(s => s.debtorId !== user?.id && s.status === "UNPAID") || [];
    return acc + unpaidSplits.reduce((sum, s) => sum + parseFloat(s.amountOwed), 0);
  }, 0);

  const activeSplitsCount = expenses.filter((exp) => {
    if (exp.creatorId === user?.id) {
      return exp.splits?.some((s) => s.debtorId !== user?.id && s.status === "UNPAID");
    } else {
      return exp.splits?.some((s) => s.debtorId === user?.id && s.status === "UNPAID");
    }
  }).length;

  // Map expenses to ActivityFeed items
  const activityItems = expenses.flatMap((exp) => {
    if (!exp.splits) return [];
    return exp.splits.map((split) => {
      const isUserDebtor = split.debtorId === user?.id;
      const otherParty = isUserDebtor ? exp.creator : split.debtor;

      return {
        id: split.id,
        expenseId: exp.id,
        title: exp.title,
        amount: split.amountOwed,
        currency: exp.currency,
        date: new Date(exp.createdAt).toLocaleDateString(),
        status: split.status as SplitStatus,
        type: (isUserDebtor ? "OWED_BY_ME" : "OWED_TO_ME") as "OWED_BY_ME" | "OWED_TO_ME",
        participant: {
          name: otherParty?.username || otherParty?.email || "Unknown",
          address: otherParty?.walletAddress || "0x0...",
          avatar: otherParty?.avatarUrl,
        },
      };
    });
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-[10px] font-black tracking-[0.4em] text-text-muted uppercase">
            <span>[ Overview ]</span>
            <div className="h-px w-8 bg-white/20" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none font-[family-name:var(--font-outfit)]">Dashboard</h1>
          <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] max-w-lg">
            Check your active splits and settle here
          </p>
        </div>
        <Button 
          size="lg" 
          onClick={() => setIsWizardOpen(true)}
          className="w-full sm:w-auto px-8 h-12 bg-white text-void hover:bg-white/90 rounded-full font-bold uppercase tracking-[0.2em] transition-all hover:scale-105"
        >
          <Plus className="mr-3 h-5 w-5" />
          New Split
        </Button>
      </div>

      <BalanceSummary 
        totalOwed={totalOwed.toFixed(2)} 
        totalToReceive={totalToReceive.toFixed(2)} 
        activeSplits={expenses.filter(e => e.splits?.some(s => s.status === "UNPAID")).length}
        owedCurrency={owedCurrency}
        onOwedCurrencyChange={setOwedCurrency}
        receiveCurrency={receiveCurrency}
        onReceiveCurrencyChange={setReceiveCurrency}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed 
            items={activityItems} 
            onSelect={(expenseId) => {
              const exp = expenses.find(e => e.id === expenseId);
              if (exp) setSelectedExpense(exp);
            }}
            onPay={async (id, recipient, amount, currency) => {
              const result = await paySplit(id, recipient, amount, currency);
              if (result.success) {
                toast.success("Payment successful!", {
                  description: "Your split has been settled on Starknet.",
                });
              } else {
                toast.error("Payment failed", {
                  description: result.error,
                });
              }
            }}
            isPayingId={isPayingId}
          />
        </div>
        <div className="space-y-6">
          {/* Members or other widgets can go here */}
        </div>
      </div>

      <SplitWizard 
        isOpen={isWizardOpen} 
        onClose={() => {
          setIsWizardOpen(false);
          fetchExpenses(); // Refresh after creation
        }} 
      />

      <SplitDetailsModal 
        isOpen={!!selectedExpense} 
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        currentUserId={user?.id}
      />
    </div>
  );
}
