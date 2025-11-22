# Database Branch Management Scripts

デプロイ時に自動作成されるNeonブランチに、`preview/New-Schema`からデータをコピーするためのスクリプト集です。

## 前提条件

- `jq` (JSON processor) - オプション1で必要
- PostgreSQL client tools (`pg_dump`, `psql`) - オプション2で必要
- Neon API Key
- Neon Project ID

## オプション1: Neon API経由でブランチをリセット

Neon APIを使用してブランチを`preview/New-Schema`の状態にリセットします。

### 使用方法

```bash
# 環境変数を設定
export NEON_API_KEY="napi_xxx..."
export NEON_PROJECT_ID="your-project-id"

# スクリプトを実行
./scripts/reset-branch-from-new-schema.sh "preview/branch-name"
```

### 取得方法

**NEON_API_KEY**:
- [Neon Console](https://console.neon.tech/) → Account settings → API keys

**NEON_PROJECT_ID**:
- [Neon Console](https://console.neon.tech/) → Projects
- プロジェクト名の下に表示されているID (例: `cool-fire-12345678`)

## オプション2: pg_dump/psqlでデータをコピー

PostgreSQLの標準ツールを使用してデータをコピーします。より確実な方法です。

### 使用方法

```bash
# ソースデータベースURLを環境変数に設定
export SOURCE_DB_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"

# スクリプトを実行（ターゲットDBのURLを引数で渡す）
./scripts/copy-data-from-new-schema.sh "postgresql://user:pass@ep-yyy.aws.neon.tech/neondb?sslmode=require"
```

### データベースURLの取得方法

1. [Neon Console](https://console.neon.tech/) → Projects → プロジェクトを選択
2. Branches タブ
3. コピー元: `preview/New-Schema` を選択 → Connection string をコピー → `SOURCE_DB_URL`に設定
4. コピー先: デプロイで作成されたブランチを選択 → Connection string をコピー → 引数で渡す

## 推奨フロー

### Vercelデプロイ時

1. **デプロイ実行**
   - Vercelが自動的にGitブランチに対応するNeonブランチを作成
   - この時点ではmainブランチから作成される（データが古い）

2. **データコピー実行**
   ```bash
   # Vercel環境変数から取得されたDATABASE_URLを使用
   export SOURCE_DB_URL="<preview/New-SchemaのURL>"
   ./scripts/copy-data-from-new-schema.sh "$DATABASE_URL"
   ```

3. **確認**
   ```bash
   psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";"
   ```

## トラブルシューティング

### `jq: command not found`

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# Alpine Linux
apk add jq
```

### `pg_dump: command not found`

```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Alpine Linux
apk add postgresql-client
```

### `Access denied` (Neon API)

- APIキーが正しいか確認
- APIキーの有効期限を確認
- プロジェクトIDが正しいか確認

### SSL/TLS エラー

接続文字列に `?sslmode=require` が含まれているか確認してください。
