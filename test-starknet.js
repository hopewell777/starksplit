const { RpcProvider, Contract } = require("starknet");
const ERC20_ABI = [
  {
    name: "Uint256",
    type: "struct",
    size: 2,
    members: [
      { name: "low", type: "felt", offset: 0 },
      { name: "high", type: "felt", offset: 1 },
    ],
  },
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "felt" }],
    outputs: [{ name: "balance", type: "Uint256" }],
    state_mutability: "view",
  }
];

try {
  const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.public.blastapi.io" });
  const contract = new Contract([...ERC20_ABI], "0x04718...", provider);
  console.log("Success");
} catch (e) {
  console.error("Error:", e.stack);
}
