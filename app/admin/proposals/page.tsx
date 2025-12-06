'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAllProposals, updateProposal, getUserById } from '@/lib/firebase/firestore';
import { Proposal, User } from '@/lib/types/models';
import { Timestamp } from 'firebase/firestore';

interface ProposalWithUser extends Proposal {
  proposerName?: string;
}

export default function AdminProposalsPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState<ProposalWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        router.push('/');
      } else {
        loadProposals();
      }
    }
  }, [user, isAdmin, authLoading]);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const proposalsData = await getAllProposals();
      
      // 提案者の名前を取得
      const proposalsWithUsers = await Promise.all(
        proposalsData.map(async (proposal) => {
          const proposer = await getUserById(proposal.user_id);
          return {
            ...proposal,
            proposerName: proposer?.display_name || '不明なユーザー',
          };
        })
      );

      setProposals(proposalsWithUsers);
    } catch (error) {
      console.error('提案の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    proposalId: string,
    status: 'approved' | 'rejected',
    proposedTitle: string
  ) => {
    const statusText = status === 'approved' ? '承認' : '却下';
    if (!confirm(`「${proposedTitle}」を${statusText}しますか？`)) {
      return;
    }

    try {
      await updateProposal(proposalId, {
        status,
        reviewed_at: Timestamp.now(),
        reviewed_by: user!.uid,
      });
      alert(`提案を${statusText}しました`);
      loadProposals();
    } catch (error) {
      console.error('審査エラー:', error);
      alert('審査に失敗しました');
    }
  };

  const filteredProposals = proposals.filter((proposal) => {
    if (filterStatus && proposal.status !== filterStatus) return false;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">提案審査</h1>
          <p className="text-gray-600">ユーザーから提案された肩書きを審査</p>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              審査待ち ({proposals.filter((p) => p.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              承認済み ({proposals.filter((p) => p.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              却下 ({proposals.filter((p) => p.status === 'rejected').length})
            </button>
            <button
              onClick={() => setFilterStatus('')}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterStatus === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              すべて ({proposals.length})
            </button>
          </div>
        </div>

        {/* 提案リスト */}
        <div className="space-y-4">
          {filteredProposals.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">該当する提案がありません</p>
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <div
                key={proposal.proposal_id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {proposal.proposed_title}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          proposal.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : proposal.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {proposal.status === 'pending'
                          ? '審査待ち'
                          : proposal.status === 'approved'
                          ? '承認済み'
                          : '却下'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      提案者: <span className="font-medium">{proposal.proposerName}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      提案日: {proposal.proposed_at.toDate().toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">提案理由・説明</h4>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {proposal.proposal_reason}
                  </p>
                </div>

                {proposal.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleReview(proposal.proposal_id, 'approved', proposal.proposed_title)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition"
                    >
                      ✓ 承認
                    </button>
                    <button
                      onClick={() => handleReview(proposal.proposal_id, 'rejected', proposal.proposed_title)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition"
                    >
                      ✗ 却下
                    </button>
                  </div>
                )}

                {proposal.status === 'approved' && (
                  <div className="pt-4 border-t">
                    <Link
                      href={`/admin/titles/new?proposalId=${proposal.proposal_id}&name=${encodeURIComponent(proposal.proposed_title)}`}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition"
                    >
                      → この提案から肩書きを作成
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
