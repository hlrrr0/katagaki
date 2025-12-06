'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createTitle, getAllCategories } from '@/lib/firebase/firestore';
import { Category } from '@/lib/types/models';

export default function NewTitlePage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    base_price: 10000,
    price_tier: 'Standard' as 'Exclusive' | 'Standard' | 'Premium',
    official_number: '',
    is_official: false,
    status: 'draft' as 'available' | 'sold_out' | 'draft',
    purchasable_limit: 1,
    purchased_count: 0,
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
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('カテゴリの読み込みエラー:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // バリデーション
    if (!formData.name.trim()) {
      setError('肩書き名を入力してください');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('説明を入力してください');
      setLoading(false);
      return;
    }

    if (formData.base_price < 0) {
      setError('価格は0以上である必要があります');
      setLoading(false);
      return;
    }

    if (formData.purchasable_limit < 1) {
      setError('購入可能枠数は1以上である必要があります');
      setLoading(false);
      return;
    }

    try {
      await createTitle(formData);
      alert('肩書きを作成しました');
      router.push('/admin/titles');
    } catch (error) {
      console.error('作成エラー:', error);
      setError('肩書きの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/admin/titles" className="text-indigo-600 hover:underline mb-2 inline-block">
            ← 肩書き一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">新しい肩書きを追加</h1>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* 基本情報 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  肩書き名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例: 専業エモリスト"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="この肩書きについて詳しく説明してください"
                  required
                />
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  カテゴリ <span className="text-gray-500 text-xs">(任意)</span>
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">カテゴリなし</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name_ja}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 価格設定 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">価格設定</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 mb-2">
                  基本価格（年間） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">¥</span>
                  <input
                    id="base_price"
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="price_tier" className="block text-sm font-medium text-gray-700 mb-2">
                  価格ティア <span className="text-red-500">*</span>
                </label>
                <select
                  id="price_tier"
                  value={formData.price_tier}
                  onChange={(e) => setFormData({ ...formData, price_tier: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Exclusive">Exclusive</option>
                </select>
              </div>
            </div>
          </div>

          {/* 販売設定 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">販売設定</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="purchasable_limit" className="block text-sm font-medium text-gray-700 mb-2">
                  購入可能枠数 <span className="text-red-500">*</span>
                </label>
                <input
                  id="purchasable_limit"
                  type="number"
                  value={formData.purchasable_limit}
                  onChange={(e) => setFormData({ ...formData, purchasable_limit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  1で排他的、2以上で複数名購入可能
                </p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="draft">下書き</option>
                  <option value="available">販売中</option>
                  <option value="sold_out">売り切れ</option>
                </select>
              </div>
            </div>
          </div>

          {/* 公認設定 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">公認設定</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="is_official"
                  type="checkbox"
                  checked={formData.is_official}
                  onChange={(e) => setFormData({ ...formData, is_official: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_official" className="ml-2 block text-sm text-gray-900">
                  公認肩書きとして設定
                </label>
              </div>

              {formData.is_official && (
                <div>
                  <label htmlFor="official_number" className="block text-sm font-medium text-gray-700 mb-2">
                    公認番号
                  </label>
                  <input
                    id="official_number"
                    type="text"
                    value={formData.official_number}
                    onChange={(e) => setFormData({ ...formData, official_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="例: KK-2025-001"
                  />
                </div>
              )}
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || categories.length === 0}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '作成中...' : '肩書きを作成'}
            </button>
            <Link
              href="/admin/titles"
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
