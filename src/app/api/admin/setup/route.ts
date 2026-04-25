import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// First-time admin setup — only works if no ADMIN exists
export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 8);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashed, role: "ADMIN" },
    create: { name, email, password: hashed, role: "ADMIN" },
  });

  return NextResponse.json({ ok: true, id: user.id });
}

export async function GET() {
  const adminExists = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  return NextResponse.json({ setup: !adminExists });
}
