"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Settings, User, Bell, Wallet, Save, X, Lock, ShieldCheck, Plus, Zap, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user: dbUser, updateUser, isLoading } = useUser();
  const { linkWallet } = usePrivy();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dbUser) {
      setUsername(dbUser.username || "");
      setEmail(dbUser.email || "");
    }
  }, [dbUser]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "notifications", label: "Alerts", icon: Bell },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateUser({ username, email });
    setIsSaving(false);
    
    if (result.success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-[10px] font-bold tracking-[0.4em] text-text-muted uppercase">
            <span>[ Protocol Config ]</span>
            <div className="h-px w-8 bg-white/10" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-none font-[family-name:var(--font-outfit)]">Settings</h1>
          <p className="text-sm text-text-secondary max-w-2xl leading-relaxed font-medium">
            Manage your smart account environment and security parameters.
          </p>
        </div>
        
        <Link 
          href="/dashboard"
          className="flex items-center gap-3 px-6 h-11 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all"
        >
          <X size={14} /> Exit Settings
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-4 w-full p-4 rounded-xl text-left font-bold tracking-widest uppercase text-[10px] transition-all duration-300 border",
                activeTab === tab.id 
                  ? "bg-white text-void border-white shadow-sm" 
                  : "bg-transparent text-text-muted border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              <tab.icon size={16} className="shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9">
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <Card className="space-y-6 border-white/5 bg-surface/30">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Username</label>
                    <Input 
                      placeholder="e.g. starkwizard" 
                      className="bg-white/5 border-white/5 focus:border-white/20 h-13 rounded-xl text-sm font-semibold"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="wizard@starknet.io" 
                      className="bg-white/5 border-white/5 focus:border-white/20 h-13 rounded-xl text-sm font-semibold"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">
                    Settlement Currency
                  </label>
                  <div className="relative group">
                    <select className="w-full h-13 px-6 border border-white/5 rounded-xl bg-white/5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all appearance-none cursor-pointer hover:bg-white/10">
                      <option value="STRK">Starknet (STRK)</option>
                      <option value="USDC">USDC (Stablecoin)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-white transition-colors">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    className="px-12 h-13 rounded-full font-bold uppercase tracking-widest text-xs"
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-3 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-3" /> Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "wallet" && (
            <Card className="p-12 border-white/5 bg-surface/30 animate-in fade-in duration-500">
              <div className="flex flex-col items-center justify-center text-center space-y-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-20" />
                  <div className="relative p-8 rounded-full bg-white/5 text-white border border-white/10 group-hover:bg-white group-hover:text-void transition-all duration-700">
                    <Wallet size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight font-[family-name:var(--font-outfit)]">Protocol Accounts</h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed font-medium">
                    Link additional wallets to your smart account instance.
                  </p>
                </div>
                <div className="flex flex-col gap-6 w-full max-w-xs pt-4">
                  <Button 
                    className="w-full h-13 rounded-full font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
                    onClick={linkWallet}
                  >
                    <Plus className="mr-3 h-4 w-4" />
                    Connect New Wallet
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <div className="flex h-96 flex-col items-center justify-center text-text-muted font-black uppercase tracking-[0.4em] text-[10px] bg-white/[0.01] border border-dashed border-white/5 rounded-2xl animate-in fade-in duration-500">
              [ SUBSYSTEM PENDING: ALERTS ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
