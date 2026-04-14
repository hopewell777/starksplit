"use client";

import { useState, useCallback } from "react";
import { useUser } from "./useUser";
import type { Expense } from "@/types";

export const useExpenses = () => {
  const { user } = useUser();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchExpenses = useCallback(async (signal?: AbortSignal) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/expenses?userId=${user.id}`, { signal });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Critical: Failed to fetch expenses from protocol interface", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const createExpense = async (data: { 
    title: string; 
    totalAmount: string; 
    currency: string; 
    splitType: string;
    tags?: string[];
    includeCreator?: boolean;
    participants: { walletAddress?: string; email?: string; userId?: string; amount?: string }[];
  }) => {
    if (!user?.id) return { success: false, error: "Authentication required" };

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const createdExpense = await response.json();
        await fetchExpenses();
        return { success: true, id: createdExpense.id };
      }
      
      const errorData = await response.json().catch(() => ({ error: "Protocol rejection" }));
      console.error("Expense creation failed:", errorData.error);
      return { success: false, error: errorData.error };
    } catch (error) {
      console.error("Network interface failure during expense creation:", error);
      return { success: false, error: "Network error" };
    }
  };

  return {
    expenses,
    isLoading,
    fetchExpenses,
    createExpense,
  };
};
