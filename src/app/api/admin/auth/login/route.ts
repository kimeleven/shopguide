import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAdminToken, adminCookieOptions } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력하세요." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }
  if (user.role !== "ADMIN" && user.role !== "SELLER") {
    return NextResponse.json({ error: "접근 권한이 없습니다." }, { status: 403 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = await createAdminToken({
    id: user.id,
    email: user.email!,
    name: user.name ?? "",
    role: user.role,
  });

  // Auto-create shop if seller/admin has none
  if (user.role === "SELLER" || user.role === "ADMIN") {
    const existingShop = await prisma.shop.findUnique({ where: { sellerId: user.id } });
    if (!existingShop) {
      await prisma.shop.create({
        data: {
          sellerId: user.id,
          name: `${user.name ?? user.email}의 샵`,
        },
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieOptions(token));
  return res;
  } catch (e) {
    console.error("Admin login error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
