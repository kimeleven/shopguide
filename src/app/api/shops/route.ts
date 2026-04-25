import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { sellerId: admin.id },
  });
  return NextResponse.json(shop);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const shop = await prisma.shop.upsert({
    where: { sellerId: admin.id },
    update: {
      name: body.name,
      description: body.description,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankHolder: body.bankHolder,
    },
    create: {
      sellerId: admin.id,
      name: body.name,
      description: body.description,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankHolder: body.bankHolder,
    },
  });

  // Update user role to SELLER
  await prisma.user.update({
    where: { id: admin.id },
    data: { role: "SELLER" },
  });

  return NextResponse.json(shop);
}
