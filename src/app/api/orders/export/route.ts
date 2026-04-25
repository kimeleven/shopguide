import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import * as XLSX from "xlsx";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = await prisma.shop.findUnique({
    where: { sellerId: admin.id },
  });
  if (!shop) {
    return NextResponse.json({ error: "No shop" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id },
    include: {
      items: { include: { product: true } },
      buyer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = orders.flatMap((order) =>
    order.items.map((item) => ({
      주문번호: order.id.slice(-8),
      주문일시: new Date(order.createdAt).toLocaleString("ko-KR"),
      상태: order.status,
      상품명: item.product.name,
      선택사항1: item.option1 || "",
      선택사항2: item.option2 || "",
      선택사항3: item.option3 || "",
      수량: item.quantity,
      금액: item.price,
      결제방법: order.paymentMethod || "",
      수취인: order.recipientName || "",
      연락처: order.recipientPhone || "",
      우편번호: order.zipCode || "",
      주소: order.address || "",
      상세주소: order.addressDetail || "",
      메모: order.memo || "",
    }))
  );

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "주문목록");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="orders.xlsx"`,
    },
  });
}
