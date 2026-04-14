import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  totalAmount: z.string().regex(/^\d+(\.\d+)?$/, "Invalid amount"),
  currency: z.string().default("STRK"),
  tags: z.array(z.string()).default([]),
  splitType: z.enum(["EQUAL", "CUSTOM"]).default("EQUAL"),
  participants: z.array(z.object({
    userId: z.string().optional(),
    walletAddress: z.string().optional(),
    email: z.string().email().optional(),
    amount: z.string().optional(), // For custom splits
  })).min(1, "At least one participant is required"),
  includeCreator: z.boolean().default(false),
});

export const verifyPaymentSchema = z.object({
  splitId: z.string().min(1, "Split ID is required"),
  transactionHash: z.string().startsWith("0x", "Invalid transaction hash"),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
