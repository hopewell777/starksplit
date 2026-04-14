"use client";

import { useState } from "react";
import { useStarkzap } from "./useStarkzap";
import { useExpenses } from "./useExpenses";
import { useWallets } from "@privy-io/react-auth";
import { uint256, CallData } from "starknet";
import { useActiveStarknetAccount } from "./useActiveStarknetAccount";
import { ArgentXV050Preset, sepoliaTokens, mainnetTokens, Amount, type Token, type Address } from "starkzap";

import { useBalances } from "./useBalances";

export const usePayment = () => {
  const sdk = useStarkzap();
  const { fetchExpenses } = useExpenses();
  const { account, address, isExternalWallet, isConnected } = useActiveStarknetAccount();
  const { refetch: refetchBalances } = useBalances(address);
  const { wallets } = useWallets();
  const [isPayingId, setIsPayingId] = useState<string | null>(null);

  const paySplit = async (
    splitId: string,
    recipientAddress: string,
    amount: string,
    currency: string
  ) => {
    if (!sdk) {
      return { success: false, error: "SDK not initialized" };
    }

    if (!isConnected || !address) {
      return { success: false, error: "No wallet connected. Please connect your wallet." };
    }

    // Determine current chain and tokens
    const currentChainId = (account as any)?.chainId;
    const isMainnet = currentChainId?.toString() === "0x534e5f4d41494e" ||
      currentChainId?.toString() === "23448594291968334" ||
      currentChainId?.toString() === "SN_MAIN";

    const tokens = isMainnet ? mainnetTokens : sepoliaTokens;
    const token = currency === "USDC" ? tokens.USDC : tokens.STRK;

    setIsPayingId(splitId);
    try {
      let txHash: string;

      if (isExternalWallet && account) {
        // Native external Starknet wallet (ArgentX, Braavos, Ready)
        // We use direct execution via the native account to avoid the "expected valid private key" 
        // error that occurs when using the SDK's signer strategy with external wallets.
        const rawAmount = Amount.parse(amount, token as Token).toBase();
        const amountUint256 = uint256.bnToUint256(rawAmount);

        const tx = await account.execute({
          contractAddress: token.address as string,
          entrypoint: "transfer",
          calldata: CallData.compile({
            recipient: recipientAddress,
            amount: amountUint256
          })
        });

        txHash = tx.transaction_hash;
      } else {
        // Privy embedded wallet
        const starknetWallet = wallets.find((w) => w.walletClientType === "starknet" || w.connectorType === "starknet");
        if (!starknetWallet) {
          throw new Error("No Starknet wallet found in Privy.");
        }

        const { wallet } = await sdk.onboard({
          strategy: "privy",
          feeMode: "standard",
          accountPreset: ArgentXV050Preset,
          privy: {
            resolve: async () => {
              return {
                walletId: starknetWallet.address,
                publicKey: starknetWallet.address,
                rawSign: async (walletId: string, messageHash: string) => {
                  const response = await starknetWallet.sign(messageHash);
                  return typeof response === "string" ? response : JSON.stringify(response);
                },
              };
            },
          },
        });

        await wallet.ensureReady({ deploy: "if_needed" });

        const tx = await wallet.transfer(token as Token, [
          {
            to: recipientAddress as Address,
            amount: Amount.parse(amount, token as Token)
          }
        ]);
        txHash = tx.hash;
      }

      if (txHash) {
        // 3. Notify backend to verify and update status
        const response = await fetch("/api/expenses/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            splitId,
            transactionHash: txHash,
          }),
        });

        if (response.ok) {
          await fetchExpenses();
          // Trigger balance refetch so changes reflect instantly in UI
          setTimeout(() => refetchBalances(), 2000);
          return { success: true, txHash };
        }
      }

      return { success: false, error: "Payment verification failed" };
    } catch (error) {
      console.error("Payment failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Payment failed"
      };
    } finally {
      setIsPayingId(null);
    }
  };

  return {
    paySplit,
    isPayingId,
  };
};
