# Firebase設定ガイド

## 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `katagaki` (任意の名前)
4. Googleアナリティクスは任意で設定
5. プロジェクトを作成

## 2. Firebase Authenticationの設定

1. Firebase Consoleで左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを選択
4. 「メール/パスワード」を有効化
   - 「メール/パスワード」をクリック
   - 「有効にする」トグルをオン
   - 「保存」をクリック

## 3. Cloud Firestoreの設定

1. Firebase Consoleで左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（推奨: `asia-northeast1` (東京)）
4. セキュリティルールは「本番環境モード」で開始
5. 「有効にする」をクリック

### Firestoreセキュリティルールの設定

「ルール」タブで以下のルールを設定してください:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Titles collection - 誰でも読める、管理者のみ書き込める
    match /titles/{titleId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Categories collection - 誰でも読める、管理者のみ書き込める
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Users collection - 自分のドキュメントのみ読み書き可能、管理者は全て可能
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId) || isAdmin();
    }
    
    // Rights collection - 自分の権利のみ読める、作成は認証ユーザー、更新は管理者のみ
    match /rights/{rightId} {
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
    
    // Proposals collection - 自分の提案のみ読める、作成は認証ユーザー、更新は管理者または本人
    match /proposals/{proposalId} {
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.userId) || isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

## 4. Firebase設定情報の取得

1. Firebase Consoleのプロジェクト設定（⚙️アイコン）を開く
2. 「全般」タブを選択
3. 下にスクロールして「マイアプリ」セクションへ
4. 「</>」（Web）アイコンをクリック
5. アプリのニックネーム: `katagaki-web` (任意)
6. 「アプリを登録」をクリック
7. 表示された設定情報をコピー

## 5. ローカル環境変数の設定

プロジェクトルートの `.env.local` ファイルに以下を設定:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 6. Vercel環境変数の設定

1. [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
2. `katagaki` プロジェクトを選択
3. 「Settings」タブを開く
4. 左メニューから「Environment Variables」を選択
5. 以下の環境変数を追加（`.env.local` と同じ値）:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
6. 各環境変数で「Production」「Preview」「Development」すべてにチェック
7. 「Save」をクリック

## 7. 初期管理者ユーザーの作成

### 方法1: Firebase Consoleから手動作成

1. アプリケーションから通常のユーザー登録を行う
2. Firebase Console > Authentication > Users から該当ユーザーのUIDをコピー
3. Firestore Database > `users` コレクションへ移動
4. 手動でドキュメントを作成:
   - ドキュメントID: コピーしたUID
   - フィールド:
     ```
     email: "admin@example.com"
     role: "admin"
     displayName: "管理者"
     createdAt: (現在のタイムスタンプ)
     ```

### 方法2: コードから作成（開発時のみ）

サインアップ後、Firestoreコンソールで該当ユーザーの `role` フィールドを `"admin"` に変更。

## 8. 再デプロイ

環境変数を設定したら、Vercelで再デプロイ:

1. Vercel Dashboard > Deployments
2. 最新のデプロイメントの「...」メニューをクリック
3. 「Redeploy」を選択

または、GitHubにプッシュして自動デプロイ:

```bash
git add .
git commit -m "Add Firebase configuration"
git push
```

## 9. 動作確認

1. デプロイされたURLにアクセス
2. サインアップ機能でユーザー登録
3. Firestore Consoleでデータが作成されているか確認
4. 管理者ユーザーで `/admin` にアクセスできるか確認

## トラブルシューティング

### 「Firebase not configured」エラー
- Vercelの環境変数が正しく設定されているか確認
- 環境変数名が `NEXT_PUBLIC_` で始まっているか確認
- 再デプロイを実行

### Authentication エラー
- Firebase Consoleで「メール/パスワード」認証が有効になっているか確認
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` が正しいか確認

### Firestore Permission Denied
- Firestoreセキュリティルールが正しく設定されているか確認
- ユーザーが正しく認証されているか確認
- 管理者機能を使う場合、ユーザーの `role` が `"admin"` になっているか確認
