import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getSellerProduct(productId: string, userId: string) {
  const shop = await prisma.shop.findUnique({ where: { sellerId: userId } });
  if (!shop) return null;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.shopId !== shop.id) return null;
  return product;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getSellerProduct(id, session.user.id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: body.name ?? product.name,
      price: body.price !== undefined ? body.price : product.price,
      active: body.active !== undefined ? body.active : product.active,
      option1Name: body.option1Name !== undefined ? (body.option1Name || null) : product.option1Name,
      option1Values: body.option1Values !== undefined ? (body.option1Values || null) : product.option1Values,
      option2Name: body.option2Name !== undefined ? (body.option2Name || null) : product.option2Name,
      option2Values: body.option2Values !== undefined ? (body.option2Values || null) : product.option2Values,
      option3Name: body.option3Name !== undefined ? (body.option3Name || null) : product.option3Name,
      option3Values: body.option3Values !== undefined ? (body.option3Values || null) : product.option3Values,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getSellerProduct(id, session.user.id);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
