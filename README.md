# MCSRer Hotkeys

主にRTA走者向けのMinecraft（Java版）の操作設定を投稿・閲覧できる共有サイトです。

各キーの配置やマウス感度など、設定できる項目は大体網羅しているはず。

## 機能

- **プレイヤー設定の共有**: キーバインド、マウス設定、デバイス情報を公開
- **Discord OAuth認証**: Discordアカウントでログイン
- **MCID/パスワード認証**: Minecraftアカウント情報で登録・ログイン
- **カスタムキー対応**: F13キーやマウスサイドボタンなどの特殊キー設定
- **キーリマップ**: ハードウェアレベルのキー変更（例: Caps Lock → Ctrl）
- **外部ツール連携**: AutoHotKeyなどのマクロ設定の記録
- **アイテム配置管理**: ホットバーのアイテム配置を複数パターン保存

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **データベース**: PostgreSQL (Neon)
- **ORM**: Prisma
- **認証**: NextAuth.js
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

## 開発

詳細な開発情報は [CLAUDE.md](CLAUDE.md) を参照してください。

```bash
# 依存関係のインストール
pnpm install

# データベースのセットアップ
pnpm prisma generate
pnpm prisma db push

# 開発サーバーの起動
pnpm dev
```

## API仕様書

このアプリケーションは17個のRESTful APIエンドポイントを提供しています。外部アプリケーションからの利用や統合開発に活用できます。

### ドキュメント

- **📋 クイックリファレンス**: [docs/API_QUICK_REFERENCE.md](docs/API_QUICK_REFERENCE.md) - 全エンドポイント一覧
- **📖 完全版仕様書**: [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) - 詳細な仕様とサンプル
- **🔧 OpenAPI仕様**: [docs/openapi.yaml](docs/openapi.yaml) - Swagger/Postman用

### 主要エンドポイント

```bash
# プレイヤー情報取得（公開）
GET /api/player/{mcid}
GET /api/players

# 認証・登録
POST /api/auth/register
POST /api/auth/login-or-register
GET /api/auth/check-mcid

# 設定管理（要認証）
GET /api/keybindings
POST /api/keybindings
DELETE /api/keybindings

# アイテム配置
GET /api/item-layouts?uuid={uuid}
POST /api/item-layouts
DELETE /api/item-layouts?uuid={uuid}&segment={segment}

# アバター
GET /api/avatar?uuid={uuid}&size={size}
```