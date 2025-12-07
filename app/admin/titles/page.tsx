'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllTitles, deleteTitle, getAllCategories } from '@/lib/firebase/firestore';
import { Title, Category } from '@/lib/types/models';

export default function AdminTitlesPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        loadData();
      }
    }
  }, [user, isAdmin, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [titlesData, categoriesData] = await Promise.all([
        getAllTitles(),
        getAllCategories(),
      ]);
      setTitles(titlesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('データの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (titleId: string, titleName: string) => {
    if (!confirm(`本当に「${titleName}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      await deleteTitle(titleId);
      alert('肩書きを削除しました');
      loadData();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.category_id === categoryId);
    return category?.name_ja || 'カテゴリなし';
  };

  const filteredTitles = titles.filter((title) => {
    if (filterStatus && title.status !== filterStatus) return false;
    if (filterCategory && title.category_id !== filterCategory) return false;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/admin" className="text-indigo-600 hover:underline mb-2 inline-block">
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">肩書き管理</h1>
            <p className="text-gray-600">登録されている肩書きの管理</p>
          </div>
          <Link
            href="/admin/titles/new"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            ➕ 新規追加
          </Link>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">すべて</option>
                <option value="available">販売中</option>
                <option value="sold_out">売り切れ</option>
                <option value="draft">下書き</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">すべて</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name_ja}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterCategory('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                リセット
              </button>
            </div>
          </div>
        </div>

        {/* 統計 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <p className="text-gray-600">
            表示中: <span className="font-bold">{filteredTitles.length}</span> 件 / 全 {titles.length} 件
          </p>
        </div>

        {/* テーブル */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    肩書き名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    価格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    購入状況
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公認
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTitles.map((title) => (
                  <tr key={title.title_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {title.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {title.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {title.category_id ? getCategoryName(title.category_id) : '未分類'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ¥{title.base_price.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {title.price_tier}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {title.purchased_count} / {title.purchasable_limit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          title.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : title.status === 'sold_out'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {title.status === 'available'
                          ? '販売中'
                          : title.status === 'sold_out'
                          ? '売り切れ'
                          : '下書き'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {title.is_official ? (
                        <span className="text-2xl" title="公認">
                          🏆
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/titles/${title.title_id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          編集
                        </Link>
                        <Link
                          href={`/titles/${title.title_id}`}
                          className="text-blue-600 hover:text-blue-900"
                          target="_blank"
                        >
                          表示
                        </Link>
                        <button
                          onClick={() => handleDelete(title.title_id, title.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTitles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">該当する肩書きがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
