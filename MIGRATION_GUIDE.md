# データベーススキーマ移行ガイド

## 概要

このガイドでは、Minecraft Keybindingsアプリケーションの旧スキーマから新しい正規化スキーマへの移行手順を説明します。

---

## 🎯 移行の目的

### 旧スキーマの課題
- ❌ 25個の個別String型キーバインドフィールド（拡張性が低い）
- ❌ JSON型の多用（型安全性の欠如）
- ❌ Minecraft独自形式への依存（`key.keyboard.*`）
- ❌ 新しいアクション追加時にスキーマ変更が必要

### 新スキーマの利点
- ✅ 正規化されたリレーショナル設計
- ✅ Web標準KeyboardEvent.code準拠
- ✅ 型安全なクエリと操作
- ✅ カスタムアクション対応が柔軟
- ✅ 統計・分析クエリが容易

---

## 📦 新システムの構成

### 1. キー管理システム

**[lib/keys.ts](lib/keys.ts)**
- Web標準KeyboardEvent.code準拠の150+キー定義
- カテゴリ分類（alphabet, digit, function, modifier等）
- JIS専用キーは日本語名で管理
- キー位置・サイズ情報

```typescript
// 例: キー定義
{
  KeyW: { code: 'KeyW', name: 'W', category: 'alphabet', ... },
  Mouse0: { code: 'Mouse0', name: 'マウス左', category: 'mouse', ... },
  ShiftLeft: { code: 'ShiftLeft', name: '左Shift', category: 'modifier', ... }
}
```

**[lib/keyConversion.ts](lib/keyConversion.ts)**
- `minecraftToWeb()` - Minecraft形式 → Web標準形式
- `formatKeyCode()` - Web標準形式 → 表示名
- `parseKeyName()` - 表示名 → Web標準形式
- 自動正規化・バリデーション機能

**[lib/defaultKeybindings.ts](lib/defaultKeybindings.ts)**
- 27個のデフォルトキーバインド定義
- 新規ユーザー作成時に使用

**[types/keybinding.ts](types/keybinding.ts)**
- `KeybindingData`, `KeyRemapData`, `ExternalToolData`等の型定義
- `ActionCategory`, `FingerType`等の型エイリアス

---

### 2. データベーススキーマ

**[prisma/schema.prisma](prisma/schema.prisma)** - 完全書き換え

#### 新規テーブル

**Keybinding** - キーバインド（正規化）
```prisma
model Keybinding {
  id       String   @id @default(cuid())
  uuid     String   // User UUID
  action   String   // "forward", "attack", "hotbar1"
  keyCode  String   // "KeyW", "Mouse0", "Digit1"
  category String   // "movement", "combat", "inventory", "ui", "custom"
  isCustom Boolean  @default(false)
  fingers  String[] @default([]) // 指割り当て

  @@unique([uuid, action]) // 1ユーザー1アクション1レコード
}
```

**KeyRemap** - キーリマップ
```prisma
model KeyRemap {
  id        String @id @default(cuid())
  uuid      String
  sourceKey String // "CapsLock"
  targetKey String // "ControlLeft"

  @@unique([uuid, sourceKey])
}
```

**ExternalTool** - 外部ツールアクション
```prisma
model ExternalTool {
  id          String  @id @default(cuid())
  uuid        String
  triggerKey  String  // "KeyF", "KeyX"
  toolName    String  // "Ninb", "SeedQueue"
  actionName  String  // "リセット", "Reset All"
  description String?
}
```

#### 更新されたテーブル

**User** - 新リレーション追加
```prisma
model User {
  uuid        String @id @default(uuid())
  mcid        String @unique
  // ...

  settings      PlayerSettings?
  keybindings   Keybinding[]      // 🆕
  keyRemaps     KeyRemap[]        // 🆕
  externalTools ExternalTool[]    // 🆕
  itemLayouts   ItemLayout[]
}
```

**PlayerSettings** - キーフィールド削除
```prisma
model PlayerSettings {
  uuid String @id

  // キーボード・マウス設定のみ
  keyboardLayout String @default("JIS")
  mouseDpi       Int?
  // ...

  // ❌ 削除: forward, back, attack等の25個のキーフィールド
  // ❌ 削除: remappings, externalTools等のJSONフィールド
}
```

