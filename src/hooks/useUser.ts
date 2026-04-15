"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuthStore } from "@/store/useAuthStore";
import { useActiveStarknetAccount } from "./useActiveStarknetAccount";

interface DbUser {
  id: string;
  privyId: string;
  walletAddress: string | null;
  email: string | null;
  username: string | null;
  avatarUrl: string | null;
}

const getUsernameFromPrivy = (user: any) => {
  if (!user) return undefined;
  // Prioritize social names
  if (user.google?.name) return user.google.name;
  if (user.twitter?.name) return user.twitter.name;
  if (user.twitter?.username) return user.twitter.username;
  if (user.linkedin?.name) return user.linkedin.name;
  if (user.discord?.username) return user.discord.username;
  if (user.github?.username) return user.github.username;
  if (user.email?.address) return user.email.address.split('@')[0];
  return undefined;
};

export const useUser = () => {
  const { user, authenticated, ready } = usePrivy();
  const { address, isConnected } = useActiveStarknetAccount();
  const { user: storeUser, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    const syncUser = async () => {
      if (!ready || (!isConnected && !authenticated && !address)) {
        setIsLoading(false);
        if (ready && !isConnected) setUser(null);
        return;
      }

      try {
        // Specifically look for a Starknet-linked account in Privy to avoid EVM address confusion
        const privyStarknetAccount = user?.linkedAccounts.find(
          (acc) => acc.type === "wallet" && (acc as any).chainType === "starknet"
        );
        const privyStarknetAddress = (privyStarknetAccount as any)?.address;

        const response = await fetch("/api/auth/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            privyId: user?.id || `starknet-${address}`,
            email: user?.email?.address,
            walletAddress: address || privyStarknetAddress,
            username: getUsernameFromPrivy(user),
          }),
          signal: controller.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Failed to sync user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();

    return () => controller.abort();
  }, [user, authenticated, ready, isConnected, address, setUser]);

  const updateUser = async (data: { username?: string; email?: string }) => {
    const privyId = storeUser?.privyId || user?.id;
    if (!privyId) return { success: false, error: "Not authenticated" };

    try {
      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privyId,
          ...data,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return { success: true };
      } else {
        const errData = await response.json();
        return { success: false, error: errData.error || "Update failed" };
      }
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, error: "Network error" };
    }
  };

  return {
    user: storeUser as DbUser | null,
    updateUser,
    isLoading: isLoading || !ready,
    authenticated,
    isReady: ready,
  };
};
