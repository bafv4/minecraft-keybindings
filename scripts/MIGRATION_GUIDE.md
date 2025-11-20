# データ移行ガイド

このガイドでは、旧スキーマ（PlayerSettings）から新スキーマ（PlayerConfig + Keybinding + CustomKey + KeyRemap + ExternalTool）へのデータ移行手順を説明します。

## 📋 目次

1. [準備](#準備)
2. [同一DB内での移行](#同一db内での移行)
3. [別環境間での移行](#別環境間での移行)
4. [トラブルシューティング](#トラブルシューティング)

---

## 準備

### 必要な環境

- Node.js 18以上
- pnpm
- PostgreSQLデータベース

### データベースのバックアップ

**⚠️ 重要: 移行を実行する前に、必ずデータベースのバックアップを取得してください**

```bash
# Neonの場合はダッシュボードからバックアップを取得
# または、pg_dumpでバックアップ
pg_dump -h <host> -U <user> -d <database> > backup.sql
```

---

## 同一DB内での移行

同一のデータベース内で旧スキーマから新スキーマへデータを移行します。

### Windows

1. **環境変数を設定**（`.env.local` に記載済みの場合はスキップ）

   ```batch
   set DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```

2. **バッチファイルを実行**

   ```batch
   cd scripts
   migrate-same-db.bat
   ```

3. **確認プロンプトに従う**
   - `Y` → ドライランモード（データベースに書き込まない）
   - `N` → 本番モード（実際にデータベースに書き込む）
   - 本番モードの場合は `YES` と入力して最終確認

### Mac / Linux

1. **実行権限を付与**（初回のみ）

   ```bash
   chmod +x scripts/migrate-same-db.sh
   ```

2. **スクリプトを実行**

   ```bash
   # .env.local に DATABASE_URL が設定されている場合
   ./scripts/migrate-same-db.sh

   # または、直接環境変数を指定
   DATABASE_URL=postgresql://user:password@host:5432/database ./scripts/migrate-same-db.sh
   ```

3. **確認プロンプトに従う**
   - `Y` → ドライランモード
   - `N` → 本番モード（`YES` と入力して最終確認）

---

## 別環境間での移行

退避環境（ステージング）から本番環境へデータを移行します。

### Windows

1. **バッチファイルを編集**

   `scripts/migrate-cross-env.bat` を開き、以下の部分を編集:

   ```batch
   REM 退避環境のDB接続文字列
   set SOURCE_DATABASE_URL=postgresql://user:pass@stg-host.neon.tech/neondb?sslmode=require

   REM 本番環境のDB接続文字列
   set TARGET_DATABASE_URL=postgresql://user:pass@prod-host.neon.tech/neondb?sslmode=require
   ```

   または、環境変数を直接設定:

   ```batch
   set SOURCE_DATABASE_URL=postgresql://...
   set TARGET_DATABASE_URL=postgresql://...
   ```

2. **バッチファイルを実行**

   ```batch
   cd scripts
   migrate-cross-env.bat
   ```

3. **確認プロンプトに従う**
   - `Y` → ドライランモード
   - `N` → 本番モード（`YES` と入力して最終確認）

### Mac / Linux

1. **実行権限を付与**（初回のみ）

   ```bash
   chmod +x scripts/migrate-cross-env.sh
   ```

2. **スクリプトを編集**または**環境変数を設定**

   方法A: スクリプトを編集

   `scripts/migrate-cross-env.sh` を開き、以下の部分を編集:

   ```bash
   SOURCE_DATABASE_URL="postgresql://user:pass@stg-host.neon.tech/neondb?sslmode=require"
   TARGET_DATABASE_URL="postgresql://user:pass@prod-host.neon.tech/neondb?sslmode=require"
   ```

   方法B: 環境変数を直接指定

   ```bash
   SOURCE_DATABASE_URL=postgresql://... \
   TARGET_DATABASE_URL=postgresql://... \
   ./scripts/migrate-cross-env.sh
   ```

3. **確認プロンプトに従う**
   - `Y` → ドライランモード
   - `N` → 本番モード（`YES` と入力して最終確認）

---

## 移行される内容

### 旧スキーマ（PlayerSettings）→ 新スキーマ

| 旧テーブル | フィールド | 新テーブル | 備考 |
|-----------|----------|-----------|------|
| PlayerSettings | mouseDpi, gameSensitivity, etc. | PlayerConfig | マウス・環境設定 |
| PlayerSettings | forward, back, left, etc. | Keybinding | キーバインド設定（27個） |
| PlayerSettings | additionalSettings (JSON) | Keybinding | カスタムアクション |
| PlayerSettings | remappings (JSON) | KeyRemap | キーリマップ設定 |
| PlayerSettings | externalTools (JSON) | ExternalTool | 外部ツール設定 |
| PlayerSettings | key.custom.* | CustomKey | カスタムキー定義 |

### 新たに作成されるレコード

- **User**: 別環境間移行の場合、ターゲットDBに自動作成
- **PlayerConfig**: 1ユーザーにつき1件
- **Keybinding**: 標準27個 + カスタムアクション
- **CustomKey**: カスタムキー定義（key.custom.*）
- **KeyRemap**: リマップ設定
- **ExternalTool**: 外部ツールアクション

---

## トラブルシューティング

### Q1. `DATABASE_URL が設定されていません` エラー

**A.** 以下を確認:
- `.env.local` ファイルに `DATABASE_URL` が記載されているか
- 環境変数が正しく設定されているか（`echo %DATABASE_URL%` / `echo $DATABASE_URL`）

### Q2. `prisma.playerSettings is undefined` エラー

**A.** Prisma Clientを再生成:

```bash
pnpm prisma generate
```

### Q3. データベース接続エラー

**A.** 以下を確認:
- 接続文字列が正しいか
- データベースが稼働しているか
- ファイアウォール設定でアクセスが許可されているか
- SSL設定（`?sslmode=require`）が正しいか

### Q4. 移行が途中で失敗した

**A.** 以下の対処:
1. バックアップから復元
2. エラーメッセージを確認
3. 問題を修正後、再度実行（既存データは上書きされます）

### Q5. 移行後のデータを確認したい

**A.** Prisma Studioで確認:

```bash
pnpm prisma studio
```

または、検証スクリプト（作成予定）を実行:

```bash
DATABASE_URL=xxx pnpm tsx scripts/verify-migration.ts
```

---

## 安全な移行手順（推奨）

1. **ドライランで確認**
   ```bash
   ./scripts/migrate-same-db.sh  # Y を選択
   ```

2. **出力を確認**
   - 移行対象のユーザー数
   - 各ユーザーのレコード数
   - エラーがないか

3. **バックアップを取得**
   ```bash
   pg_dump ... > backup_before_migration.sql
   ```

4. **本番実行**
   ```bash
   ./scripts/migrate-same-db.sh  # N → YES を入力
   ```

5. **検証**
   ```bash
   pnpm prisma studio
   # データが正しく移行されているか確認
   ```

6. **問題がなければ旧テーブル削除**（オプション）
   ```sql
   DROP TABLE "PlayerSettings";
   ```

---

## 直接スクリプトを実行する場合（推奨）

バッチファイルは特殊文字の扱いが複雑なため、PowerShellまたはシェルから直接TypeScriptスクリプトを実行することを推奨します。

### PowerShellで実行（Windows推奨）

#### 簡易実行スクリプト

```powershell
# ドライラン
powershell -File scripts/run-migration.ps1 -DryRun

# 本番実行
powershell -File scripts/run-migration.ps1
```

#### ワンライナー実行

```powershell
# ドライラン
$env:SOURCE_DATABASE_URL="postgresql://user:pass@stg-host/db?sslmode=require"; $env:TARGET_DATABASE_URL="postgresql://user:pass@prod-host/db?sslmode=require"; pnpm tsx scripts/migrate-to-new-schema.ts --dry-run

# 本番実行
$env:SOURCE_DATABASE_URL="postgresql://user:pass@stg-host/db?sslmode=require"; $env:TARGET_DATABASE_URL="postgresql://user:pass@prod-host/db?sslmode=require"; pnpm tsx scripts/migrate-to-new-schema.ts
```

### Mac/Linuxで実行

```bash
# ドライラン
SOURCE_DATABASE_URL=postgresql://stg... \
TARGET_DATABASE_URL=postgresql://prod... \
pnpm tsx scripts/migrate-to-new-schema.ts --dry-run

# 本番実行
SOURCE_DATABASE_URL=postgresql://stg... \
TARGET_DATABASE_URL=postgresql://prod... \
pnpm tsx scripts/migrate-to-new-schema.ts
```

### 同一DB内での移行

```bash
# ドライラン
DATABASE_URL=postgresql://... pnpm tsx scripts/migrate-to-new-schema.ts --dry-run

# 本番実行
DATABASE_URL=postgresql://... pnpm tsx scripts/migrate-to-new-schema.ts
```

---

## サポート

問題が発生した場合は、以下の情報を添えて報告してください:
- エラーメッセージ全文
- 実行したコマンド
- 環境情報（OS、Node.jsバージョン、データベース種類）
