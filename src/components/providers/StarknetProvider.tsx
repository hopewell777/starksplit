"use client";
import { ReactNode, useMemo } from "react";
import {
  StarknetConfig,
  jsonRpcProvider,
  argent,
  braavos,
  ready,
  starkscan,
  avnuPaymasterProvider,
} from "@starknet-react/core";
import { mainnet as baseMainnet, sepolia as baseSepolia } from "@starknet-react/chains";

/**
 * StarknetProvider - Satisfier Stabilization
 * 
 * This version uses a "Satisfier" strategy to resolve the contradictory requirements
 * of starknet-react v5. It provides valid (but non-functional) paymaster metadata 
 * and a corresponding provider to prevent both TypeErrors and the "No paymaster" error.
 */

export function StarknetProvider({ children }: { children: ReactNode }) {
  // 1. Standard Connectors
  const connectors = useMemo(() => [
    argent(),
    braavos(),
    ready(),
  ], []);

  // 2. Satisfier Chain Definitions
  // We provide a real URL structure to satisfy internal library checks.
  const chains = useMemo(() => {
    const augment = (chain: any) => ({
      ...chain,
      paymasterRpcUrls: {
        avnu: {
          // Providing a real public URL satisfies the "avnuPaymasterProvider" internal check
          http: ["https://starknet-mainnet.public.blastapi.io/rpc/v0_7"]
        }
      }
    });
    return [augment(baseMainnet), augment(baseSepolia)];
  }, []);

  // 3. Robust RPC Provider (v0.7+ spec compliant)
  const provider = jsonRpcProvider({
    rpc: (chain) => {
      // Mainnet: 0x534e5f4d41494e
      if (chain.id === BigInt("0x534e5f4d41494e")) {
        return { 
          nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io/rpc/v0_7"
        };
      }
      return { 
        nodeUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL_SEPOLIA || "https://starknet-sepolia.public.blastapi.io/rpc/v0_7"
      };
    },
  });

  // 4. Satisfier Paymaster Provider
  // Initializing this satisfies the "No paymaster provider found" error.
  // Using an empty key ensures no actual sponsorship happens.
  const paymaster = avnuPaymasterProvider({
    apiKey: "", 
  });

  return (
    <StarknetConfig
      chains={chains}
      provider={provider}
      connectors={connectors}
      explorer={starkscan}
      autoConnect={true}
      paymasterProvider={paymaster}
    >
      {children}
    </StarknetConfig>
  );
}
