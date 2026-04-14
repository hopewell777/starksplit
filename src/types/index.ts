export type SplitType = "EQUAL" | "CUSTOM";
export type ExpenseStatus = "PENDING" | "PARTIALLY_PAID" | "COMPLETED" | "CANCELLED";
export type SplitStatus = "UNPAID" | "PENDING_CONFIRMATION" | "PAID" | "FAILED";

export interface User {
  id: string;
  privyId: string;
  walletAddress?: string;
  email?: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  creatorId: string;
  title: string;
  totalAmount: string; // Decimal string
  currency: string;
  tags: string[];
  splitType: SplitType;
  status: ExpenseStatus;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  splits?: Split[];
}

export interface Split {
  id: string;
  expenseId: string;
  debtorId: string;
  amountOwed: string; // Decimal string
  status: SplitStatus;
  transactionHash?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  expense?: Expense;
  debtor?: User;
}
