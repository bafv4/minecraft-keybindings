# API仕様書

## 概要

このドキュメントは、Minecraft Keybindingsアプリケーションで提供されるAPIの完全な仕様を定義します。

## ベースURL

- 開発環境: `http://localhost:3000`
- 本番環境: `https://your-domain.vercel.app`

## 認証

一部のエンドポイントは認証が必要です。認証が必要なエンドポイントには 🔒 マークが付いています。
認証にはNextAuth.jsのセッション管理を使用しています。

---

## 目次

- [プレイヤー情報取得](#プレイヤー情報取得)
- [認証・登録](#認証登録)
- [設定管理](#設定管理)
- [アイテム配置](#アイテム配置)
- [ゲスト管理](#ゲスト管理)
- [MCID同期](#mcid同期)
- [アバター](#アバター)

---

## プレイヤー情報取得

### 1. 個別プレイヤー情報取得

**エンドポイント**: `GET /api/player/[mcid]`

**説明**: 指定したMCID（Minecraftユーザー名）のプレイヤー情報と設定を取得します。

#### リクエスト

**パスパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `mcid` | string | ✓ | Minecraftユーザー名（例: "Notch"） |

**例**
```
GET /api/player/Notch
```

#### レスポンス

**成功時 (200 OK)**

```json
{
  "user": {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "mcid": "Notch",
    "displayName": "Notch",
    "isGuest": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "settings": {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "keyboardLayout": "JIS",
    "mouseDpi": 800,
    "gameSensitivity": 0.5,
    "windowsSpeed": 10,
    "mouseAcceleration": false,
    "rawInput": true,
    "cm360": 42.5,
    "toggleSprint": false,
    "toggleSneak": false,
    "autoJump": false,
    "fingerAssignments": null,
    "gameLanguage": "ja_jp",
    "mouseModel": "Logitech G Pro X Superlight",
    "keyboardModel": "Ducky One 2 Mini",
    "notes": "マウス設定のメモ",
    "forward": "key.keyboard.w",
    "back": "key.keyboard.s",
    "attack": "key.mouse.left"
  },
  "customKeys": [],
  "remappings": {},
  "externalTools": {},
  "rawKeybindings": [],
  "rawCustomKeys": [],
  "rawKeyRemaps": [],
  "rawExternalTools": [],
  "itemLayouts": []
}
```

**エラーレスポンス**

- **404 Not Found**: プレイヤーが見つからない
- **400 Bad Request**: MCIDが指定されていない
- **500 Internal Server Error**: サーバー内部エラー

---

### 2. 全プレイヤーリスト取得

**エンドポイント**: `GET /api/players`

**説明**: 設定を持つ全プレイヤーのリストを取得します。

#### リクエスト

**クエリパラメータ**: なし

#### レスポンス

**成功時 (200 OK)**

```json
[
  {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "mcid": "Notch",
    "displayName": "Notch",
    "isGuest": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "settings": { },
    "customKeys": []
  }
]
```

---

## 認証・登録

### 3. ユーザー登録

**エンドポイント**: `POST /api/auth/register`

**説明**: 新しいユーザーを登録します。Mojang APIでMCIDを検証し、UUIDを取得します。

#### リクエスト

**ボディ (JSON)**

```json
{
  "mcid": "Notch",
  "passphrase": "optional-password",
  "displayName": "表示名"
}
```

| フィールド | 型 | 必須 | 説明 |
|----------|------|------|------|
| `mcid` | string | ✓ | Minecraft ID（ユーザー名） |
| `passphrase` | string |  | パスフレーズ（オプション） |
| `displayName` | string |  | 表示名（未指定時はMCIDを使用） |

#### レスポンス

**成功時 (201 Created)**

```json
{
  "success": true,
  "user": {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "mcid": "Notch",
    "displayName": "Notch"
  }
}
```

**エラーレスポンス**

- **400 Bad Request**: MCIDが存在しない、または既に登録済み
- **500 Internal Server Error**: 登録エラー

---

### 4. ログインまたは登録

**エンドポイント**: `POST /api/auth/login-or-register`

**説明**: MCIDが登録済みならログイン、未登録なら新規登録を行います。

#### リクエスト

**ボディ (JSON)**

```json
{
  "mcid": "Notch",
  "passphrase": "optional-password",
  "displayName": "表示名（新規登録時必須）"
}
```

#### レスポンス

**ログイン成功時 (200 OK)**

```json
{
  "action": "login",
  "user": {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "mcid": "Notch",
    "displayName": "Notch"
  }
}
```

**新規登録成功時 (201 Created)**

```json
{
  "action": "register",
  "user": {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "mcid": "Notch",
    "displayName": "Notch"
  }
}
```

**エラーレスポンス**

- **400 Bad Request**: MCIDが存在しない、または初回登録時に表示名が未指定
- **401 Unauthorized**: パスフレーズが不正
- **500 Internal Server Error**: 処理エラー

---

### 5. MCID存在チェック

**エンドポイント**: `GET /api/auth/check-mcid?mcid={mcid}`

**説明**: MCIDが既に登録されているかチェックします。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `mcid` | string | ✓ | Minecraft ID |

#### レスポンス

**成功時 (200 OK)**

```json
{
  "exists": true
}
```

---

## 設定管理

### 6. 🔒 プレイヤー設定取得

**エンドポイント**: `GET /api/keybindings`

**説明**: 認証済みユーザーの設定を取得します。

**認証**: 必須

#### レスポンス

**成功時 (200 OK)**

```json
{
  "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
  "mcid": "Notch",
  "displayName": "Notch",
  "settings": {
    "keyboardLayout": "JIS",
    "mouseDpi": 800,
    "gameSensitivity": 0.5,
    "mouseAcceleration": false,
    "rawInput": true
  },
  "keybindings": [
    {
      "action": "forward",
      "keyCode": "key.keyboard.w",
      "category": "movement",
      "fingers": ["left-middle"]
    }
  ],
  "customKeys": [],
  "keyRemaps": [],
  "externalTools": []
}
```

**エラーレスポンス**

- **401 Unauthorized**: 認証が必要
- **404 Not Found**: ユーザーが見つからない

---

### 7. 🔒 プレイヤー設定更新

**エンドポイント**: `POST /api/keybindings`

**説明**: プレイヤーの設定を更新します。管理者の場合、`targetUuid`を指定してゲストユーザーの設定を更新できます。

**認証**: 必須

#### リクエスト

**ボディ (JSON)**

```json
{
  "targetUuid": "optional-guest-uuid",
  "settings": {
    "displayName": "表示名",
    "keyboardLayout": "JIS",
    "mouseDpi": 800,
    "gameSensitivity": 0.5,
    "windowsSpeed": 10,
    "mouseAcceleration": false,
    "rawInput": true,
    "cm360": 42.5,
    "toggleSprint": false,
    "toggleSneak": false,
    "autoJump": false,
    "fingerAssignments": {},
    "gameLanguage": "ja_jp",
    "mouseModel": "Logitech G Pro X Superlight",
    "keyboardModel": "Ducky One 2 Mini",
    "notes": "メモ"
  },
  "keybindings": [
    {
      "action": "forward",
      "keyCode": "key.keyboard.w",
      "category": "movement",
      "fingers": ["left-middle"]
    }
  ],
  "customKeys": [
    {
      "keyCode": "key.custom.1",
      "keyName": "F13",
      "category": "keyboard"
    }
  ],
  "keyRemaps": [
    {
      "sourceKey": "CapsLock",
      "targetKey": "LeftControl"
    }
  ],
  "externalTools": [
    {
      "triggerKey": "key.keyboard.f",
      "toolName": "AutoHotKey",
      "actionName": "リセット",
      "description": "説明"
    }
  ]
}
```

#### レスポンス

**成功時 (200 OK)**

```json
{
  "success": true
}
```

**エラーレスポンス**

- **401 Unauthorized**: 認証が必要
- **403 Forbidden**: 管理者権限が必要
- **404 Not Found**: 対象ユーザーが見つからない
- **500 Internal Server Error**: 保存エラー

---

### 8. 🔒 プレイヤー設定削除

**エンドポイント**: `DELETE /api/keybindings`

**説明**: 認証済みユーザーの全設定を削除します。

**認証**: 必須

#### レスポンス

**成功時 (200 OK)**

```json
{
  "success": true
}
```

**エラーレスポンス**

- **401 Unauthorized**: 認証が必要
- **500 Internal Server Error**: 削除エラー

---

## アイテム配置

### 9. アイテム配置取得

**エンドポイント**: `GET /api/item-layouts?uuid={uuid}`

**説明**: 指定されたUUIDのアイテム配置を全て取得します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `uuid` | string | ✓ | プレイヤーのUUID |

#### レスポンス

**成功時 (200 OK)**

```json
[
  {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "segment": 1,
    "slot1": ["ender_pearl"],
    "slot2": ["flint_and_steel"],
    "slot3": ["water_bucket"],
    "slot4": ["lava_bucket"],
    "slot5": ["crafting_table"],
    "slot6": ["planks"],
    "slot7": ["golden_apple"],
    "slot8": ["bed"],
    "slot9": ["iron_pickaxe"],
    "offhand": ["shield"],
    "notes": "メモ"
  }
]
```

**エラーレスポンス**

- **400 Bad Request**: UUIDが指定されていない
- **500 Internal Server Error**: 取得エラー

---

### 10. アイテム配置作成・更新

**エンドポイント**: `POST /api/item-layouts`

**説明**: アイテム配置を作成または更新します。

#### リクエスト

**ボディ (JSON)**

```json
{
  "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
  "segment": 1,
  "slot1": ["ender_pearl"],
  "slot2": ["flint_and_steel"],
  "slot3": ["water_bucket"],
  "slot4": ["lava_bucket"],
  "slot5": ["crafting_table"],
  "slot6": ["planks"],
  "slot7": ["golden_apple"],
  "slot8": ["bed"],
  "slot9": ["iron_pickaxe"],
  "offhand": ["shield"],
  "notes": "メモ"
}
```

#### レスポンス

**成功時 (200 OK)**

```json
{
  "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
  "segment": 1,
  "slot1": ["ender_pearl"],
  ...
}
```

**エラーレスポンス**

- **400 Bad Request**: UUIDまたはsegmentが指定されていない
- **500 Internal Server Error**: 保存エラー

---

### 11. アイテム配置削除

**エンドポイント**: `DELETE /api/item-layouts?uuid={uuid}&segment={segment}`

**説明**: 指定されたアイテム配置を削除します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `uuid` | string | ✓ | プレイヤーのUUID |
| `segment` | number | ✓ | セグメント番号 |

#### レスポンス

**成功時 (200 OK)**

```json
{
  "success": true
}
```

**エラーレスポンス**

- **400 Bad Request**: UUIDまたはsegmentが指定されていない
- **500 Internal Server Error**: 削除エラー

---

## ゲスト管理

### 12. 🔒 ゲストユーザー一覧取得

**エンドポイント**: `GET /api/guests`

**説明**: ゲストユーザーの一覧を取得します（管理者のみ）。

**認証**: 管理者権限が必要

#### レスポンス

**成功時 (200 OK)**

```json
[
  {
    "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
    "mcid": "GuestPlayer",
    "displayName": "ゲストプレイヤー",
    "isGuest": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  }
]
```

**エラーレスポンス**

- **403 Forbidden**: 管理者権限が必要
- **500 Internal Server Error**: 取得エラー

---

### 13. 🔒 ゲストユーザー作成

**エンドポイント**: `POST /api/guests`

**説明**: ゲストユーザーを作成します（管理者のみ）。Mojang APIでMCIDを検証します。

**認証**: 管理者権限が必要

#### リクエスト

**ボディ (JSON)**

```json
{
  "mcid": "GuestPlayer",
  "displayName": "ゲストプレイヤー"
}
```

#### レスポンス

**成功時 (200 OK)**

```json
{
  "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
  "mcid": "GuestPlayer",
  "displayName": "ゲストプレイヤー",
  "isGuest": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**エラーレスポンス**

- **400 Bad Request**: MCIDが存在しない、または既に登録済み
- **403 Forbidden**: 管理者権限が必要
- **500 Internal Server Error**: 作成エラー

---

### 14. 🔒 ゲストユーザー削除

**エンドポイント**: `DELETE /api/guests?uuid={uuid}`

**説明**: ゲストユーザーを削除します（管理者のみ）。

**認証**: 管理者権限が必要

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `uuid` | string | ✓ | ゲストユーザーのUUID |

#### レスポンス

**成功時 (200 OK)**

```json
{
  "success": true
}
```

**エラーレスポンス**

- **400 Bad Request**: ゲストユーザー以外は削除不可
- **403 Forbidden**: 管理者権限が必要
- **404 Not Found**: ユーザーが見つからない
- **500 Internal Server Error**: 削除エラー

---

## MCID同期

### 15. 個別MCID同期

**エンドポイント**: `GET /api/sync-mcid?uuid={uuid}`

**説明**: 指定されたユーザーのMCIDをMojang APIから同期します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `uuid` | string | ✓ | プレイヤーのUUID |

#### レスポンス

**更新された場合 (200 OK)**

```json
{
  "success": true,
  "updated": true,
  "oldMcid": "OldName",
  "newMcid": "NewName"
}
```

**更新不要の場合 (200 OK)**

```json
{
  "success": true,
  "updated": false,
  "mcid": "CurrentName"
}
```

**エラーレスポンス**

- **400 Bad Request**: UUIDが指定されていない
- **404 Not Found**: ユーザーが見つからない
- **500 Internal Server Error**: Mojang API取得エラー

---

### 16. 🔒 全ユーザーMCID同期

**エンドポイント**: `POST /api/sync-mcid`

**説明**: 全ユーザーのMCIDをMojang APIから同期します（Cron用）。

**認証**: `Authorization: Bearer {CRON_SECRET}` ヘッダーが必要

#### リクエスト

**ヘッダー**

```
Authorization: Bearer {CRON_SECRET}
```

#### レスポンス

**成功時 (200 OK)**

```json
{
  "success": true,
  "totalUsers": 100,
  "updatedCount": 5,
  "errorCount": 0,
  "updates": [
    {
      "uuid": "069a79f4-44e9-4726-a5be-fca90e38aaf5",
      "oldMcid": "OldName",
      "newMcid": "NewName"
    }
  ]
}
```

**エラーレスポンス**

- **401 Unauthorized**: CRON_SECRETが不正
- **500 Internal Server Error**: 同期エラー

---

## アバター

### 17. アバター画像取得

**エンドポイント**: `GET /api/avatar?uuid={uuid}&size={size}`

**説明**: Mojang APIからスキンテクスチャを取得し、アバター画像を生成します。

#### リクエスト

**クエリパラメータ**

| パラメータ | 型 | 必須 | 説明 |
|----------|------|------|------|
| `uuid` | string | ✓ | プレイヤーのUUID |
| `size` | number |  | 画像サイズ（デフォルト: 64） |

**例**
```
GET /api/avatar?uuid=069a79f4-44e9-4726-a5be-fca90e38aaf5&size=128
```

#### レスポンス

**成功時 (200 OK)**

- **Content-Type**: `image/png`
- **Cache-Control**: `public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800`

PNG画像データを返します。

**エラーレスポンス**

- **400 Bad Request**: UUIDが指定されていない
- **404 Not Found**: スキンテクスチャが見つからない
- **500 Internal Server Error**: 画像生成エラー

---

## キーコード形式

キーバインドは Minecraft の内部形式で保存されます：

### キーボード
- 形式: `key.keyboard.<key_name>`
- 例:
  - `key.keyboard.w`
  - `key.keyboard.left.shift`
  - `key.keyboard.space`
  - `key.keyboard.1`

### マウス
- 形式: `key.mouse.<button>`
- 例:
  - `key.mouse.left`
  - `key.mouse.right`
  - `key.mouse.middle`

### カスタムキー
- 形式: `key.custom.<number>`
- 例:
  - `key.custom.1` (F13など)
  - `key.custom.2` (マウスサイドボタンなど)

---

## 使用例

### JavaScript / TypeScript

```typescript
// 個別プレイヤー情報の取得
async function getPlayerInfo(mcid: string) {
  const response = await fetch(`/api/player/${mcid}`);
  if (!response.ok) throw new Error('Failed to fetch player');
  return await response.json();
}

// プレイヤー設定の更新（認証必須）
async function updateSettings(settings: any) {
  const response = await fetch('/api/keybindings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to save settings');
  return await response.json();
}

// MCID存在チェック
async function checkMcid(mcid: string) {
  const response = await fetch(`/api/auth/check-mcid?mcid=${mcid}`);
  const data = await response.json();
  return data.exists;
}
```

### cURL

```bash
# 個別プレイヤー情報の取得
curl -X GET "http://localhost:3000/api/player/Notch"

# MCID存在チェック
curl -X GET "http://localhost:3000/api/auth/check-mcid?mcid=Notch"

# ユーザー登録
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"mcid":"Notch","displayName":"Notch"}'

# アバター画像取得
curl -X GET "http://localhost:3000/api/avatar?uuid=069a79f4-44e9-4726-a5be-fca90e38aaf5&size=128" \
  --output avatar.png
```

---

## エラーハンドリング

全てのエラーレスポンスは以下の形式で返されます：

```json
{
  "error": "エラーメッセージ"
}
```

### HTTPステータスコード

| コード | 説明 |
|--------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 400 | リクエストエラー（バリデーション失敗など） |
| 401 | 認証が必要 |
| 403 | 権限不足 |
| 404 | リソースが見つからない |
| 500 | サーバー内部エラー |

---

## レート制限

現在、レート制限は実装されていませんが、以下の点に注意してください：

- **Mojang API**: MCID同期APIは内部でMojang APIを呼び出すため、レート制限があります（100msの遅延を設定済み）
- **アバター画像**: キャッシュヘッダーを活用し、不要なリクエストを避けてください

---

## 注意事項

1. **キーバインドの配列**: 同じアクションに複数のキーが割り当てられている場合、配列形式で返されます。単一のキーの場合は文字列です。

2. **null値**: オプショナルな設定値は、設定されていない場合 `null` が返されます。

3. **タイムスタンプ**: すべての日時は ISO 8601 形式（UTC）で返されます。

4. **UUID**: プレイヤーのUUIDは Mojang の公式UUIDで、ハイフン付き形式です。

5. **認証**: 認証が必要なエンドポイントでは、NextAuth.jsセッションを使用します。クライアント側ではセッション管理が自動的に行われます。

6. **管理者権限**: 一部のエンドポイントは管理者権限が必要です。管理者UUIDは環境変数 `ADMIN_UUIDS` で設定されます。

---

## 更新履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| 2.0.0 | 2024-01-XX | 全APIエンドポイントを追加 |
| 1.0.0 | 2024-01-XX | 初版作成（プレイヤー情報取得のみ） |
