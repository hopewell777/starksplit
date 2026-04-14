"use client";

import { useEffect, useState, useCallback } from "react";
import { uint256, hash } from "starknet";
import { useActiveStarknetAccount } from "./useActiveStarknetAccount";
import { mainnet, sepolia } from "@starknet-react/chains";

const TOKENS = {
  ETH: {
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
    symbol: "ETH",
    coingeckoId: "ethereum",
  },
  STRK: {
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    decimals: 18,
    symbol: "STRK",
    coingeckoId: "starknet",
  },
  USDC: {
    address: "0x053c912536959b3687ac2333f5c15ad199a20667c5b73f713c04d6e93535446f",
    decimals: 6,
    symbol: "USDC",
    coingeckoId: "usd-coin",
  },
};

export interface TokenBalance {
  symbol: string;
  amount: string;
  usdValue: string;
  icon?: string;
}

export const useBalances = (address?: string) => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useActiveStarknetAccount();

  const fetchBalances = useCallback(async () => {
    if (!address) {
      return;
    }

    setIsLoading(true);
    try {
      const currentChainId = (account as any)?.chainId;
      // Handle various chainId formats (BigInt, hex string, decimal string)
      // Mainnet: 0x534e5f4d41494e (SN_MAIN)
      // Sepolia: 0x534e5f5345504f4c4941 (SN_SEPOLIA)
      const isMainnet = currentChainId !== undefined && (
        String(currentChainId).toLowerCase() === "0x534e5f4d41494e" || 
        String(currentChainId) === "23448594291968334" || 
        String(currentChainId).toUpperCase() === "SN_MAIN" ||
        (typeof currentChainId === 'bigint' && currentChainId === BigInt("0x534e5f4d41494e"))
      );

      console.log(`[useBalances] Logic for address: ${address} | isMainnet: ${isMainnet} | Raw ChainID: ${currentChainId}`);
      
      const sanitizeRpc = (url: string | undefined): string | null => {
        if (!url) return null;
        return url.trim().replace(/^["'](.+)["']$/, '$1');
      };

      const RPC_ENDPOINTS = isMainnet 
        ? [
            sanitizeRpc(process.env.NEXT_PUBLIC_STARKNET_RPC_URL),
            "https://starknet-mainnet.public.blastapi.io",
            "https://free-rpc.nethermind.io/mainnet-juno",
            "https://rpc.starknet.lavanet.xyz/rpc/v0_7",
          ].filter(Boolean) as string[]
        : [
            sanitizeRpc(process.env.NEXT_PUBLIC_STARKNET_RPC_URL_SEPOLIA),
            "https://starknet-sepolia.public.blastapi.io",
            "https://free-rpc.nethermind.io/sepolia-juno",
            "https://rpc.starknet.lavanet.xyz/rpc/v0_7",
          ].filter(Boolean) as string[];

      if (RPC_ENDPOINTS.length === 0) {
        console.error("[useBalances] No RPC endpoints available!");
      }

      console.log(`[useBalances] Using ${RPC_ENDPOINTS.length} endpoints for ${isMainnet ? 'Mainnet' : 'Sepolia'}:`, RPC_ENDPOINTS);

      const rpcCall = async (nodeUrl: string, body: object): Promise<unknown | null> => {
        try {
          const res = await fetch(nodeUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const contentType = res.headers.get("content-type") ?? "";
          if (!res.ok) {
            console.warn(`[useBalances] RPC Error ${res.status} from ${nodeUrl}`);
            return null;
          }
          if (!contentType.includes("application/json")) {
            console.warn(`[useBalances] Non-JSON response from ${nodeUrl}`);
            return null;
          }
          const data = await res.json();
          return data;
        } catch (err) {
          console.error(`[useBalances] Fetch failed for ${nodeUrl}:`, err);
          return null;
        }
      };

      const callRpc = async (body: object): Promise<unknown | null> => {
        if (RPC_ENDPOINTS.length === 0) return null;
        for (const url of RPC_ENDPOINTS) {
          console.log(`[useBalances] Trying RPC: ${url}`);
          const result = await rpcCall(url, body);
          if (result !== null) {
            console.log(`[useBalances] Success from ${url}`);
            return result;
          }
        }
        console.error("[useBalances] All RPC endpoints failed!");
        return null;
      };

      let prices: Record<string, { usd: number }> = {
        ethereum: { usd: 3500 },
        starknet: { usd: 2.1 },
        "usd-coin": { usd: 1 },
      };

      try {
        const priceRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet,usd-coin&vs_currencies=usd`
        );
        if (priceRes.ok) {
          const fetchedPrices = await priceRes.json();
          if (fetchedPrices && Object.keys(fetchedPrices).length > 0) {
            prices = { ...prices, ...fetchedPrices };
          }
        }
      } catch (e) {
        console.warn("[useBalances] Failed to fetch prices, using defaults", e);
      }

      const balancePromises = Object.entries(TOKENS).map(async ([key, token]) => {
        try {
          const reqBody = {
            jsonrpc: "2.0",
            id: 1,
            method: "starknet_call",
            params: {
              request: {
                contract_address: token.address,
                entry_point_selector: hash.getSelectorFromName("balanceOf"),
                calldata: [address],
              },
              block_id: "latest",
            },
          };

          const jsonRes = await callRpc(reqBody) as { result?: string[] } | null;
          let balanceVal: { low: string | number; high: string | number } = { low: 0, high: 0 };

          if (jsonRes?.result && Array.isArray(jsonRes.result)) {
            if (jsonRes.result.length >= 2) {
              balanceVal = { low: jsonRes.result[0], high: jsonRes.result[1] };
            } else if (jsonRes.result.length === 1) {
              balanceVal = { low: jsonRes.result[0], high: 0 };
            }
          }

          const amountBN = uint256.uint256ToBN(balanceVal);
          const amountFloat = Number(amountBN) / 10 ** token.decimals;
          const amount = amountFloat.toFixed(4);
          const price = prices[token.coingeckoId]?.usd || 0;
          const usdValue = (amountFloat * price).toFixed(2);

          return { symbol: token.symbol, amount, usdValue };
        } catch (e) {
          return { symbol: token.symbol, amount: "0.0000", usdValue: "0.00" };
        }
      });

      const results = await Promise.all(balancePromises);
      setBalances(results);
    } catch (error) {
      console.error("fetchBalances error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address, account?.chainId]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return { balances, isLoading, refetch: fetchBalances };
};
