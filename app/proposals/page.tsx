'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createProposal, getProposalsByUserId } from '@/lib/firebase/firestore';
import { Proposal } from '@/lib/types/models';

export default function ProposalsPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [proposedTitle, setProposedTitle] = useState('');
  const [proposalReason, setProposalReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/proposals');
      } else {
        loadProposals();
      }
    }
  }, [user, authLoading]);

  const loadProposals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const proposalsData = await getProposalsByUserId(user.uid);
      setProposals(proposalsData);
    } catch (error) {
      console.error('提案の読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!proposedTitle.trim()) {
      setError('肩書き名を入力してください');
      return;
    }

    if (!proposalReason.trim()) {
      setError('提案理由を入力してください');
      return;
    }

    setSubmitting(true);

    try {
      await createProposal({
        user_id: user!.uid,
        proposed_title: proposedTitle.trim(),
        proposal_reason: proposalReason.trim(),
        status: 'pending',
      });

      setSuccess('提案を送信しました！審査結果をお待ちください。');
      setProposedTitle('');
      setProposalReason('');
      setShowForm(false);
      loadProposals();
    } catch (error) {
      console.error('提案の送信エラー:', error);
      setError('提案の送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: '審査中',
      approved: '承認済み',
      rejected: '却下',
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">肩書き提案</h1>
          <p className="text-gray-600">
            サイトにない新しい肩書きを提案できます。運営が審査の上、採用を検討します。
          </p>
        </div>

        {/* 提案フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              + 新しい肩書きを提案する
            </button>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="proposedTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  提案する肩書き名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="proposedTitle"
                  type="text"
                  value={proposedTitle}
                  onChange={(e) => setProposedTitle(e.target.value)}
                  placeholder="例: 専業エモリスト"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="proposalReason" className="block text-sm font-medium text-gray-700 mb-2">
                  提案理由・説明 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="proposalReason"
                  value={proposalReason}
                  onChange={(e) => setProposalReason(e.target.value)}
                  placeholder="この肩書きが必要な理由や、どのような人が使うかなどを詳しく説明してください。"
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '送信中...' : '提案を送信'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  キャンセル
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 提案履歴 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            あなたの提案履歴
          </h2>

          {proposals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              まだ提案がありません
            </p>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div
                  key={proposal.proposal_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {proposal.proposed_title}
                    </h3>
                    {getStatusBadge(proposal.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">
                    {proposal.proposal_reason}
                  </p>
                  <p className="text-xs text-gray-500">
                    提案日: {proposal.proposed_at.toDate().toLocaleDateString('ja-JP')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
