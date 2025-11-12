# Minecraft Keybindings

Minecraft（Java版）の操作設定を投稿・閲覧できる共有サイトです。

## 機能

- **プレイヤー一覧**: 登録されているプレイヤーの操作設定を閲覧
- **詳細ページ**: キーバインディング、マウス設定、リマップ、外部ツール設定を表示
- **編集ページ**: 自分の操作設定を編集・登録
- **Discord認証**: Discord OAuth でログイン
- **スキン表示**: Minecraftプレイヤーのスキン（顔）をオーバーレイ付きで表示

## 技術スタック

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (ORM)
- **Neon** (PostgreSQL)
- **NextAuth.js v5** (Discord OAuth)

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

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

#### NEXTAUTH_SECRET の生成

```bash
openssl rand -base64 32
```

### 3. Discord OAuth の設定

#### 3-1. Discord Developer Portal でアプリケーション作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. **New Application** ボタンをクリック
3. アプリケーション名を入力（例: "Minecraft Keybindings"）
4. 利用規約に同意して **Create** をクリック

#### 3-2. OAuth2 設定

1. 左メニューから **OAuth2** → **General** を選択
2. **Client ID** をコピー → `.env.local` の `DISCORD_CLIENT_ID` に設定
3. **Client Secret** の **Reset Secret** をクリック
4. 表示される Secret をコピー → `.env.local` の `DISCORD_CLIENT_SECRET` に設定
   - ⚠️ **重要**: この値は一度しか表示されません

#### 3-3. Redirect URIs の設定

1. **Redirects** セクションで **Add Redirect** をクリック
2. 開発環境用 URI を追加: `http://localhost:3000/api/auth/callback/discord`
3. **Save Changes** をクリック

#### 3-4. 本番環境用の Redirect URI（デプロイ時）

Vercel などにデプロイする際:
1. **OAuth2** → **General** の **Redirects** セクション
2. 本番環境の URI を追加: `https://your-domain.vercel.app/api/auth/callback/discord`
3. **Save Changes** をクリック

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

## 認証方法について

### 手動でのMCID設定

Discord OAuth でログインした後、プロフィールページで手動で MCID（Minecraft ユーザー名）を設定する必要があります。

1. ログイン後、ヘッダーのユーザーメニューをクリック
2. プロフィールページに移動
3. MCID を手動で入力して保存

### トラブルシューティング

#### Discord OAuth の認証エラー

**"redirect_uri_mismatch"**
- Discord Developer Portal で設定した Redirect URI と実際のコールバック URL が一致していない
- 正確に `http://localhost:3000/api/auth/callback/discord` が設定されているか確認

**ログインできない / 環境変数が読み込まれない**
- `.env.local` ファイルが正しい場所（プロジェクトルート）に配置されているか確認
- Discord の Client ID と Client Secret が正しく設定されているか確認
- 開発サーバーを再起動（環境変数変更後は必須）

#### データベース接続エラーが発生する場合

- `DATABASE_URL`の接続文字列が正しいか確認
- Neonのダッシュボードでデータベースが起動しているか確認
- `pnpm prisma db push`を実行してスキーマが正しく適用されているか確認

## デプロイ (Vercel)

### 1. Vercelにプロジェクトをインポート

```bash
pnpm add -g vercel
vercel
```

### 2. 環境変数の設定

Vercel Dashboard で以下の環境変数を設定：

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-generated-secret-here
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret
```

⚠️ `NEXTAUTH_URL`は本番環境の実際のURLに変更してください。

### 3. Discord のリダイレクトURIを更新

1. [Discord Developer Portal](https://discord.com/developers/applications) でアプリケーションを選択
2. **OAuth2** → **General** を選択
3. **Redirects** セクションで **Add Redirect** をクリック
4. 本番環境のリダイレクトURIを追加：
   ```
   https://your-domain.vercel.app/api/auth/callback/discord
   ```
5. **Save Changes** をクリック

### 4. デプロイ

```bash
vercel --prod
```

### 5. デプロイ後の確認

1. `https://your-domain.vercel.app`にアクセス
2. Discordアカウントでログインを試行
3. プロフィールページでMCIDを手動で設定

## データ構造

### User (ユーザー)
- `mcid`: Minecraft ID（手動設定）
- `uuid`: Minecraft UUID（手動設定）
- Discord OAuth でログイン

### PlayerSettings (プレイヤー設定)
- **マウス設定**: DPI、ゲーム内感度、Windows速度、マウス加速、振り向き
- **キーバインド**: 移動、アクション、インベントリ、ホットバー
- **リマップ設定**: JSON形式でキーのリマップを保存
- **外部ツール**: JSON形式で外部ツール（AHK等）の設定を保存

## ライセンス

MIT
