import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  QueryConstraint,
  Firestore,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Title, User, Right, Proposal, Category, COLLECTIONS } from '@/lib/types/models';

// Helper function to ensure Firestore is configured
function getDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not configured. Please set up Firebase environment variables.');
  }
  return db;
}

// ===== Titles =====
export async function getAllTitles(): Promise<Title[]> {
  const titlesCollection = collection(getDb(), COLLECTIONS.TITLES);
  const querySnapshot = await getDocs(
    query(titlesCollection, orderBy('created_at', 'desc'))
  );
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), title_id: doc.id } as Title));
}

export async function getTitleById(titleId: string): Promise<Title | null> {
  const titleDoc = await getDoc(doc(getDb(), COLLECTIONS.TITLES, titleId));
  if (!titleDoc.exists()) return null;
  return { ...titleDoc.data(), title_id: titleDoc.id } as Title;
}

export async function searchTitles(searchParams: {
  name?: string;
  category_id?: string;
  status?: string;
}): Promise<Title[]> {
  const titlesCollection = collection(getDb(), COLLECTIONS.TITLES);
  const constraints: QueryConstraint[] = [];

  if (searchParams.category_id) {
    constraints.push(where('category_id', '==', searchParams.category_id));
  }
  if (searchParams.status) {
    constraints.push(where('status', '==', searchParams.status));
  }

  const querySnapshot = await getDocs(query(titlesCollection, ...constraints));
  let titles = querySnapshot.docs.map((doc) => ({ ...doc.data(), title_id: doc.id } as Title));

  // クライアント側でnameフィルタリング (Firestoreは部分一致検索が難しいため)
  if (searchParams.name) {
    const searchTerm = searchParams.name.toLowerCase();
    titles = titles.filter((title) => title.name.toLowerCase().includes(searchTerm));
  }

  return titles;
}

// 次の公認番号を生成
async function generateOfficialNumber(): Promise<string> {
  const titlesCollection = collection(getDb(), COLLECTIONS.TITLES);
  const titlesSnapshot = await getDocs(titlesCollection);
  
  // 既存の公認番号から最大の番号を取得
  let maxNumber = 0;
  titlesSnapshot.forEach((doc) => {
    const title = doc.data() as Title;
    if (title.official_number && title.official_number.startsWith('ktgk_')) {
      const numberPart = title.official_number.replace('ktgk_', '');
      const num = parseInt(numberPart, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });
  
  // 次の番号を生成（6桁でゼロパディング）
  const nextNumber = maxNumber + 1;
  return `ktgk_${nextNumber.toString().padStart(6, '0')}`;
}

export async function createTitle(title: Omit<Title, 'title_id' | 'created_at' | 'official_number'>): Promise<string> {
  const titlesCollection = collection(getDb(), COLLECTIONS.TITLES);
  
  // 公認番号を自動生成
  const officialNumber = await generateOfficialNumber();
  
  const docRef = await addDoc(titlesCollection, {
    ...title,
    official_number: officialNumber,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateTitle(titleId: string, updates: Partial<Title>): Promise<void> {
  const titleDocRef = doc(getDb(), COLLECTIONS.TITLES, titleId);
  await updateDoc(titleDocRef, updates as any);
}

export async function deleteTitle(titleId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.TITLES, titleId));
}

// ===== Categories =====
export async function getAllCategories(): Promise<Category[]> {
  const categoriesCollection = collection(getDb(), COLLECTIONS.CATEGORIES);
  const querySnapshot = await getDocs(
    query(categoriesCollection, orderBy('sort_order', 'asc'))
  );
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), category_id: doc.id } as Category));
}

export async function createCategory(category: Omit<Category, 'category_id'>): Promise<string> {
  const categoriesCollection = collection(getDb(), COLLECTIONS.CATEGORIES);
  const docRef = await addDoc(categoriesCollection, category);
  return docRef.id;
}

export async function updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
  const categoryDocRef = doc(getDb(), COLLECTIONS.CATEGORIES, categoryId);
  await updateDoc(categoryDocRef, updates as any);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTIONS.CATEGORIES, categoryId));
}

// ===== Rights =====
export async function getRightsByUserId(userId: string): Promise<Right[]> {
  const rightsCollection = collection(getDb(), COLLECTIONS.RIGHTS);
  const querySnapshot = await getDocs(
    query(rightsCollection, where('user_id', '==', userId), where('is_active', '==', true))
  );
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), right_id: doc.id } as Right));
}

export async function getRightsByTitleId(titleId: string): Promise<Right[]> {
  const rightsCollection = collection(getDb(), COLLECTIONS.RIGHTS);
  const querySnapshot = await getDocs(
    query(rightsCollection, where('title_id', '==', titleId), where('is_active', '==', true))
  );
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), right_id: doc.id } as Right));
}

export async function createRight(right: Omit<Right, 'right_id' | 'created_at'>): Promise<string> {
  const rightsCollection = collection(getDb(), COLLECTIONS.RIGHTS);
  const docRef = await addDoc(rightsCollection, {
    ...right,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateRight(rightId: string, updates: Partial<Right>): Promise<void> {
  const rightDocRef = doc(getDb(), COLLECTIONS.RIGHTS, rightId);
  await updateDoc(rightDocRef, updates as any);
}

// ===== Proposals =====
export async function getAllProposals(): Promise<Proposal[]> {
  const proposalsCollection = collection(getDb(), COLLECTIONS.PROPOSALS);
  const querySnapshot = await getDocs(
    query(proposalsCollection, orderBy('proposed_at', 'desc'))
  );
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), proposal_id: doc.id } as Proposal));
}

export async function getProposalsByUserId(userId: string): Promise<Proposal[]> {
  const proposalsCollection = collection(getDb(), COLLECTIONS.PROPOSALS);
  const querySnapshot = await getDocs(
    query(proposalsCollection, where('user_id', '==', userId), orderBy('proposed_at', 'desc'))
  );
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), proposal_id: doc.id } as Proposal));
}

export async function createProposal(
  proposal: Omit<Proposal, 'proposal_id' | 'proposed_at'>
): Promise<string> {
  const proposalsCollection = collection(getDb(), COLLECTIONS.PROPOSALS);
  const docRef = await addDoc(proposalsCollection, {
    ...proposal,
    proposed_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateProposal(proposalId: string, updates: Partial<Proposal>): Promise<void> {
  const proposalDocRef = doc(getDb(), COLLECTIONS.PROPOSALS, proposalId);
  await updateDoc(proposalDocRef, updates as any);
}

// ===== Users =====
export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(getDb(), COLLECTIONS.USERS, userId));
  if (!userDoc.exists()) return null;
  return { ...userDoc.data(), user_id: userDoc.id } as User;
}

export async function getAllUsers(): Promise<User[]> {
  const usersCollection = collection(getDb(), COLLECTIONS.USERS);
  const querySnapshot = await getDocs(usersCollection);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), user_id: doc.id } as User));
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const userDocRef = doc(getDb(), COLLECTIONS.USERS, userId);
  await updateDoc(userDocRef, updates as any);
}
