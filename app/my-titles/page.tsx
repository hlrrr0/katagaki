'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getRightsByUserId, getTitleById } from '@/lib/firebase/firestore';
import { Right, Title } from '@/lib/types/models';
import { format } from 'date-fns';

interface RightWithTitle extends Right {
  titleData?: Title;
}

export default function MyTitlesPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [rights, setRights] = useState<RightWithTitle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/my-titles');
      } else {
        loadMyTitles();
      }
    }
  }, [user, authLoading]);

  const loadMyTitles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rightsData = await getRightsByUserId(user.uid);
      
      // 各権利に紐づく肩書き情報を取得
      const rightsWithTitles = await Promise.all(
        rightsData.map(async (right) => {
          const titleData = await getTitleById(right.title_id);
          return { ...right, titleData: titleData || undefined };
        })
      );

      setRights(rightsWithTitles);
    } catch (error) {
      console.error('保有肩書きの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (endDate: Date) => {
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: Date) => {
    return endDate < new Date();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">保有肩書き</h1>
          <p className="text-gray-600">
            あなたが現在保有している肩書きの一覧です
          </p>
        </div>

        {rights.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 text-lg mb-6">
              まだ肩書きを保有していません
            </p>
            <Link
              href="/titles"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              肩書きを探す
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* アクティブな権利 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                有効な肩書き
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rights
                  .filter((right) => right.is_active && !isExpired(right.end_date.toDate()))
                  .map((right) => (
                    <div
                      key={right.right_id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Link
                              href={`/titles/${right.title_id}`}
                              className="text-xl font-bold text-gray-900 hover:text-indigo-600"
                            >
                              {right.titleData?.name || '読み込み中...'}
                            </Link>
                            {right.titleData?.is_official && (
                              <span className="ml-2 text-2xl" title="公認">
                                🏆
                              </span>
                            )}
                          </div>
                        </div>

                        {right.titleData?.official_number && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded p-3 mb-4">
                            <p className="text-sm text-indigo-900 font-semibold">
                              公認番号: {right.titleData.official_number}
                            </p>
                          </div>
                        )}

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>権利開始日:</span>
                            <span className="font-medium">
                              {format(right.start_date.toDate(), 'yyyy年M月d日')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>権利終了日:</span>
                            <span className="font-medium">
                              {format(right.end_date.toDate(), 'yyyy年M月d日')}
                            </span>
                          </div>
                        </div>

                        {isExpiringSoon(right.end_date.toDate()) && (
                          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">
                              ⚠️ 権利の期限が近づいています
                            </p>
                          </div>
                        )}

                        <div className="mt-6 flex gap-2">
                          <Link
                            href={`/titles/${right.title_id}`}
                            className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition"
                          >
                            詳細を見る
                          </Link>
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition"
                            onClick={() => {
                              // 証明書ダウンロード機能（今後実装）
                              alert('証明書ダウンロード機能は準備中です');
                            }}
                          >
                            証明書
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 期限切れの権利 */}
            {rights.some((right) => !right.is_active || isExpired(right.end_date.toDate())) && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  期限切れ・無効な肩書き
                </h2>
                <div className="space-y-4">
                  {rights
                    .filter((right) => !right.is_active || isExpired(right.end_date.toDate()))
                    .map((right) => (
                      <div
                        key={right.right_id}
                        className="bg-white rounded-lg shadow-md p-4 opacity-60"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {right.titleData?.name || '読み込み中...'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              期限: {format(right.end_date.toDate(), 'yyyy年M月d日')}
                            </p>
                          </div>
                          <Link
                            href={`/titles/${right.title_id}`}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition"
                          >
                            更新する
                          </Link>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* プロフィール設定リンク */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            プロフィール設定
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            公認ページにプロフィールを公開すると、あなたの情報が肩書きの詳細ページに表示されます。
          </p>
          <Link
            href="/settings/profile"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 transition"
          >
            プロフィール設定へ
          </Link>
        </div>
      </div>
    </div>
  );
}
