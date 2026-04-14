import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useExpenses } from "@/hooks/useExpenses";
import { Users, DollarSign, PieChart, ChevronRight, ChevronLeft, ChevronDown, Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/Switch";
import { TokenIcon } from "@/components/ui/TokenIcon";

interface Participant {
  name: string;
  address: string;
}
import { useActiveStarknetAccount } from "@/hooks/useActiveStarknetAccount";

export const SplitWizard = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { user } = usePrivy();
  const { address: userWallet } = useActiveStarknetAccount();
  const router = useRouter();
  const { createExpense } = useExpenses();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    currency: "STRK",
    participants: [] as Participant[],
    currentParticipant: { name: "", address: "" },
    includeMe: true,
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const addParticipant = () => {
    const { name, address: pAddress } = formData.currentParticipant;
    
    if (!name || !pAddress) return;

    // Check if duplicate address or email
      const isDuplicate = formData.participants.some(
      p => p.address.toLowerCase() === pAddress.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Participant already added", {
        description: "This wallet address or email is already in the participant list."
      });
      return;
    }

    // Check if adding self (their own address)
    // We assume the user linked wallet address is what we want to check against
    if (userWallet && pAddress.toLowerCase() === userWallet.toLowerCase()) {
      toast.error("Wallet address already used", {
        description: "Your address is already accounted for via the 'Include myself' toggle."
      });
      return;
    }

    setFormData({
      ...formData,
      participants: [...formData.participants, formData.currentParticipant],
      currentParticipant: { name: "", address: "" },
    });
  };

  const removeParticipant = (index: number) => {
    const newParticipants = [...formData.participants];
    newParticipants.splice(index, 1);
    setFormData({ ...formData, participants: newParticipants });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createExpense({
        title: formData.title,
        totalAmount: formData.amount,
        currency: formData.currency,
        splitType: "EQUAL",
        tags: [],
        includeCreator: formData.includeMe,
        participants: formData.participants.map(p => ({
          walletAddress: !p.address.includes("@") ? p.address : undefined,
          email: p.address.includes("@") ? p.address : undefined,
          amount: (Number(formData.amount) / (formData.participants.length + (formData.includeMe ? 1 : 0))).toString(),
        })),
      });

      if (result.success && result.id) {
        toast.success("Transaction Confirmed", {
          description: "Initiating digital receipt rendering..."
        });
        onClose(); // close modal
        router.push(`/split/${result.id}/success`); // Full page UPI-style redirect
      } else {
        toast.error("Failed to create split", {
          description: "Please check your network and try again."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      title: "",
      amount: "",
      currency: "STRK",
      participants: [],
      currentParticipant: { name: "", address: "" },
      includeMe: true,
    });
    onClose();
  };

  const currentStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all duration-700">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight font-[family-name:var(--font-outfit)]">Split Core</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium px-8">Define the transaction parameters and asset type.</p>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted transition-colors group-focus-within:text-white">Transaction Title</label>
                  <Input
                    placeholder="e.g. Dinner Settlement"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-14 text-sm font-semibold border-white/5 bg-white/[0.03] rounded-xl focus:ring-white/10"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Total Amount</label>
                    <div className="relative group/input">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted transition-colors group-focus-within/input:text-white">
                        <DollarSign size={16} />
                      </div>
                      <input 
                        className="w-full h-14 pl-12 pr-4 border border-white/5 rounded-xl bg-white/[0.03] text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/10 transition-all placeholder:text-white/10"
                        placeholder="0.00"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex flex-col justify-end">
                    <div className="relative group h-14">
                      <select 
                        className="w-full h-full pl-12 pr-10 border border-white/10 rounded-xl bg-white/[0.02] text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer hover:bg-white/5"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      >
                        <option value="STRK">STRK</option>
                        <option value="USDC">USDC</option>
                        <option value="ETH">ETH</option>
                      </select>
                      <div className="absolute left-4 top-[50%] -translate-y-1/2 pointer-events-none">
                        <TokenIcon symbol={formData.currency} size={20} />
                      </div>
                      <div className="absolute right-4 top-[50%] -translate-y-1/2 pointer-events-none text-text-muted">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all duration-700">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight font-[family-name:var(--font-outfit)]">Add Participants</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium  px-8">Identify participating entities for this settlement.</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4 rounded-xl bg-white/5 border border-white/5">
                <Input
                  placeholder="Identity Name"
                  value={formData.currentParticipant.name}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    currentParticipant: { ...formData.currentParticipant, name: e.target.value } 
                  })}
                  className="h-11"
                />
                <div className="flex space-x-2">
                  <Input
                    placeholder="Address / Email"
                    value={formData.currentParticipant.address}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      currentParticipant: { ...formData.currentParticipant, address: e.target.value } 
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addParticipant();
                      }
                    }}
                    className="h-11 flex-1 font-mono text-xs"
                  />
                  <Button onClick={addParticipant} className="h-11 w-11 p-0">
                    <Plus size={18} />
                  </Button>
                </div>
              </div>

              {/* Include Me Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white">
                    <Users size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">Include myself in split</p>
                    <p className="text-[10px] text-text-muted uppercase tracking-widest">You will absorb 1 portion of the total</p>
                  </div>
                </div>
                <Switch 
                  checked={formData.includeMe} 
                  onCheckedChange={(checked) => setFormData({ ...formData, includeMe: checked })} 
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-text-secondary">Participant Registry</label>
                <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                  {formData.participants.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs group-hover:bg-white group-hover:text-void transition-all">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{p.name}</p>
                          <p className="text-[10px] font-mono text-text-muted truncate w-32 sm:w-64">{p.address}</p>
                        </div>
                      </div>
                      <button onClick={() => removeParticipant(i)} className="p-1.5 text-text-muted hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.participants.length === 0 && (
                    <div className="text-center py-6 rounded-[2px] border border-dashed border-white/5">
                      <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em] italic">[ No entities found ]</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/5 transition-all duration-700">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight font-[family-name:var(--font-outfit)]">Review Split</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium px-8">Finalize the settlement distribution logic.</p>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <div className="p-6 border-b border-white/10 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Total Amount</p>
                  <p className="text-lg font-bold text-white tracking-tight">{formData.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white tracking-tight">{formData.amount} <span className="text-xs text-text-muted tracking-normal">{formData.currency}</span></p>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-text-muted mb-4 border-b border-white/5 pb-2">
                  <span>Entity</span>
                  <span>Allocation</span>
                </div>
                {/* User portion if included */}
                {formData.includeMe && (
                  <div className="flex justify-between items-center group py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px] text-white">
                        YOU
                      </div>
                      <span className="text-sm font-semibold text-white/60 italic">Your Share</span>
                    </div>
                    <div className="flex-1 border-b border-dotted border-white/10 mx-4 h-px opacity-10" />
                    <div className="flex items-center space-x-2">
                      <TokenIcon symbol={formData.currency} size={14} />
                      <span className="text-sm font-bold text-white/60">
                        {(Number(formData.amount) / (formData.participants.length + 1)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                {/* Participant portions */}
                {formData.participants.map((p, i) => (
                  <div key={i} className="flex justify-between items-center group py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px] text-white">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                    </div>
                    <div className="flex-1 border-b border-dotted border-white/10 mx-4 h-px opacity-20" />
                    <div className="flex items-center space-x-2">
                      <TokenIcon symbol={formData.currency} size={16} />
                      <span className="text-sm font-bold text-white uppercase tabular-nums">
                        {(Number(formData.amount) / (formData.participants.length + (formData.includeMe ? 1 : 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Step ${step} of 3`}>
      <div className="mt-4">
        {currentStepContent()}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={step === 1 ? handleClose : prevStep}
            disabled={isSubmitting}
            className="flex-1 border border-white/10 text-text-muted hover:text-white hover:bg-white/5"
          >
            {step === 1 ? "Cancel" : (
              <span className="flex items-center">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </span>
            )}
          </Button>

          {step < 3 ? (
            <Button 
              onClick={nextStep}
              className="flex-1"
              disabled={step === 1 ? !formData.title || !formData.amount : formData.participants.length === 0}
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              className="flex-1" 
              onClick={handleSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Finalize Split"
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
