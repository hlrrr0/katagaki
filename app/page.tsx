import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            日本肩書き協会
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            公認された「肩書き」の年間権利を取得し、<br />
            あなたのアイデンティティとブランディングを確立しましょう
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/titles"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              肩書きを探す
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              新規登録
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          サービスの特徴
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">公認肩書き</h3>
            <p className="text-gray-600">
              日本肩書き協会が公認した肩書きには、公認番号と証明書が発行されます
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">肩書き提案</h3>
            <p className="text-gray-600">
              サイトにない肩書きは、運営に提案することができます
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">安全な決済</h3>
            <p className="text-gray-600">
              Stripeによる安全な決済システムで年間権利を購入できます
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            あなたらしい肩書きを見つけて、新しいアイデンティティを手に入れよう
          </p>
          <Link
            href="/titles"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
          >
            肩書きを探す
          </Link>
        </div>
      </div>
    </div>
  );
}
