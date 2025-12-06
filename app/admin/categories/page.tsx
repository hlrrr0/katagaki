'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firebase/firestore';
import { Category } from '@/lib/types/models';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name_ja: '',
    sort_order: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        loadCategories();
      }
    }
  }, [user, isAdmin, authLoading]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('カテゴリの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name_ja.trim()) {
      alert('カテゴリ名を入力してください');
      return;
    }

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        alert('カテゴリを更新しました');
      } else {
        await createCategory(formData);
        alert('カテゴリを作成しました');
      }
      
      setFormData({ name_ja: '', sort_order: 0 });
      setShowForm(false);
      setEditingId(null);
      loadCategories();
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.category_id);
    setFormData({
      name_ja: category.name_ja,
      sort_order: category.sort_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    if (!confirm(`本当に「${categoryName}」を削除しますか？\nこのカテゴリを使用している肩書きがある場合、問題が発生する可能性があります。`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      alert('カテゴリを削除しました');
      loadCategories();
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name_ja: '', sort_order: 0 });
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
        {/* ヘッダー */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/admin" className="text-indigo-600 hover:underline mb-2 inline-block">
              ← ダッシュボードに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">カテゴリ管理</h1>
            <p className="text-gray-600">肩書きのカテゴリを管理</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              ➕ 新規追加
            </button>
          )}
        </div>

        {/* フォーム */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'カテゴリを編集' : '新しいカテゴリを追加'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name_ja" className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name_ja"
                    type="text"
                    value={formData.name_ja}
                    onChange={(e) => setFormData({ ...formData, name_ja: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="例: ビジネス"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
                    表示順序
                  </label>
                  <input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">数字が小さいほど上に表示されます</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
                >
                  {editingId ? '更新' : '作成'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* カテゴリリスト */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    表示順序
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.category_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name_ja}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.sort_order}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(category.category_id, category.name_ja)}
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

          {categories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">カテゴリがありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
