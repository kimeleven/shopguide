import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// JWT 비밀키 (CLAUDE.md feedback에 따라 jose 커스텀 JWT 사용)
const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "shopguide-secret-change-in-production");

export async function POST(req: NextRequest) {
  // JWT 쿠키 삭제
  const response = NextResponse.json({ ok: true, message: "로그아웃 완료" });
  response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  return response;
}
