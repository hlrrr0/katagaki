# 日本肩書き協会 - Webサービス

公認された「肩書き」の年間権利を提供するプラットフォーム

## 🎯 プロジェクト概要

日本肩書き協会は、ユーザーが公認された肩書きの年間権利を購入し、個人のアイデンティティとブランディングを確立できるWebサービスです。

### 主な機能

- 🏆 **公認肩書きシステム**: 協会が公認した肩書きに公認番号と証明書を発行
- 🔍 **肩書き検索・一覧**: カテゴリ、ステータス、名前で肩書きを検索
- 💳 **安全な決済**: Stripeによる年間権利の購入
- 📝 **肩書き提案**: ユーザーから新しい肩書きを提案可能
- 👥 **権利保有者管理**: 購入した肩書きの管理と更新
- 🔐 **認証システム**: Firebase Authenticationによる安全な認証
- 👨‍💼 **管理者機能**: 肩書き管理、提案審査、ユーザー管理（実装予定）

## 🛠 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **認証**: Firebase Authentication
- **データベース**: Cloud Firestore
- **決済**: Stripe
- **日付処理**: date-fns

## 📦 必要な環境

- Node.js 18.17以上
- npm または yarn
- Firebaseプロジェクト
- Stripeアカウント

## 🚀 セットアップ手順

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Firebaseプロジェクトのセットアップ

1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
2. Authenticationを有効化（メール/パスワード認証を有効にする）
3. Cloud Firestoreを有効化
4. Webアプリを追加して、設定情報を取得

### 3. Stripeアカウントのセットアップ

1. [Stripe Dashboard](https://dashboard.stripe.com/)でアカウントを作成
2. テストモードで使用する場合は、テストキーを取得

### 4. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、実際の値を設定:

```bash
cp .env.local.example .env.local
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 📂 プロジェクト構造

```
katagaki/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # トップページ
│   ├── titles/              # 肩書き関連ページ
│   ├── login/               # ログインページ
│   ├── signup/              # サインアップページ
│   ├── my-titles/           # 保有肩書きページ
│   └── proposals/           # 提案ページ
├── components/              # 共通コンポーネント
├── lib/                     # ライブラリとユーティリティ
│   ├── firebase/            # Firebase設定とヘルパー
│   ├── stripe/              # Stripe設定
│   ├── contexts/            # React Context
│   └── types/               # 型定義
└── public/                  # 静的ファイル
```

## 🗄️ データモデル

### Titles（肩書き）
肩書きの基本情報、価格、購入可能枠数など

### Users（ユーザー）
ユーザー情報、ロール（admin/user）

### Rights（権利）
ユーザーと肩書きを紐づける年間権利

### Proposals（提案）
ユーザーからの新しい肩書き提案

### Categories（カテゴリ）
肩書きのカテゴリ分類

## 🔐 管理者アカウントの作成

初回セットアップ時に、Firestore Consoleから直接管理者ユーザーを作成:

1. Firebase Authenticationでユーザーを作成
2. Firestoreの`users`コレクションで該当ユーザーのドキュメントを開く
3. `role`フィールドを`"admin"`に変更

## 📝 今後の実装予定

- [ ] Stripe決済フローの完全実装
- [ ] Webhook処理の実装
- [ ] 管理者ダッシュボード
- [ ] 証明書ダウンロード機能
- [ ] メール通知機能

## 🚢 デプロイ

Vercelへのデプロイを推奨:

```bash
npm i -g vercel
vercel
```

環境変数をVercelダッシュボードで設定してください。

---

This project is built with [Next.js](https://nextjs.org).
# katagaki
