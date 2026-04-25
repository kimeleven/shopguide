import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Create invite
export async function POST(req: NextRequest) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "SELLER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role: inviteRole } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = await prisma.invite.upsert({
    where: { email },
    update: {
      token: crypto.randomUUID(),
      role: inviteRole || "SELLER",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdBy: (session.user as any).id,
      usedAt: null,
      expiresAt,
    },
    create: {
      email,
      role: inviteRole || "SELLER",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdBy: (session.user as any).id,
      expiresAt,
    },
  });

  return NextResponse.json({ token: invite.token });
}

// List invites
export async function GET() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "SELLER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, usedAt: true, expiresAt: true, createdAt: true },
  });

  return NextResponse.json(invites);
}
