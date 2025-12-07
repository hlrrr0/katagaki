'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Title, Category, Right, User } from '@/lib/types/models';
import { getTitleById, getRightsByTitleId, getUserById } from '@/lib/firebase/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function TitleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData } = useAuth();
  const titleId = params.id as string;

  const [title, setTitle] = useState<Title | null>(null);
  const [rights, setRights] = useState<Right[]>([]);
  const [rightHolders, setRightHolders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (titleId) {
      loadTitleDetails();
    }
  }, [titleId]);

  const loadTitleDetails = async () => {
    setLoading(true);
    try {
      const titleData = await getTitleById(titleId);
      if (!titleData) {
        router.push('/titles');
        return;
      }
      setTitle(titleData);

      // 権利保有者を取得
      const rightsData = await getRightsByTitleId(titleId);
      setRights(rightsData);

      // 権利保有者のユーザー情報を取得（公開プロフィールのみ）
      const holders: User[] = [];
      for (const right of rightsData) {
        const holderData = await getUserById(right.user_id);
        if (holderData && holderData.is_profile_public) {
          holders.push(holderData);
        }
      }
      setRightHolders(holders);
    } catch (error) {
      console.error('肩書き詳細の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push('/login?redirect=/titles/' + titleId);
      return;
    }

    try {
      // Checkout Sessionを作成
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`,
        },
        body: JSON.stringify({
          titleId: title?.title_id,
          titleName: title?.name,
          price: title?.base_price,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Stripe Checkoutページにリダイレクト
        window.location.href = data.url;
      } else {
        alert('購入処理の開始に失敗しました');
      }
    } catch (error) {
      console.error('購入エラー:', error);
      alert('購入処理の開始に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!title) {
    return null;
  }

  const isAvailable = title.status === 'available' && title.purchased_count < title.purchasable_limit;
  const isSoldOut = title.status === 'sold_out' || title.purchased_count >= title.purchasable_limit;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-indigo-600">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/titles" className="hover:text-indigo-600">
                肩書き一覧
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{title.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              {/* タイトルとバッジ */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {title.name}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        isAvailable
                          ? 'bg-green-100 text-green-800'
                          : isSoldOut
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {isAvailable ? '販売中' : isSoldOut ? '売り切れ' : '準備中'}
                    </span>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {title.price_tier}
                    </span>
                  </div>
                </div>
                {title.is_official && (
                  <div className="text-6xl ml-4">🏆</div>
                )}
              </div>

              {/* 公認情報 */}
              {title.is_official && title.official_number && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✓</span>
                    <div>
                      <p className="font-semibold text-indigo-900">日本肩書き協会 公認</p>
                      <p className="text-sm text-indigo-700">
                        公認番号: {title.official_number}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 説明 */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  肩書きについて
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {title.description}
                </p>
              </div>

              {/* 購入可能枠数 */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  購入可能枠数
                </h2>
                <div className="flex items-center">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          title.purchased_count >= title.purchasable_limit
                            ? 'bg-red-600'
                            : 'bg-indigo-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            (title.purchased_count / title.purchasable_limit) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      残り {title.purchasable_limit - title.purchased_count} 枠
                    </p>
                    <p className="text-sm text-gray-600">
                      / 全{title.purchasable_limit}枠
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 権利保有者（公開プロフィール） */}
            {rightHolders.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  権利保有者
                </h2>
                <div className="space-y-4">
                  {rightHolders.map((holder) => (
                    <div
                      key={holder.user_id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <p className="font-semibold text-gray-900 mb-2">
                        {holder.display_name}
                      </p>
                      {holder.public_profile_text && (
                        <p className="text-sm text-gray-600">
                          {holder.public_profile_text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー（購入） */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="mb-6">
                <p className="text-3xl font-bold text-indigo-600 mb-1">
                  ¥{title.base_price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">年間権利</p>
              </div>

              {isAvailable ? (
                <button
                  onClick={handlePurchase}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition mb-4"
                >
                  購入手続きへ
                </button>
              ) : isSoldOut ? (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed mb-4"
                >
                  売り切れ
                </button>
              ) : (
                <button
                  disabled
                  className="w-full px-6 py-3 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed mb-4"
                >
                  準備中
                </button>
              )}

              <div className="border-t pt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>年間権利を取得</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>公認証明書発行</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>自動更新可能</span>
                </div>
              </div>
            </div>

            {/* お問い合わせリンク */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>ご不明な点がありますか？</p>
              <Link href="/contact" className="text-indigo-600 hover:underline">
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
