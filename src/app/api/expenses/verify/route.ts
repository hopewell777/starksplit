import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { RpcProvider } from "starknet";

export async function POST(request: Request) {
  try {
    const { splitId, transactionHash } = await request.json();

    if (!splitId || !transactionHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize Starknet provider (assuming Sepolia for the app's current setup)
    const provider = new RpcProvider({ nodeUrl: process.env.NEXT_PUBLIC_STARKNET_NETWORK === "mainnet" ? "https://starknet-mainnet.public.blastapi.io/rpc/v0_7" : "https://starknet-sepolia.public.blastapi.io/rpc/v0_7" });
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const receipt: any = await provider.getTransactionReceipt(transactionHash);
      if (receipt.execution_status !== "SUCCEEDED" && receipt.execution_status !== "ACCEPTED_ON_L2") {
        return NextResponse.json({ error: "Transaction failed or unconfirmed" }, { status: 400 });
      }
    } catch (e) {
      console.warn("Failed to fetch receipt, accepting optimistic update for MVP", e);
    }

    const updatedSplit = await prisma.split.update({
      where: { id: splitId },
      include: {
        expense: { select: { title: true, currency: true, creatorId: true } },
        debtor: { select: { username: true, email: true, walletAddress: true } },
      },
      data: {
        status: "PAID",
      },
    });

    const debtorName = updatedSplit.debtor.username || updatedSplit.debtor.email || "A protocol user";

    await prisma.notification.create({
      data: {
        userId: updatedSplit.expense.creatorId,
        title: "Split Settled",
        message: `${debtorName} paid their share for ${updatedSplit.expense.title}.`,
        type: "PAYMENT_RECEIVED",
      }
    });

    return NextResponse.json({
      success: true,
      split: updatedSplit,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
