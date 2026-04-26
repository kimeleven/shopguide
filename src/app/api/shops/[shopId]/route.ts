import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  const { shopId } = await params;
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      description: true,
      bankName: true,
      bankAccount: true,
      bankHolder: true,
    },
  });
  if (!shop) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(shop);
}