---

### 3. API層

**[app/api/keybindings/route.ts](app/api/keybindings/route.ts)** - 完全書き換え

#### GET `/api/keybindings`
全設定を取得（settings, keybindings, remaps, tools）

```typescript
// レスポンス例
{
  uuid: "...",
  mcid: "player_name",
  settings: { keyboardLayout: "JIS", ... },
  keybindings: [
    { action: "forward", keyCode: "KeyW", category: "movement", ... },
    // ...
  ],
  keyRemaps: [
    { sourceKey: "CapsLock", targetKey: "ControlLeft" }
  ],
  externalTools: [
    { triggerKey: "KeyF", toolName: "Ninb", actionName: "リセット" }
  ]
}
```

#### POST `/api/keybindings`
全設定を更新（トランザクション処理）

```typescript
// リクエスト例
{
  settings: { keyboardLayout: "JIS", mouseDpi: 800, ... },
  keybindings: [
    { action: "forward", keyCode: "KeyW", category: "movement", ... },
    // ...
  ],
  keyRemaps: [...],
  externalTools: [...]
}
```

---

### 4. 移行スクリプト

**[scripts/migrate-to-new-schema.ts](scripts/migrate-to-new-schema.ts)**

旧DB → 新DBへのデータ移行スクリプト

**機能**:
- 25個のキーフィールド → Keybindingレコードに変換
- JSON形式 → 正規化テーブルに変換
- Minecraft形式 → Web標準形式に自動変換
- 指割り当て、カスタムキー、外部ツール全対応
- ドライラン・本番モード

**使い方**:
```bash
# stg環境テスト
tsx scripts/migrate-to-new-schema.ts \
  --source=$OLD_DATABASE_URL \
  --target=$STG_DATABASE_URL

# ドライラン（書き込みなし）
tsx scripts/migrate-to-new-schema.ts \
  --source=$OLD_DATABASE_URL \
  --target=$STG_DATABASE_URL \
  --dry-run

# 本番移行
tsx scripts/migrate-to-new-schema.ts --production
```

**[scripts/verify-migration.ts](scripts/verify-migration.ts)**

移行後のデータ検証スクリプト

**検証項目**:
- ✅ PlayerSettings存在確認
- ✅ 必須アクション（27個）存在確認
- ✅ キーコード形式チェック（Minecraft形式残留検出）
- ✅ 統計情報表示

**使い方**:
```bash
tsx scripts/verify-migration.ts
```

---

## 🚀 移行手順

### Phase 1: stg環境での検証

#### 1. Prisma Client生成

```bash
# すべてのターミナル・プロセスを停止
pnpm prisma generate
```

#### 2. stg環境DBセットアップ

```bash
# stg用DBを作成（Neon等）
# DATABASE_URL_STG環境変数に設定

# スキーマ適用
DATABASE_URL=$DATABASE_URL_STG pnpm prisma db push
```

#### 3. 移行スクリプト実行

```bash
# ドライランで確認
tsx scripts/migrate-to-new-schema.ts \
  --source=$DATABASE_URL \
  --target=$DATABASE_URL_STG \
  --dry-run

# 実際の移行
tsx scripts/migrate-to-new-schema.ts \
  --source=$DATABASE_URL \
  --target=$DATABASE_URL_STG
```

#### 4. 検証

```bash
DATABASE_URL=$DATABASE_URL_STG tsx scripts/verify-migration.ts
```

#### 5. stg環境での動作確認

- [ ] ログイン動作
- [ ] キーバインド表示
- [ ] キーバインド編集・保存
- [ ] リマップ表示・編集
- [ ] 外部ツール表示・編集
- [ ] アイテム配置表示・編集
- [ ] 統計ページ動作

---

### Phase 2: 本番環境移行

#### 事前準備

1. **メンテナンス告知**（移行時間を通知）
2. **本番DBバックアップ**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

#### 移行当日

**1. メンテナンスモード開始**

**2. 本番DBバックアップ**
```bash
pg_dump $DATABASE_URL > backup_production_$(date +%Y%m%d_%H%M%S).sql
```

