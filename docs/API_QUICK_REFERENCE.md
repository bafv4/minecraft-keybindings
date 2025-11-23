# API クイックリファレンス

すべてのAPIエンドポイントの一覧です。詳細は [API_SPECIFICATION.md](API_SPECIFICATION.md) を参照してください。

## エンドポイント一覧

| # | メソッド | エンドポイント | 認証 | 説明 |
|---|---------|---------------|------|------|
| 1 | GET | `/api/player/[mcid]` | - | 個別プレイヤー情報取得 |
| 2 | GET | `/api/players` | - | 全プレイヤーリスト取得 |
| 3 | POST | `/api/auth/register` | - | ユーザー登録 |
| 4 | POST | `/api/auth/login-or-register` | - | ログインまたは登録 |
| 5 | GET | `/api/auth/check-mcid` | - | MCID存在チェック |
| 6 | GET | `/api/keybindings` | 🔒 | プレイヤー設定取得 |
| 7 | POST | `/api/keybindings` | 🔒 | プレイヤー設定更新 |
| 8 | DELETE | `/api/keybindings` | 🔒 | プレイヤー設定削除 |
| 9 | GET | `/api/item-layouts` | - | アイテム配置取得 |
| 10 | POST | `/api/item-layouts` | - | アイテム配置作成・更新 |
| 11 | DELETE | `/api/item-layouts` | - | アイテム配置削除 |
| 12 | GET | `/api/guests` | 🔐 | ゲストユーザー一覧 |
| 13 | POST | `/api/guests` | 🔐 | ゲストユーザー作成 |
| 14 | DELETE | `/api/guests` | 🔐 | ゲストユーザー削除 |
| 15 | GET | `/api/sync-mcid` | - | 個別MCID同期 |
| 16 | POST | `/api/sync-mcid` | 🔑 | 全ユーザーMCID同期 |
| 17 | GET | `/api/avatar` | - | アバター画像取得 |

**凡例:**
- 🔒 = 認証必須（NextAuth.jsセッション）
- 🔐 = 管理者権限必須
- 🔑 = CRON_SECRET必須

---

## プレイヤー情報取得

### 個別プレイヤー情報
```bash
GET /api/player/{mcid}
```

### 全プレイヤーリスト
```bash
GET /api/players
```

---

## 認証・登録

### ユーザー登録
```bash
POST /api/auth/register
Content-Type: application/json

{
  "mcid": "string",
  "passphrase": "string (optional)",
  "displayName": "string (optional)"
}
```

### ログインまたは登録
```bash
POST /api/auth/login-or-register
Content-Type: application/json

{
  "mcid": "string",
  "passphrase": "string (optional)",
  "displayName": "string (新規登録時必須)"
}
```

### MCID存在チェック
```bash
GET /api/auth/check-mcid?mcid={mcid}
```

---

## 設定管理 🔒

### 設定取得
```bash
GET /api/keybindings
Authorization: (NextAuth.js Session)
```

### 設定更新
```bash
POST /api/keybindings
Authorization: (NextAuth.js Session)
Content-Type: application/json

{
  "targetUuid": "string (optional, 管理者のみ)",
  "settings": { ... },
  "keybindings": [ ... ],
  "customKeys": [ ... ],
  "keyRemaps": [ ... ],
  "externalTools": [ ... ]
}
```

### 設定削除
```bash
DELETE /api/keybindings
Authorization: (NextAuth.js Session)
```

---

## アイテム配置

### アイテム配置取得
```bash
GET /api/item-layouts?uuid={uuid}
```

### アイテム配置作成・更新
```bash
POST /api/item-layouts
Content-Type: application/json

{
  "uuid": "string",
  "segment": number,
  "slot1": ["item"],
  "slot2": ["item"],
  ...
  "offhand": ["item"],
  "notes": "string"
}
```

### アイテム配置削除
```bash
DELETE /api/item-layouts?uuid={uuid}&segment={segment}
```

---

## ゲスト管理 🔐

### ゲストユーザー一覧
```bash
GET /api/guests
Authorization: (NextAuth.js Session + Admin)
```

### ゲストユーザー作成
```bash
POST /api/guests
Authorization: (NextAuth.js Session + Admin)
Content-Type: application/json

{
  "mcid": "string",
  "displayName": "string"
}
```

### ゲストユーザー削除
```bash
DELETE /api/guests?uuid={uuid}
Authorization: (NextAuth.js Session + Admin)
```

---

## MCID同期

### 個別MCID同期
```bash
GET /api/sync-mcid?uuid={uuid}
```

### 全ユーザーMCID同期 🔑
```bash
POST /api/sync-mcid
Authorization: Bearer {CRON_SECRET}
```

---

## アバター

### アバター画像取得
```bash
GET /api/avatar?uuid={uuid}&size={size}
```

パラメータ:
- `uuid` (必須): プレイヤーのUUID
- `size` (オプション): 画像サイズ（デフォルト: 64）

レスポンス: PNG画像

---

## レスポンス形式

### 成功時
```json
{
  // エンドポイント固有のデータ
}
```

### エラー時
```json
{
  "error": "エラーメッセージ"
}
```

---

## HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエストエラー |
| 401 | 認証が必要 |
| 403 | 権限不足 |
| 404 | リソースが見つからない |
| 500 | サーバー内部エラー |

---

## 詳細ドキュメント

- **完全版仕様書**: [API_SPECIFICATION.md](API_SPECIFICATION.md)
- **OpenAPI仕様**: [openapi.yaml](openapi.yaml)
