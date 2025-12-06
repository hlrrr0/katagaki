'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Title, Category } from '@/lib/types/models';
import { getAllTitles, searchTitles, getAllCategories } from '@/lib/firebase/firestore';

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    loadCategories();
    loadTitles();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('カテゴリの読み込みエラー:', error);
    }
  };

  const loadTitles = async () => {
    setLoading(true);
    try {
      const titlesData = await getAllTitles();
      setTitles(titlesData);
    } catch (error) {
      console.error('肩書きの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams: any = {};
      if (searchName) searchParams.name = searchName;
      if (selectedCategory) searchParams.category_id = selectedCategory;
      if (selectedStatus) searchParams.status = selectedStatus;

      const results = await searchTitles(searchParams);
      setTitles(results);
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchName('');
    setSelectedCategory('');
    setSelectedStatus('');
    loadTitles();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      sold_out: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      available: '販売中',
      sold_out: '売り切れ',
      draft: '準備中',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPriceTierBadge = (tier: string) => {
    const styles = {
      Exclusive: 'bg-purple-100 text-purple-800',
      Premium: 'bg-blue-100 text-blue-800',
      Standard: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[tier as keyof typeof styles]}`}>
        {tier}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">肩書き一覧</h1>
          <p className="text-gray-600">あなたにぴったりの肩書きを見つけましょう</p>
        </div>

        {/* 検索フィルター */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-2">
                肩書き名
              </label>
              <input
                id="search-name"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="検索..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">すべて</option>
                <option value="available">販売中</option>
                <option value="sold_out">売り切れ</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleSearch}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
              >
                検索
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
              >
                リセット
              </button>
            </div>
          </div>
        </div>

        {/* 肩書き一覧 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : titles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">該当する肩書きが見つかりませんでした</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {titles.map((title) => (
              <Link
                key={title.title_id}
                href={`/titles/${title.title_id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                      {title.name}
                    </h3>
                    {title.is_official && (
                      <span className="text-2xl" title="公認">
                        🏆
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {title.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge(title.status)}
                    {getPriceTierBadge(title.price_tier)}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">
                        ¥{title.base_price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">年間</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        残り: {title.purchasable_limit - title.purchased_count}枠
                      </p>
                      <p className="text-xs text-gray-500">
                        / {title.purchasable_limit}枠
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 統計情報 */}
        {!loading && titles.length > 0 && (
          <div className="mt-8 text-center text-gray-600">
            <p>全 {titles.length} 件の肩書きが見つかりました</p>
          </div>
        )}
      </div>
    </div>
  );
}
