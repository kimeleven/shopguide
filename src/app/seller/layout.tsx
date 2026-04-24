import Link from "next/link";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-3 flex items-center gap-6">
        <Link href="/seller/products" className="font-bold text-lg text-gray-900">
          ShopGuide 셀러
        </Link>
        <Link href="/seller/products" className="text-gray-600 hover:text-gray-900">
          상품관리
        </Link>
        <Link href="/seller/orders" className="text-gray-600 hover:text-gray-900">
          주문관리
        </Link>
      </nav>
      <div className="max-w-5xl mx-auto p-6">{children}</div>
    </div>
  );
}
