import { useAccount as useStarknetAccount } from "@starknet-react/core";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

export function useActiveStarknetAccount() {
  // 1. Native external Starknet wallets (ArgentX, Braavos, Ready)
  const { 
    account: starknetReactAccount, 
    address: starknetReactAddress, 
    status: starknetReactStatus,
    connector: starknetConnector
  } = useStarknetAccount();

  // 2. Privy generated wallets/auth
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  
  // Try to find if Privy provisioned an embedded starknet wallet
  const privyStarknetWallet = useMemo(() => {
    return user?.linkedAccounts.find(
      (acc) => acc.type === "wallet" && (acc as any).chainType === "starknet"
    );
  }, [user]);

  // Aggregate the active address
  const activeAddress = starknetReactAddress || (privyStarknetWallet as any)?.address;
  const isConnected = starknetReactStatus === "connected" || (authenticated && !!activeAddress);

  return {
    account: starknetReactAccount, // We prioritize native starknet-react account object for TXs
    address: activeAddress,
    isConnected,
    isExternalWallet: starknetReactStatus === "connected",
    isEmbeddedWallet: !!privyStarknetWallet,
    connector: starknetReactAccount ? starknetConnector : undefined,
    user
  };
}
