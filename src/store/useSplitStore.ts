import { create } from "zustand";
import { SplitType } from "@/types";

interface Participant {
  id?: string;
  name?: string;
  walletAddress?: string;
  email?: string;
  amount?: string;
}

interface SplitWizardState {
  step: number;
  title: string;
  totalAmount: string;
  currency: string;
  tags: string[];
  splitType: SplitType;
  participants: Participant[];
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDetails: (title: string, amount: string, currency: string) => void;
  setTags: (tags: string[]) => void;
  setSplitType: (type: SplitType) => void;
  setParticipants: (participants: Participant[]) => void;
  reset: () => void;
}

export const useSplitStore = create<SplitWizardState>((set) => ({
  step: 1,
  title: "",
  totalAmount: "0",
  currency: "STRK",
  tags: [],
  splitType: "EQUAL",
  participants: [],

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  setDetails: (title, totalAmount, currency) => set({ title, totalAmount, currency }),
  setTags: (tags) => set({ tags }),
  setSplitType: (splitType) => set({ splitType }),
  setParticipants: (participants) => set({ participants }),
  reset: () => set({
    step: 1,
    title: "",
    totalAmount: "0",
    currency: "STRK",
    tags: [],
    splitType: "EQUAL",
    participants: [],
  }),
}));
