export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              日本肩書き協会について
            </h3>
            <p className="text-sm text-gray-600">
              公認された「肩書き」の年間権利を提供し、個人のアイデンティティとブランディングを支援します。
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              リンク
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/titles" className="text-sm text-gray-600 hover:text-gray-900">
                  肩書き一覧
                </a>
              </li>
              <li>
                <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  協会について
                </a>
              </li>
              <li>
                <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  利用規約
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              お問い合わせ
            </h3>
            <p className="text-sm text-gray-600">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2025 日本肩書き協会. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
