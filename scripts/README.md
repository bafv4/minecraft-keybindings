# Device Data Fetching Script

このディレクトリには、楽天APIを使用してゲーミングマウスとキーボードのデータを取得するスクリプトが含まれています。

## セットアップ

### 1. 楽天APIアプリケーションIDの取得

1. [楽天ウェブサービス](https://webservice.rakuten.co.jp/)にアクセス
2. アカウントを作成またはログイン
3. 「アプリID発行」から新しいアプリケーションを作成
4. 発行されたアプリケーションIDをコピー

### 2. 環境変数の設定

`.env.local`ファイルに以下を追加:

```env
RAKUTEN_APP_ID="your-application-id-here"
```

## 使用方法

### データの取得

```bash
pnpm fetch-devices
```

このコマンドは以下を実行します:

1. 楽天APIから複数のキーワードでゲーミングマウス・キーボードを検索
2. 商品情報（名前、型番、URL、メーカー）を抽出
3. 重複を削除
4. `data/devices.json`に保存

### 検索キーワード

**マウス:**
- ゲーミングマウス Logicool
- ゲーミングマウス Razer
- ゲーミングマウス ZOWIE
- ゲーミングマウス Glorious

**キーボード:**
- ゲーミングキーボード Logicool
- ゲーミングキーボード Razer
- ゲーミングキーボード FILCO
- ゲーミングキーボード Ducky

キーワードを追加・変更する場合は、`fetch-devices.js`の`mouseKeywords`と`keyboardKeywords`配列を編集してください。

## データ構造

`data/devices.json`:

```json
{
  "mice": [
    {
      "name": "商品名",
      "model": "型番",
      "url": "https://...",
      "maker": "メーカー/ショップ名"
    }
  ],
  "keyboards": [...],
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

## 注意事項

- 楽天APIには1秒あたりのリクエスト制限があるため、スクリプトには1秒のディレイを入れています
- 型番の抽出は正規表現による推測のため、完全ではない可能性があります
- 定期的に実行してデータを更新することを推奨します

## カスタマイズ

### 取得件数の変更

`fetch-devices.js`の`hits`パラメータを変更:

```javascript
hits: 30, // 1ページあたりの取得件数
```

### ソート順の変更

デフォルトは価格降順(`-itemPrice`)ですが、以下に変更可能:

- `+itemPrice`: 価格昇順
- `+reviewCount`: レビュー件数順
- `+reviewAverage`: レビュー評価順
- `-updateTimestamp`: 更新日時順

### 複数ページの取得

`page`パラメータを使用してループ処理を追加すれば、より多くのデータを取得できます。
