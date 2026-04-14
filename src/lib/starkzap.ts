import { StarkZap } from "starkzap";

let sdkInstance: StarkZap | null = null;

export function getStarkzapSDK() {
  if (!sdkInstance) {
    const network = (process.env.NEXT_PUBLIC_STARKNET_NETWORK as "sepolia" | "mainnet") || "sepolia";

    sdkInstance = new StarkZap({
      network,
    });
  }
  return sdkInstance;
}
