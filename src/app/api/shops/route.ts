import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { sellerId: session.user.id },
  });
  return NextResponse.json(shop);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const shop = await prisma.shop.upsert({
    where: { sellerId: session.user.id },
    update: {
      name: body.name,
      description: body.description,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankHolder: body.bankHolder,
    },
    create: {
      sellerId: session.user.id,
      name: body.name,
      description: body.description,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankHolder: body.bankHolder,
    },
  });

  // Update user role to SELLER
  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "SELLER" },
  });

  return NextResponse.json(shop);
}
