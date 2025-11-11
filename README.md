# Minecraft Keybindings

Minecraft（Java版）の操作設定を投稿・閲覧できる共有サイトです。

## 機能

- **プレイヤー一覧**: 登録されているプレイヤーの操作設定を閲覧
- **詳細ページ**: キーバインディング、マウス設定、リマップ、外部ツール設定を表示
- **編集ページ**: 自分の操作設定を編集・登録
- **Microsoft OAuth**: MicrosoftアカウントでログインしてMinecraft情報を取得
- **スキン表示**: Minecraftプレイヤーのスキン（顔）をオーバーレイ付きで表示

## 技術スタック

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (ORM)
- **Neon** (PostgreSQL)
- **NextAuth.js v5** (Microsoft OAuth)

## セットアップ

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. データベースのセットアップ

#### Neon (PostgreSQL) を使用する場合

1. [Neon](https://neon.tech/) でアカウントを作成
2. 新しいプロジェクトを作成
3. 接続文字列をコピー

#### `.env.local` の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="common"
```

#### NEXTAUTH_SECRET の生成

```bash
openssl rand -base64 32
```

### 3. Microsoft Azure AD アプリの設定

1. [Azure Portal](https://portal.azure.com/) にアクセス
2. **Azure Active Directory** → **App registrations** → **New registration**
3. アプリケーション名を入力（例: "Minecraft Keybindings"）
4. **Redirect URI**: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
5. **API permissions** で以下を追加：
   - `openid`
   - `profile`
   - `email`
   - `XboxLive.signin`
6. **Client ID** と **Client Secret** を `.env.local` に設定

### 4. Prismaマイグレーション

```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 でアプリケーションが起動します。

## デプロイ (Vercel)

### 1. Vercelにプロジェクトをインポート

```bash
pnpm add -g vercel
vercel
```

### 2. 環境変数の設定

Vercel Dashboard で以下の環境変数を設定：

- `DATABASE_URL`
- `NEXTAUTH_URL` (本番環境のURL)
- `NEXTAUTH_SECRET`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`

### 3. Azure AD のリダイレクトURIを更新

本番環境のリダイレクトURI を Azure AD アプリに追加：
```
https://your-domain.vercel.app/api/auth/callback/microsoft-entra-id
```

### 4. デプロイ

```bash
vercel --prod
```

## データ構造

### User (ユーザー)
- `mcid`: Minecraft ID
- `uuid`: Minecraft UUID
- `microsoftId`: Microsoft Account ID

### PlayerSettings (プレイヤー設定)
- **マウス設定**: DPI、ゲーム内感度、Windows速度、マウス加速、振り向き
- **キーバインド**: 移動、アクション、インベントリ、ホットバー
- **リマップ設定**: JSON形式でキーのリマップを保存
- **外部ツール**: JSON形式で外部ツール（AHK等）の設定を保存

## ライセンス

MIT
