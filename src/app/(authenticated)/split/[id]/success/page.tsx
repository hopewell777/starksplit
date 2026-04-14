"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-6 animate-in fade-in duration-1000">
      <div 
        className={`max-w-md w-full space-y-8 bg-white/5 border border-white/10 p-10 rounded-3xl transition-all duration-1000 transform ${
          isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse aspect-square" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white tracking-tight font-[family-name:var(--font-outfit)]">
              Split Confirmed
            </h1>
            <p className="text-sm font-semibold text-text-muted">
              Entities have been notified and ledgers successfully prepared for settlement.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
          <div className="p-6 text-center space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Receipt Identifier</p>
            <p className="text-xl font-mono font-bold text-white tracking-[0.2em]">
              {typeof id === 'string' 
                ? `TRX-${id.substring(1, 4).toUpperCase()}-${id.substring(4, 7).toUpperCase()}`
                : id}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={() => router.push('/dashboard')}
            className="w-full h-14 bg-white text-void hover:bg-white/90 rounded-full font-bold uppercase tracking-[0.2em] transition-all hover:scale-[1.02] flex items-center justify-center"
          >
            Return to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