**3. 新スキーマ適用**
```bash
pnpm prisma db push
```

**4. データ移行実行**
```bash
tsx scripts/migrate-to-new-schema.ts --production
```

**5. 検証**
```bash
tsx scripts/verify-migration.ts --production
```

**6. アプリケーションデプロイ**
```bash
vercel --prod
```

**7. 動作確認**
- 主要機能のスモークテスト
- エラーログ確認

**8. メンテナンス終了**

---

### ロールバックプラン

問題が発生した場合:

```bash
# 1. データベースを復元
psql $DATABASE_URL < backup_production_YYYYMMDD_HHMMSS.sql

# 2. アプリケーションを前のバージョンにロールバック
vercel rollback
```

---

## 📝 変更ファイル一覧

### 新規作成
- ✅ `lib/keys.ts` - キー定義システム
- ✅ `lib/keyConversion.ts` - 変換ユーティリティ
- ✅ `lib/defaultKeybindings.ts` - デフォルト値
- ✅ `types/keybinding.ts` - 型定義
- ✅ `scripts/migrate-to-new-schema.ts` - 移行スクリプト
- ✅ `scripts/verify-migration.ts` - 検証スクリプト
- ✅ `prisma/schema-old.prisma` - 旧スキーマバックアップ
- ✅ `app/api/keybindings/route-old.ts` - 旧APIバックアップ

### 更新
- ✅ `prisma/schema.prisma` - 完全書き換え
- ✅ `app/api/keybindings/route.ts` - 完全書き換え
- ✅ `lib/utils.ts` - formatKeyName()を新システム対応

### 今後の更新が必要（オプション）
- ⏳ `components/VirtualKeyboard.tsx` - レイアウト定義
- ⏳ `components/KeybindingModal.tsx` - アクション選択
- ⏳ `components/KeybindingEditor.tsx` - 編集UI
- ⏳ `components/KeybindingDisplay.tsx` - 表示ロジック
- ⏳ その他表示コンポーネント

**注記**: `lib/utils.ts`の`formatKeyName()`が新旧両方の形式に対応しているため、既存コンポーネントは移行後もそのまま動作します。コンポーネントの更新は、新機能追加時に段階的に行えます。

---

## 🔍 トラブルシューティング

### Prisma Client生成エラー

**症状**: `EPERM: operation not permitted, rename ... query_engine-windows.dll.node`

**対処法**:
1. すべてのターミナル・VSCode・開発サーバーを完全終了
2. 新しいターミナルで実行:
   ```bash
   pnpm prisma generate
   ```

### 移行スクリプトでエラー

**症状**: 特定のユーザーで移行失敗

**対処法**:
1. エラーログを確認
2. 該当ユーザーのデータを手動確認
3. 必要に応じて手動修正後、再実行

### キーコード変換エラー

**症状**: 一部のキーが正しく変換されない

**対処法**:
1. `lib/keyConversion.ts`の`minecraftToWeb()`にマッピング追加
2. または`lib/keys.ts`の`KEYS`定義にキーを追加

---

## 📞 サポート

質問・問題が発生した場合:
1. このガイドのトラブルシューティングセクションを確認
2. `scripts/verify-migration.ts`で問題を特定
3. ログファイルを確認（`console.log`出力）

---

## ✅ チェックリスト

### 移行前
- [ ] 本ガイドを熟読
- [ ] stg環境を準備
- [ ] 本番DBバックアップ準備
- [ ] メンテナンス時間を決定・告知

### stg環境テスト
- [ ] Prisma Client生成成功
- [ ] スキーマ適用成功
- [ ] 移行スクリプト実行成功
- [ ] 検証スクリプト全パス
- [ ] 動作確認完了

### 本番移行
- [ ] メンテナンス告知済み
- [ ] 本番DBバックアップ取得
- [ ] 新スキーマ適用
- [ ] データ移行実行
- [ ] 検証完了
- [ ] アプリデプロイ
- [ ] スモークテスト完了
- [ ] メンテナンス終了告知

---

**最終更新**: 2025-01-19
**作成者**: Claude (Anthropic)
