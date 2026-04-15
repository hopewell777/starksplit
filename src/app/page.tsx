"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet2, ArrowUpRight } from "lucide-react";
import { AnimatedText } from "@/components/AnimatedText";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { useActiveStarknetAccount } from "@/hooks/useActiveStarknetAccount";

export default function LandingPage() {
  const { isConnected } = useActiveStarknetAccount();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-void">
      {/* Nav Bar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-void/50 backdrop-blur-xl px-4 sm:px-8">
        <div className="flex h-16 items-center justify-between mx-auto max-w-7xl">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="h-10 w-10 bg-white/5 border border-white/10 flex items-center justify-center font-black text-white italic transition-all group-hover:bg-white/10 rounded-xl">
                SS
              </div>
              <span className="hidden text-lg font-black tracking-tight text-white sm:inline-block">
                StarkSplit
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8 ml-8">
              <Button variant="ghost" className="text-sm font-medium normal-case tracking-normal">
                About
              </Button>
              <a href="https://github.com/hopewell777/starksplit" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="text-sm font-medium normal-case tracking-normal">
                  Github
                </Button>
              </a>
              <Button 
                variant="ghost" 
                className="text-sm font-medium normal-case tracking-normal"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Features
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <Button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="group flex items-center space-x-2 bg-white text-void hover:bg-white/90 px-6 h-11 rounded-full text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
            >
              <AnimatedText text="Get Started" />
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Background Radiating Lines (Horizon Effect) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="50%" stopColor="white" stopOpacity="0.8" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Converging lines from sides to center horizon */}
          <line x1="-10" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.3" />
          <line x1="-5" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.25" />
          <line x1="0" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.2" />
          <line x1="10" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.15" />
          <line x1="20" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.1" />
          
          <line x1="110" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.3" />
          <line x1="105" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.25" />
          <line x1="100" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.2" />
          <line x1="90" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.15" />
          <line x1="80" y1="100" x2="50" y2="70" stroke="url(#lineGradient)" strokeWidth="0.1" opacity="0.1" />

          {/* Horizon Line */}
          <line x1="0" y1="70" x2="100" y2="70" stroke="url(#lineGradient)" strokeWidth="0.2" opacity="0.5" />
          
          {/* Fanning lines from horizon point */}
          <line x1="50" y1="70" x2="0" y2="40" stroke="url(#lineGradient)" strokeWidth="0.05" opacity="0.1" />
          <line x1="50" y1="70" x2="20" y2="20" stroke="url(#lineGradient)" strokeWidth="0.05" opacity="0.08" />
          <line x1="50" y1="70" x2="50" y2="0" stroke="url(#lineGradient)" strokeWidth="0.05" opacity="0.05" />
          <line x1="50" y1="70" x2="80" y2="20" stroke="url(#lineGradient)" strokeWidth="0.05" opacity="0.08" />
          <line x1="50" y1="70" x2="100" y2="40" stroke="url(#lineGradient)" strokeWidth="0.05" opacity="0.1" />
        </svg>

        {/* Subtle Background Glows */}
        <div className="absolute top-[70%] left-1/2 -translate-x-1/2 w-full h-1/2 bg-white/5 blur-[120px]" />
      </div>

      {/* Hero Content Section */}
      <div className="relative z-10 flex flex-col items-center justify-between min-h-screen h-[100dvh] text-center px-4 py-20 sm:py-24">
        {/* Empty top space for balance */}
        <div className="h-0" />

        {/* Hero content */}
        <div className="flex flex-col items-center max-w-5xl w-full">
          {/* Pre-header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-6"
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.4em] text-text-muted uppercase">
              [ INTRODUCING STARKSPLIT ]
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4 sm:space-y-6"
          >
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1] font-[family-name:var(--font-outfit)]">
              What is <span className="text-white">StarkSplit</span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-text-secondary leading-relaxed font-medium px-4">
              Secure and simplified split payments for the Starknet ecosystem.
              Sign in with email and settle bills with precision on-chain.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-6">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-8"
              >
                Learn More
              </Button>
              <Button
                onClick={() => setIsAuthModalOpen(true)}
                size="lg"
                className="group w-full sm:w-auto px-10 flex items-center space-x-2 transition-all shadow-glow"
              >
                <AnimatedText text="Get Started" />
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="pb-8"
        >
          <div className="flex flex-col items-center space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted">Scroll to explore</span>
            <div className="w-[1px] h-10 sm:h-12 bg-gradient-to-b from-white to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Features & Details Section */}
      <div className="relative z-10 w-full max-w-7xl px-6 lg:px-12 py-24 flex flex-col justify-center">
        {/* What is StarkSplit Section */}
        <section id="features" className="scroll-mt-20 flex flex-col pt-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 w-full text-center lg:text-left"
          >
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[1.1] font-[family-name:var(--font-outfit)]">
              Splitting bills <span className="text-text-muted italic opacity-50">without the friction</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start pb-20">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-md font-medium">
                StarkSplit leverages Account Abstraction to remove the hurdles in Web3 payments: complex wallet management and fragmented settling.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {[
                  "Secure Settles",
                  "Email Sign-in",
                  "Instant Settles",
                  "Multi-Currency"
                ].map((feature) => (
                  <div key={feature} className="flex items-center space-x-3 group py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-white opacity-20 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-muted group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Premium Terminal / Preview */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative overflow-hidden rounded-[2px] border border-white/5 bg-void/80 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-2 py-1.5">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                    <div className="h-1.5 w-1.5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-text-muted">starksplit.session.v1</span>
                </div>
                <div className="p-3 font-mono text-[10px] space-y-2">
                  <div className="flex space-x-2">
                    <span className="text-white opacity-40">$</span>
                    <span className="text-white">starksplit create "Offsite Dinner"</span>
                  </div>
                  <div className="flex space-x-2 text-text-muted italic transition-all group-hover:translate-x-1 duration-700">
                    <span>..</span>
                    <span>Initializing smart account via Privy</span>
                  </div>
                  <div className="flex space-x-2 text-text-muted italic">
                    <span>..</span>
                    <span>Estimating transaction fee</span>
                  </div>
                  <div className="pt-1 flex items-center space-x-2">
                    <span className="text-white">→</span>
                    <span className="text-white font-bold bg-white/10 px-1 py-0.5 rounded-[1px]">SUCCESS</span>
                    <span className="text-text-muted truncate">starksplit.app/s/dinner_82x</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="text-center space-y-6 w-full -mt-16 pb-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white font-[family-name:var(--font-outfit)]">Ready to settle?</h2>
            <p className="text-lg sm:text-xl text-text-secondary font-medium tracking-wide">Join the zero-gravity payment movement.</p>
          </motion.div>
          <Button 
            onClick={() => setIsAuthModalOpen(true)}
            size="lg"
            className="group px-12 h-14 rounded-full font-black uppercase tracking-widest text-xs shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-all duration-500"
          >
            <AnimatedText text="Launch StarkSplit" />
          </Button>
        </section>
      </div>

      <footer className="w-full py-12 border-t border-white/5 bg-void">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white italic">SS</div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">© 2026 StarkSplit</span>
          </div>
          <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">
             Built for Starknet • Powered by Starkzap & Privy
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted cursor-pointer hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted cursor-pointer hover:text-white transition-colors">Terms</a>
            <a href="https://github.com/hopewell777/starksplit" target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted cursor-pointer hover:text-white transition-colors">Github</a>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </main>
  );
}
