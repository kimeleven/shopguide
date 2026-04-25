import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createAdminToken, adminCookieOptions } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
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

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieOptions(token));
  return res;
}
