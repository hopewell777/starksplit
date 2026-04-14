"use client";

import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { formatAddress, formatAmount } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Clock, Users, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import type { Expense } from "@/types";

interface SplitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  currentUserId?: string;
}

export const SplitDetailsModal = ({ 
  isOpen, 
  onClose, 
  expense,
  currentUserId 
}: SplitDetailsModalProps) => {
  if (!expense) return null;

  const isCreator = expense.creatorId === currentUserId;
  const mySplit = expense.splits?.find(s => s.debtorId === currentUserId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Split Details">
      <div className="space-y-8 py-2">
        {/* Header Info */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
            {isCreator ? (
              <ArrowDownLeft className="h-8 w-8 text-green-400" />
            ) : (
              <ArrowUpRight className="h-8 w-8 text-white/60" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
              {expense.title}
            </h3>
            <p className="text-xs font-bold text-text-muted uppercase tracking-[0.3em]">
              {new Date(expense.createdAt).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center space-x-2">
             <p className="text-3xl font-black text-white tracking-tighter">
              {formatAmount(expense.totalAmount)} <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{expense.currency}</span>
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Participants List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2 text-[10px] font-black tracking-[0.4em] text-text-muted uppercase">
              <Users size={12} />
              <span>Participants</span>
            </div>
            <div className="text-[10px] font-black tracking-[0.2em] text-white/40">
              {expense.splits?.length || 0} TOTAL
            </div>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Creator Row */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group transition-all duration-300">
              <div className="flex items-center space-x-4">
                <Avatar seed={expense.creator?.walletAddress || "0x0"} className="h-10 w-10 border border-white/10 rounded-xl" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">
                    {expense.creator?.username || "Creator"}
                    <span className="ml-2 text-[10px] text-green-400/60 font-black uppercase tracking-widest">[ PAYEE ]</span>
                  </p>
                  <p className="text-[10px] font-mono text-text-muted tracking-widest">
                    {expense.creator?.walletAddress ? formatAddress(expense.creator.walletAddress) : "---"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-white tracking-tighter">
                  Creator
                </p>
              </div>
            </div>

            {/* Debtor Rows */}
            {expense.splits?.map((split) => (
              <div key={split.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <Avatar seed={split.debtor?.walletAddress || "0x0"} className="h-10 w-10 border border-white/10 rounded-xl opacity-60" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white/80 uppercase tracking-tight">
                      {split.debtor?.username || split.debtor?.email || "Participant"}
                      {split.debtorId === currentUserId && (
                        <span className="ml-2 text-[10px] text-white/40 font-black uppercase tracking-widest">[ YOU ]</span>
                      )}
                    </p>
                    <p className="text-[10px] font-mono text-white/20 tracking-widest">
                      {split.debtor?.walletAddress ? formatAddress(split.debtor.walletAddress) : "---"}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                   <p className="text-base font-black text-white tracking-tighter leading-none">
                    {formatAmount(split.amountOwed)}
                  </p>
                  <div className="flex items-center justify-end space-x-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      split.status === "PAID" ? "text-green-400" : "text-white/20"
                    }`}>
                      {split.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center pt-2">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] flex items-center space-x-2">
            <Clock size={10} />
            <span>Generated via StarkSplit Protocol</span>
          </p>
        </div>
      </div>
    </Modal>
  );
};
