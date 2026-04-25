import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const shopId = req.nextUrl.searchParams.get("shopId");

  if (shopId) {
    // 공개 쇼핑 페이지: 해당 shop의 활성 상품만
    const products = await prisma.product.findMany({
      where: { shopId, active: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  }

  // 셀러 대시보드: 인증된 셀러 본인 상품만
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

  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { sellerId: admin.id },
  });
  if (!shop) {
    return NextResponse.json({ error: "No shop found" }, { status: 403 });
  }

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      shopId: shop.id,
      name: body.name,
      price: body.price,
      option1Name: body.option1Name || null,
      option1Values: body.option1Values || null,
      option2Name: body.option2Name || null,
      option2Values: body.option2Values || null,
      option3Name: body.option3Name || null,
      option3Values: body.option3Values || null,
    },
  });
  return NextResponse.json(product);
}
