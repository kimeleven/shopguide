import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

// Create invite
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SELLER")) {
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
      createdBy: admin.id,
      usedAt: null,
      expiresAt,
    },
    create: {
      email,
      role: inviteRole || "SELLER",
      createdBy: admin.id,
      expiresAt,
    },
  });

  return NextResponse.json({ token: invite.token });
}

// List invites
export async function GET() {
  const admin = await getAdminSession();
  if (!admin || (admin.role !== "ADMIN" && admin.role !== "SELLER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, usedAt: true, expiresAt: true, createdAt: true },
  });

  return NextResponse.json(invites);
}
