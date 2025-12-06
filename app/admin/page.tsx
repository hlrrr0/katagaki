'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllTitles, getAllProposals, getAllUsers } from '@/lib/firebase/firestore';
import { Title, Proposal, User } from '@/lib/types/models';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalTitles: 0,
    availableTitles: 0,
    totalProposals: 0,
    pendingProposals: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/admin');
      } else if (!isAdmin) {
        router.push('/');
      } else {
        loadStats();
      }
    }
  }, [user, isAdmin, authLoading]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [titles, proposals, users] = await Promise.all([
        getAllTitles(),
        getAllProposals(),
        getAllUsers(),
      ]);

      // 統計情報を計算
      const availableTitles = titles.filter((t) => t.status === 'available').length;
      const pendingProposals = proposals.filter((p) => p.status === 'pending').length;
      
      // 売上計算（購入された肩書きの合計）
      const totalRevenue = titles.reduce((sum, title) => {
        return sum + (title.purchased_count * title.base_price);
      }, 0);

      setStats({
        totalTitles: titles.length,
        availableTitles,
        totalProposals: proposals.length,
        pendingProposals,
        totalUsers: users.length,
        totalRevenue,
      });
    } catch (error) {
      console.error('統計情報の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">管理者ダッシュボード</h1>
          <p className="text-gray-600">日本肩書き協会の管理画面</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 肩書き統計 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">肩書き</h3>
              <div className="text-3xl">📋</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">総数</span>
                <span className="font-bold text-2xl text-indigo-600">{stats.totalTitles}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">販売中</span>
                <span className="font-medium">{stats.availableTitles}件</span>
              </div>
            </div>
            <Link
              href="/admin/titles"
              className="mt-4 block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              管理する
            </Link>
          </div>

          {/* 提案統計 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">提案</h3>
              <div className="text-3xl">💡</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">総数</span>
                <span className="font-bold text-2xl text-yellow-600">{stats.totalProposals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">審査待ち</span>
                <span className="font-medium">{stats.pendingProposals}件</span>
              </div>
            </div>
            <Link
              href="/admin/proposals"
              className="mt-4 block w-full text-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
            >
              審査する
            </Link>
          </div>

          {/* ユーザー統計 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">ユーザー</h3>
              <div className="text-3xl">👥</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">総数</span>
                <span className="font-bold text-2xl text-green-600">{stats.totalUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">登録ユーザー</span>
                <span className="font-medium">{stats.totalUsers}人</span>
              </div>
            </div>
            <Link
              href="/admin/users"
              className="mt-4 block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              管理する
            </Link>
          </div>

          {/* 売上統計 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">売上</h3>
              <div className="text-3xl">💰</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">累計</span>
                <span className="font-bold text-2xl text-purple-600">
                  ¥{stats.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">取引総額</span>
                <span className="font-medium">¥{stats.totalRevenue.toLocaleString()}</span>
              </div>
            </div>
            <button
              disabled
              className="mt-4 block w-full text-center px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
            >
              準備中
            </button>
          </div>

          {/* カテゴリ管理 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">カテゴリ</h3>
              <div className="text-3xl">🏷️</div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                肩書きのカテゴリを管理します
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              管理する
            </Link>
          </div>

          {/* 設定 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">設定</h3>
              <div className="text-3xl">⚙️</div>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                システム全体の設定
              </p>
            </div>
            <button
              disabled
              className="mt-4 block w-full text-center px-4 py-2 bg-gray-300 text-gray-600 rounded-md cursor-not-allowed"
            >
              準備中
            </button>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/titles/new"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <span className="mr-2">➕</span>
              新しい肩書きを追加
            </Link>
            <Link
              href="/admin/proposals"
              className="flex items-center justify-center px-4 py-3 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
            >
              <span className="mr-2">📝</span>
              提案を審査
            </Link>
            <Link
              href="/admin/categories/new"
              className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <span className="mr-2">🏷️</span>
              カテゴリを追加
            </Link>
            <Link
              href="/titles"
              className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              <span className="mr-2">👁️</span>
              サイトを表示
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
