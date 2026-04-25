import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json();
  if (!token || !name || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Already used" }, { status: 410 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Expired" }, { status: 410 });

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: invite.email },
    update: { name, password: hashed, role: invite.role },
    create: { name, email: invite.email, password: hashed, role: invite.role },
  });

  await prisma.invite.update({ where: { token }, data: { usedAt: new Date() } });

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token required" }, { status: 400 });

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Already used" }, { status: 410 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Expired" }, { status: 410 });

  return NextResponse.json({ email: invite.email, role: invite.role });
}
