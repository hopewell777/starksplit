"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useUIStore } from "@/store/useUIStore";
import { Menu, Wallet2, LogOut, RefreshCw, ChevronDown, Wallet as WalletIcon, Bell, X } from "lucide-react";
import { cn, formatAddress } from "@/lib/utils";
import { toast } from "sonner";
import { useBalances } from "@/hooks/useBalances";
import { useUser } from "@/hooks/useUser";
import { useActiveStarknetAccount } from "@/hooks/useActiveStarknetAccount";
import { useDisconnect } from "@starknet-react/core";
import Link from "next/link";
import { AuthModal } from "@/components/auth/AuthModal";

export const Header = () => {
  const { logout, authenticated, user } = usePrivy();
  const { disconnect } = useDisconnect();
  // We use our new unified hook to check Starknet connections
  const { address, isConnected, isExternalWallet, connector } = useActiveStarknetAccount();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user: dbUser } = useUser();
  const { toggleSidebar } = useUIStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isDropdownOpen || isNotificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isNotificationsOpen]);

  // Safety Effect: Ensure AuthModal closes when connected
  useEffect(() => {
    if (isConnected && isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  }, [isConnected, isAuthModalOpen]);

  const { balances, isLoading: isBalancesLoading, refetch } = useBalances(address);

  // Notifications State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id && authenticated) {
      fetch(`/api/notifications?userId=${user.id}`)
        .then((res) => {
          const contentType = res.headers.get("content-type");
          if (!res.ok || !contentType || !contentType.includes("application/json")) {
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setNotifications(data);
        })
        .catch(err => console.error("Could not fetch notifications:", err));
    }
  }, [user?.id, authenticated]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true })
    });
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id })
    });
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast.success("Address Copied", { description: "Wallet address copied to clipboard." });
    setIsDropdownOpen(false);
  };

  const getDisplayName = () => {
    if (dbUser?.username) return dbUser.username;
    if (user?.google?.name) return user.google.name;
    if (user?.email?.address) return user.email.address;
    return address ? formatAddress(address) : "User";
  };

  const getWalletBrand = () => {
    if (isExternalWallet && connector) {
      if (connector.id.toLowerCase().includes("argent")) return { name: "Argent X", color: "text-white" };
      if (connector.id.toLowerCase().includes("braavos")) return { name: "Braavos", color: "text-white" };
      if (connector.id.toLowerCase().includes("ready")) return { name: "Ready", color: "text-white" };
      return { name: connector.name, color: "text-white" };
    }
    return { name: "Starknet Wallet", color: "text-text-muted" };
  };

  const walletBrand = getWalletBrand();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5 bg-void/50 backdrop-blur-xl transition-all duration-300">
      <div className="flex h-full items-center justify-between px-6 lg:px-8">
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-text-muted hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu size={16} />
          </button>
          
          <Link href="/dashboard" className="flex items-center space-x-2 group cursor-pointer">
            <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white italic text-xs transition-all group-hover:bg-white/10 shadow-glow">
              SS
            </div>
            <span className="hidden text-sm font-black tracking-widest text-white sm:inline-block">
              StarkSplit
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {isConnected && (
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen && unreadCount > 0) {
                    markAllRead();
                  }
                }}
                className="relative p-2 rounded-[2px] text-text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-void text-[8px] font-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div 
                  ref={notificationsRef}
                  className="absolute right-0 mt-2 w-80 origin-top-right rounded-[2px] bg-elevated border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-4 py-1.5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">Recent Alerts</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar px-2 py-2 space-y-1">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-6 text-center border border-dashed border-white/5 mx-1 mt-1">
                        <p className="text-[9px] font-black tracking-widest text-text-muted uppercase italic opacity-40">No alerts found</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => !n.isRead && markAsRead(n.id)}
                          className={cn(
                            "group relative px-3 py-3 rounded-[2px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer",
                            !n.isRead && "border-white/20 bg-white/[0.05]"
                          )}
                        >
                          <div className="flex items-start justify-between pr-6">
                            <span className={cn("text-xs leading-tight transition-colors", n.isRead ? "text-text-muted" : "text-white font-bold")}>
                              {n.title}
                            </span>
                            {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-white flex-shrink-0 mt-1 shadow-glow" />}
                          </div>
                          <p className="text-[10px] text-text-muted mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                          <div className="flex items-center justify-between mt-2">
                             <p className="text-[8px] text-text-muted/50 tracking-widest uppercase">{new Date(n.createdAt).toLocaleDateString()}</p>
                             <button 
                               onClick={(e) => deleteNotification(n.id, e)}
                               className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all text-text-muted hover:text-red-400"
                             >
                               <X size={10} />
                             </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {isConnected ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 rounded-full bg-white/5 border border-white/10 p-1 pl-4 hover:bg-white/10 transition-all group"
              >
                <div className="hidden flex-col items-end sm:flex pr-1">
                  <span className="text-xs font-bold text-white truncate max-w-[120px] tracking-tight">
                    {getDisplayName()}
                  </span>
                  <div className="flex items-center space-x-1.5 opacity-50">
                    <span className="text-[10px] font-bold text-text-muted">
                      {walletBrand.name}
                    </span>
                  </div>
                </div>
                <Avatar 
                  seed={address || user?.id} 
                  alt={getDisplayName()}
                  size="sm"
                  className="h-8 w-8 border border-white/10 group-hover:border-white/20 shadow-inner rounded-full"
                />
                <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} mr-2`} />
              </button>

              {isDropdownOpen && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-text-muted">Balances</span>
                    <button 
                      onClick={() => refetch()} 
                      disabled={isBalancesLoading}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={isBalancesLoading ? "animate-spin" : "text-white"} />
                    </button>
                  </div>
                  
                  <div className="px-2 py-2 space-y-0.5">
                    {balances.length > 0 ? (
                      balances.map((token) => (
                        <div key={token.symbol} className="flex items-center justify-between px-2 py-2 mb-1 rounded-xl hover:bg-white/5 transition-colors group">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] bg-white/5 border border-white/10 text-white overflow-hidden shadow-glow"
                            )}>
                              {token.symbol === 'ETH' ? (
                                <img src="/tokens/eth.png" alt="ETH" className="w-5 h-5 object-contain" />
                              ) : token.symbol === 'STRK' ? (
                                <img src="/tokens/strk.svg" alt="STRK" className="w-5 h-5 object-contain" />
                              ) : token.symbol === 'USDC' ? (
                                <img src="/tokens/usdc.svg" alt="USDC" className="w-5 h-5 object-contain" />
                              ) : (
                                token.symbol.substring(0, 3)
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{token.symbol}</span>
                              <span className="text-xs text-text-muted">${parseFloat(token.usdValue).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white tracking-tight">{token.amount}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 text-center">
                        <span className="text-xs text-text-secondary">No assets found</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 pt-1 border-t border-white/5 px-2 space-y-0.5">
                    {address && (
                      <button
                        onClick={handleCopyAddress}
                        className="flex items-center w-full px-4 py-2 mt-1 text-xs font-bold text-white hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <WalletIcon size={14} className="mr-3 text-white/50" />
                        Copy Address
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (isExternalWallet) {
                          disconnect();
                        } else {
                          logout();
                        }
                      }}
                      className="flex items-center w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all group border-t border-white/5 mt-2 pt-2"
                    >
                      <LogOut size={14} className="mr-3" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button onClick={() => setIsAuthModalOpen(true)} size="sm" className="space-x-2 px-6 h-10 text-sm font-bold rounded-full">
              <Wallet2 size={16} />
              <span>Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
};
