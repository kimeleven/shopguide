import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">ShopGuide</h1>
        <p className="text-lg text-gray-600">채팅으로 쉽게 주문하세요</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
          >
            카카오로 시작하기
          </Link>
          <Link
            href="/seller/products"
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
          >
            셀러 대시보드
          </Link>
        </div>
      </div>
    </main>
  );
}
