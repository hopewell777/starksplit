import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createExpenseSchema } from "@/lib/validators";
import { ZodError } from "zod";

// GET /api/expenses
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch expenses where user is creator OR user is in splits
    const expenses = await prisma.expense.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { splits: { some: { debtorId: userId } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, username: true, walletAddress: true, avatarUrl: true }
        },
        splits: {
          include: {
            debtor: {
              select: { id: true, username: true, walletAddress: true, avatarUrl: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/expenses
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createExpenseSchema.parse(body);
    const userId = req.headers.get("x-user-id"); // Temporary: fetch from header

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Resolve all participants to debtorIds OUTSIDE the transaction to prevent timeouts (P2028)
    const resolvedParticipants = await Promise.all(validatedData.participants.map(async (p) => {
      let debtorId = p.userId;
      if (!debtorId) {
        const where: any = {};
        if (p.email || p.walletAddress) {
          where.OR = [
            ...(p.email ? [{ email: p.email }] : []),
            ...(p.walletAddress ? [{ walletAddress: p.walletAddress }] : [])
          ];
        }
        const existingUser = await prisma.user.findFirst({ where });
        if (existingUser) {
          debtorId = existingUser.id;
        } else {
          // Create a "ghost" user if they are invited by email/wallet
          const ghostUser = await prisma.user.create({
            data: {
              privyId: `ghost_${Math.random().toString(36).substring(7)}`,
              email: p.email || null,
              walletAddress: p.walletAddress || null,
              username: p.email ? p.email.split("@")[0] : `ghost_${Math.random().toString(36).substring(7)}`,
            }
          });
          debtorId = ghostUser.id;
        }
      }
      return { ...p, debtorId };
    }));

    // 2. Deduplicate participants by debtorId to prevent P2002
    const uniqueParticipantsMap = new Map();
    resolvedParticipants.forEach(p => {
      if (!uniqueParticipantsMap.has(p.debtorId)) {
        uniqueParticipantsMap.set(p.debtorId, p);
      }
    });
    const uniqueParticipants = Array.from(uniqueParticipantsMap.values());

    const creator = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, walletAddress: true }
    });
    const creatorName = creator?.username || (creator?.walletAddress ? `${creator.walletAddress.slice(0, 6)}...` : "A user");

    // 3. Process participants and amounts within a lean transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const expense = await tx.expense.create({
        data: {
          title: validatedData.title,
          totalAmount: validatedData.totalAmount,
          currency: validatedData.currency,
          tags: validatedData.tags,
          splitType: validatedData.splitType,
          creatorId: userId,
        }
      });

      const numParticipants = uniqueParticipants.length;
      const totalAmount = parseFloat(validatedData.totalAmount);
      const divisor = numParticipants + (validatedData.includeCreator ? 1 : 0);
      const equalAmount = totalAmount / divisor;

      const splitsData = uniqueParticipants.map((p) => ({
        expenseId: expense.id,
        debtorId: p.debtorId!,
        amountOwed: validatedData.splitType === "EQUAL" ? equalAmount.toString() : (p.amount || "0"),
        status: "UNPAID",
      }));

      // Bulk create splits
      await tx.split.createMany({
        data: splitsData,
      });

      // Create Notifications
      const notificationsData = splitsData.map((s) => ({
        userId: s.debtorId,
        title: "Payment Requested",
        message: `${creatorName} requests you to pay ${parseFloat(s.amountOwed).toFixed(2)} ${validatedData.currency} for "${validatedData.title}".`,
        type: "SPLIT_CREATED"
      }));

      await tx.notification.createMany({
        data: notificationsData,
      });

      return expense;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Create expense error:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
