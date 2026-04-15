import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { privyId, email, walletAddress, username: providedUsername } = await req.json();

    if (!privyId) {
      return NextResponse.json({ error: "Privy ID is required" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { privyId },
      update: {
        email: email || undefined,
        walletAddress: walletAddress || undefined,
        username: providedUsername || undefined,
      },
      create: {
        privyId,
        email: email || null,
        walletAddress: walletAddress || null,
        username: providedUsername || (email ? email.split("@")[0] : `user_${privyId.substring(privyId.length - 6)}`),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { privyId, username, email } = await req.json();

    if (!privyId) {
      return NextResponse.json({ error: "Privy ID is required" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { privyId },
      data: {
        username: username || undefined,
        email: email || undefined,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
