import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminSession();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = await req.json(); // "approve" | "reject"

  const application = await prisma.sellerApplication.findUnique({ where: { id } });
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "reject") {
    await prisma.sellerApplication.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "approve") {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await prisma.invite.upsert({
      where: { email: application.email },
      update: {
        token: crypto.randomUUID(),
        role: "SELLER",
        createdBy: admin.id,
        usedAt: null,
        expiresAt,
      },
      create: {
        email: application.email,
        role: "SELLER",
        createdBy: admin.id,
        expiresAt,
      },
    });

    await prisma.sellerApplication.update({
      where: { id },
      data: { status: "APPROVED", inviteToken: invite.token },
    });

    return NextResponse.json({ ok: true, inviteToken: invite.token });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
