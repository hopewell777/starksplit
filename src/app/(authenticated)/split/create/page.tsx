"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SplitWizard } from "@/components/dashboard/SplitWizard";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function CreateSplitPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-open the wizard when the page loads
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard"); // Redirect back to dashboard on close
  };

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center p-8">
      {/* Background purely aesthetic while wizard loads */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white opacity-5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 text-center space-y-4 animate-pulse">
        <div className="flex items-center justify-center space-x-3 text-[10px] font-black tracking-[0.5em] text-text-muted uppercase">
          <div className="h-px w-8 bg-white/10" />
          <span>[ Initializing Protocol ]</span>
          <div className="h-px w-8 bg-white/10" />
        </div>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Preparing Ledger...</p>
      </div>

      <SplitWizard isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
