import { Timestamp } from 'firebase/firestore';

/**
 * 肩書き (Titles Collection)
 */
export interface Title {
  title_id: string;
  name: string;
  description: string;
  category_id: string;
  base_price: number;
  price_tier: 'Exclusive' | 'Standard' | 'Premium';
  official_number?: string;
  is_official: boolean;
  status: 'available' | 'sold_out' | 'draft';
  purchasable_limit: number;
  purchased_count: number;
  created_at: Timestamp;
}

/**
 * ユーザー (Users Collection)
 */
export interface User {
  user_id: string;
  display_name: string;
  email: string;
  role: 'admin' | 'user';
  stripe_customer_id?: string;
  public_profile_text?: string;
  is_profile_public: boolean;
  created_at?: Timestamp;
}

/**
 * 年間権利 / 購入履歴 (Rights Collection)
 */
export interface Right {
  right_id: string;
  title_id: string;
  user_id: string;
  start_date: Timestamp;
  end_date: Timestamp;
  is_active: boolean;
  stripe_subscription_id?: string;
  created_at: Timestamp;
}

/**
 * 提案 (Proposals Collection)
 */
export interface Proposal {
  proposal_id: string;
  user_id: string;
  proposed_title: string;
  proposal_reason: string;
  status: 'pending' | 'approved' | 'rejected';
  proposed_at: Timestamp;
  reviewed_at?: Timestamp;
  reviewed_by?: string;
}

/**
 * カテゴリ (Categories Collection)
 */
export interface Category {
  category_id: string;
  name_ja: string;
  sort_order: number;
  created_at?: Timestamp;
}

/**
 * Firestore Collection Names
 */
export const COLLECTIONS = {
  TITLES: 'titles',
  USERS: 'users',
  RIGHTS: 'rights',
  PROPOSALS: 'proposals',
  CATEGORIES: 'categories',
} as const;
