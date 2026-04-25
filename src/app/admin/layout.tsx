import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-4 py-3 flex items-center gap-4 overflow-x-auto">
        <Link href="/seller/products" className="font-bold text-lg text-gray-900 whitespace-nowrap shrink-0">
          ShopGuide 관리
        </Link>
        <Link href="/seller/products" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
          상품관리
        </Link>
        <Link href="/seller/orders" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
          주문관리
        </Link>
        <Link href="/admin/invite" className="text-gray-600 hover:text-gray-900 whitespace-nowrap">
          사용자 초대
        </Link>
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
