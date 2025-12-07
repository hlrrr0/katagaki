'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db, isConfigured } from '@/lib/firebase/config';
import { User, COLLECTIONS } from '@/lib/types/models';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase が設定されていない場合は早期リターン
    if (!isConfigured || !auth || !db) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    // リダイレクト後の認証結果を処理
    const handleRedirectResult = async () => {
      if (!auth) return;
      try {
        console.log('リダイレクト結果をチェック中...');
        const result = await getRedirectResult(auth);
        console.log('リダイレクト結果:', result);
        
        if (result && result.user && db) {
          console.log('リダイレクト認証成功:', result.user.email);
          // Firestoreにユーザー情報を保存（既存ユーザーの場合はスキップ）
          const userDocRef = doc(db, COLLECTIONS.USERS, result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            console.log('新規ユーザーを作成中...');
            const newUserData: User = {
              user_id: result.user.uid,
              display_name: result.user.displayName || 'Google User',
              email: result.user.email || '',
              role: 'user',
              is_profile_public: false,
            };
            await setDoc(userDocRef, newUserData);
          }

          // リダイレクト先URLを取得
          const redirectUrl = localStorage.getItem('authRedirect') || '/';
          localStorage.removeItem('authRedirect');
          console.log('リダイレクト先:', redirectUrl);
          window.location.href = redirectUrl;
        }
      } catch (error) {
        console.error('リダイレクト認証エラー:', error);
      }
    };

    // 先にリダイレクト結果を処理してから、認証状態の監視を開始
    handleRedirectResult().then(() => {
      unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
        console.log('認証状態変更:', firebaseUser?.email || 'ログアウト');
        setUser(firebaseUser);
        
        if (firebaseUser && db) {
          // Firestoreからユーザーデータを取得
          const userDocRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            console.log('ユーザーデータ取得:', data);
            setUserData(data);
          } else {
            // 新規ユーザーの場合、デフォルトデータを作成
            const newUserData: User = {
              user_id: firebaseUser.uid,
              display_name: firebaseUser.displayName || 'ユーザー',
              email: firebaseUser.email || '',
              role: 'user',
              is_profile_public: false,
            };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } else {
          setUserData(null);
        }
        
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase is not configured');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth || !db) throw new Error('Firebase is not configured');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Firestoreにユーザー情報を保存
    const userDocRef = doc(db, COLLECTIONS.USERS, newUser.uid);
    const newUserData: User = {
      user_id: newUser.uid,
      display_name: displayName,
      email: newUser.email || '',
      role: 'user',
      is_profile_public: false,
    };
    await setDoc(userDocRef, newUserData);
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase is not configured');
    
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  const logout = async () => {
    if (!auth) throw new Error('Firebase is not configured');
    await signOut(auth);
  };

  const isAdmin = userData?.role === 'admin';

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
