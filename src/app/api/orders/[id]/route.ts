import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

const VALID_STATUSES = ["PENDING", "PAID", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({ where: { sellerId: admin.id } });
  if (!shop) {
    return NextResponse.json({ error: "No shop found" }, { status: 403 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.shopId !== shop.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: body.status },
    include: {
      items: { include: { product: true } },
      buyer: { select: { name: true, email: true } },
    },
  });
  return NextResponse.json(updated);
}
