"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useActiveStarknetAccount } from "@/hooks/useActiveStarknetAccount";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated: privyAuthenticated, ready: privyReady } = usePrivy();
  const { isConnected: starknetConnected } = useActiveStarknetAccount();
  const router = useRouter();

  // The application is ready when Privy finishes initializing
  const ready = privyReady;
  // A user is functionally authenticated if they have connected via email (Privy) OR connected a native starknet wallet
  const isAuthenticated = starknetConnected || privyAuthenticated;

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push("/");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-void p-4">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="flex space-x-4">
            <Skeleton className="h-96 w-64" />
            <Skeleton className="h-96 flex-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:pl-64 min-h-[calc(100vh-64px)]">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
