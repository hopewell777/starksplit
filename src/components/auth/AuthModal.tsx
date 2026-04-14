"use client";

import { useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useConnect } from "@starknet-react/core";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Mail, Wallet2 } from "lucide-react";
import { motion } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = usePrivy();
  const { connect, connectors } = useConnect();

  // Deduplicate and filter connectors
  // Argent and Ready are often duplicated in the list.
  const filteredConnectors = useMemo(() => {
    const seen = new Set<string>();
    return connectors.filter((c) => {
      const name = c.name.toLowerCase();
      // Keep only the first one of any similar name
      if (name.includes("ready") || name.includes("argent")) {
        if (seen.has("argent-ready")) return false;
        seen.add("argent-ready");
        return true;
      }
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [connectors]);

  const handleEmailLogin = () => {
    login();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to StarkSplit">
      <div className="space-y-8 py-2">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-3"
        >
          <h3 className="text-2xl font-black tracking-tight text-white font-outfit">
            Ready to <span className="text-accent-cyan italic">Split</span>?
          </h3>
          <p className="text-white/40 text-sm max-w-[240px] mx-auto leading-relaxed">
            Connect your wallet to split bills and settle on-chain with <span className="text-white/60 font-bold">zero gas fees</span>.
          </p>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              onClick={handleEmailLogin}
              className="w-full h-14 space-x-4 text-sm bg-white text-black hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.15)] group"
            >
              <Mail size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
              <span className="font-black">Continue with Email</span>
            </Button>
          </motion.div>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-[1px] bg-white/10 group"></div>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
              Alternative
            </span>
            <div className="flex-1 h-[1px] bg-white/10"></div>
          </div>

          <div className="flex flex-col space-y-3">
            {filteredConnectors.map((connector, index) => (
              <motion.div
                key={connector.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Button
                  onClick={() => {
                    connect({ connector });
                    onClose();
                  }}
                  variant="secondary"
                  className="w-full h-14 group justify-start px-6 bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all"
                  disabled={!connector.available()}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                        <Wallet2 size={16} className="text-white/60" />
                      </div>
                      <span className="font-bold text-white/80">{connector.name.replace("(formerly Argent)", "")}</span>
                    </div>
                    
                    {!connector.available() ? (
                      <span className="text-[10px] text-white/20 font-black italic">NOT DETECTED</span>
                    ) : (
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,255,255,0.5)]" />
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-4 border-t border-white/5"
        >
          <p className="text-[9px] text-center text-white/20 leading-relaxed font-medium uppercase tracking-wider">
            StarkSplit Beta — Mainnet & Sepolia
          </p>
        </motion.div>
      </div>
    </Modal>
  );
};
