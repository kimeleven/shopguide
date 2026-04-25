import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { sellerId: admin.id },
  });
  if (!shop) {
    return NextResponse.json([]);
  }

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id },
    include: {
      items: { include: { product: true } },
      buyer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const order = await prisma.order.create({
    data: {
      shopId: body.shopId,
      buyerId: session.user.id,
      paymentMethod: body.paymentMethod,
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone,
      zipCode: body.zipCode,
      address: body.address,
      addressDetail: body.addressDetail,
      memo: body.memo,
      items: {
        create: body.items.map((item: { productId: string; quantity: number; option1?: string; option2?: string; option3?: string; price: number }) => ({
          productId: item.productId,
          quantity: item.quantity,
          option1: item.option1 || null,
          option2: item.option2 || null,
          option3: item.option3 || null,
          price: item.price,
        })),
      },
    },
    include: { items: true },
  });
  return NextResponse.json(order);
}
