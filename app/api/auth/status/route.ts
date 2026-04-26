import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "shopguide-secret-change-in-production");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.json({ authenticated: false });

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
