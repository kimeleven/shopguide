import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    const shop = await prisma.shop.findFirst();
    if (shop) {
      redirect(`/shop/${shop.id}`);
    }
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">ShopGuide</h1>
          <p className="text-gray-500">아직 등록된 쇼핑몰이 없습니다.</p>
          <p className="text-sm text-gray-400">셀러 등록 후 이용해 주세요.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">ShopGuide</h1>
        <p className="text-lg text-gray-600">채팅으로 쉽게 주문하세요</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            카카오로 시작하기
          </Link>
          <Link
            href="/admin/login"
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            관리자 로그인
          </Link>
        </div>
      </div>
    </main>
  );
}
