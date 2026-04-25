import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, name, shopName, description } = await req.json();
  if (!email || !name || !shopName) {
    return NextResponse.json({ error: "이메일, 이름, 쇼핑몰명은 필수입니다." }, { status: 400 });
  }

  const existing = await prisma.sellerApplication.findFirst({
    where: { email, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ error: "이미 신청이 접수되어 심사 중입니다." }, { status: 409 });
  }

  await prisma.sellerApplication.create({
    data: { email, name, shopName, description },
  });

  return NextResponse.json({ ok: true });
}
