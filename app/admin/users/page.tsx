'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllUsers, updateUser, getRightsByUserId } from '@/lib/firebase/firestore';
import { User } from '@/lib/types/models';

interface UserWithStats extends User {
  titlesCount?: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        loadUsers();
      }
    }
  }, [user, isAdmin, authLoading]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      
      // 各ユーザーの保有肩書き数を取得
      const usersWithStats = await Promise.all(
        usersData.map(async (userData) => {
          try {
            const rights = await getRightsByUserId(userData.user_id);
            return {
              ...userData,
              titlesCount: rights.filter((r) => r.is_active).length,
            };
          } catch {
            return { ...userData, titlesCount: 0 };
          }
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('ユーザーの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, userName: string, newRole: 'admin' | 'user') => {
    const roleText = newRole === 'admin' ? '管理者' : '一般ユーザー';
    if (!confirm(`「${userName}」のロールを${roleText}に変更しますか？`)) {
      return;
    }

    try {
      await updateUser(userId, { role: newRole });
      alert(`ロールを${roleText}に変更しました`);
      loadUsers();
    } catch (error) {
      console.error('ロール変更エラー:', error);
      alert('ロール変更に失敗しました');
    }
  };

  const filteredUsers = users.filter((userData) => {
    if (filterRole && userData.role !== filterRole) return false;
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
        <div className="mb-8">
          <Link href="/admin" className="text-indigo-600 hover:underline mb-2 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ユーザー管理</h1>
          <p className="text-gray-600">登録ユーザーの管理とロール設定</p>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilterRole('')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterRole === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              すべて ({users.length})
            </button>
            <button
              onClick={() => setFilterRole('user')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterRole === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              一般ユーザー ({users.filter((u) => u.role === 'user').length})
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterRole === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              管理者 ({users.filter((u) => u.role === 'admin').length})
            </button>
          </div>
        </div>

        {/* ユーザーテーブル */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    メール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ロール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    保有肩書き
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    プロフィール公開
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userData) => (
                  <tr key={userData.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userData.display_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {userData.user_id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userData.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userData.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {userData.role === 'admin' ? '管理者' : '一般ユーザー'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userData.titlesCount || 0} 件
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {userData.is_profile_public ? (
                        <span className="text-green-600">✓ 公開</span>
                      ) : (
                        <span className="text-gray-400">非公開</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {userData.user_id !== user?.uid && (
                        <div className="flex justify-end gap-2">
                          {userData.role === 'user' ? (
                            <button
                              onClick={() =>
                                handleRoleChange(userData.user_id, userData.display_name, 'admin')
                              }
                              className="text-purple-600 hover:text-purple-900"
                            >
                              管理者にする
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleRoleChange(userData.user_id, userData.display_name, 'user')
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              一般ユーザーにする
                            </button>
                          )}
                        </div>
                      )}
                      {userData.user_id === user?.uid && (
                        <span className="text-gray-400 text-xs">あなた</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">該当するユーザーがいません</p>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>管理者は管理画面にアクセスし、すべての機能を使用できます</li>
            <li>自分自身のロールは変更できません</li>
            <li>管理者権限の付与は慎重に行ってください</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
