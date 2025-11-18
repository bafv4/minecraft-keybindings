/**
 * 楽天APIを使ってゲーミングマウス・キーボードのデータを取得
 *
 * 使用方法:
 * 1. .env.local に RAKUTEN_APP_ID を追加
 * 2. node scripts/fetch-devices.js
 */

const fs = require('fs');
const path = require('path');

// 環境変数から楽天APIキーを取得
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID;

if (!RAKUTEN_APP_ID) {
  console.error('Error: RAKUTEN_APP_ID is not set in .env.local');
  console.error('Please get your Application ID from https://webservice.rakuten.co.jp/');
  process.exit(1);
}

const BASE_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';

/**
 * 楽天商品検索APIを呼び出し
 */
async function searchRakuten(keyword, page = 1, sort = '-itemPrice') {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID,
    keyword: keyword,
    hits: 30, // 1ページあたりの取得件数
    page: page,
    sort: sort,
    availability: 1, // 在庫あり
  });

  const url = `${BASE_URL}?${params}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching data for "${keyword}":`, error);
    return null;
  }
}

/**
 * メーカー名を抽出
 */
function extractMaker(itemName) {
  const makers = [
    'Logicool', 'Logitech',
    'Razer',
    'SteelSeries',
    'Corsair',
    'HyperX',
    'ROCCAT',
    'BenQ', 'ZOWIE',
    'Glorious',
    'Finalmouse',
    'Xtrfy',
    'Vaxee',
    'Pulsar',
    'ASUS', 'ROG',
    'MSI',
    'FILCO',
    'Ducky',
    'Keychron',
    'Leopold',
    'Varmilo',
    'REALFORCE',
    'HHKB',
    'Cooler Master',
  ];

  for (const maker of makers) {
    if (itemName.toUpperCase().includes(maker.toUpperCase())) {
      return maker;
    }
  }

  return 'その他';
}

/**
 * 商品が有効なゲーミングデバイスかチェック
 */
function isValidGamingDevice(itemName) {
  const itemLower = itemName.toLowerCase();

  // 除外キーワード
  const excludeKeywords = [
    '【中古】', '【中古 ', '(中古)',
    'マウスパッド', 'mousepad',
    'ヘッドセット', 'headset',
    'ノートパソコン', 'ノートpc', 'laptop',
    'モニター', 'monitor',
    'グラフィックボード', 'グラボ', ' rtx', ' gtx',
    'デスクトップpc', 'ゲーミングpc',
    'スイッチ', '交換用スイッチ',
    'ケーブル', 'cable',
    'マウスソール', 'ソール',
    '交換用', '替え',
    'ゲームボード', // ゲームボード（キーボードではない）
    '10個セット', '【10個',
  ];

  for (const keyword of excludeKeywords) {
    if (itemName.includes(keyword) || itemLower.includes(keyword.toLowerCase())) {
      return false;
    }
  }

  return true;
}

/**
 * 製品情報を抽出・整形
 */
function extractProductInfo(item) {
  const itemName = item.itemName;
  const itemUrl = item.itemUrl;

  // 無効な商品をスキップ
  if (!isValidGamingDevice(itemName)) {
    return null;
  }

  const maker = extractMaker(itemName);

  // 型番を抽出する詳細なロジック
  let modelNumber = null;

  // 有名ゲーミングブランドの型番パターンを抽出
  const patterns = [
    // ASUS ROG
    /(ROG\s+(?:Harpe|Keris|Chakram|Gladius|Strix|Azoth|Falchion|Claymore)\s+(?:Ace\s+)?(?:Extreme|Wireless|II|III|Pro)?)/i,

    // Logicool/Logitech
    /(G\s?PRO\s?X?\s?(?:SUPERLIGHT)?(?:\s?2)?)/i,
    /(G\d{3}\s?(?:X|HERO|LIGHTSPEED|WIRELESS)?)/i,
    /(MX\s?(?:MASTER|ANYWHERE)\s?\d?[A-Z]?)/i,

    // Razer
    /(DeathAdder\s?(?:V\d|V2\s?Pro|Elite|Essential)?)/i,
    /(Viper\s?(?:V\d|V2\s?Pro|Ultimate|Mini)?)/i,
    /(Basilisk\s?(?:V\d|V3\s?Pro|Ultimate|X\s?HyperSpeed)?)/i,
    /(Naga\s?(?:V2\s?Pro|Pro|Trinity|X)?)/i,
    /(Huntsman\s?(?:V\d|Mini|Elite)?)/i,
    /(BlackWidow\s?(?:V\d|V3\s?Pro|Elite|Ultimate)?)/i,

    // ZOWIE (BenQ)
    /((?:EC|FK|S|ZA)\d[+-]?[A-C]?(?:-[A-Z]+)?)/i,

    // SteelSeries
    /(Rival\s?\d{3})/i,
    /(Sensei\s?(?:\d+|Ten)?)/i,
    /(Aerox\s?\d)/i,
    /(Apex\s?(?:Pro\s?Mini|Pro|7|9)?)/i,

    // Glorious
    /(Model\s?[ODI](?:\s?[-]?(?:Wireless|Wired))?)/i,

    // Finalmouse
    /(Starlight\s?[-]?\d+\s?(?:Small|Medium|Large)?)/i,
    /(Ultralight\s?2)/i,
    /(Pegasus)/i,

    // Corsair
    /(Dark\s?Core\s?RGB(?:\s?Pro)?)/i,
    /(Sabre\s?RGB)/i,
    /(Scimitar\s?(?:Elite|RGB)?)/i,
    /(K\d{2}\s?(?:RGB)?)/i,

    // HyperX
    /(Pulsefire\s?(?:Haste|Surge|FPS\s?Pro)?)/i,
    /(Alloy\s?(?:Origins|FPS|Elite)?)/i,

    // Xtrfy
    /(M\d{1,2}(?:\s?RGB)?)/i,

    // Vaxee
    /((?:PA|XE|NP|ZYGEN)\s?(?:Black|White)?)/i,

    // Pulsar
    /(X2(?:\s?Mini|\s?V2)?)/i,
    /(Xlite(?:\s?V\d)?(?:\s?Wireless)?)/i,

    // FILCO
    /(Majestouch\s?\d?(?:\s?Ninja)?)/i,

    // Ducky
    /(One\s?\d?\s?(?:Mini|TKL|Pro)?)/i,
    /(Shine\s?\d)/i,

    // HHKB
    /(Professional\s?(?:HYBRID|Classic|Type-S)?)/i,

    // Keychron
    /(K\d{1,2}(?:\s?Pro)?)/i,
    /(Q\d{1,2}(?:\s?Pro)?)/i,

    // 汎用パターン（最後の手段）
    /([A-Z]{2,}\s?[-]?\d{2,4}[A-Z]*)/i,
  ];

  for (const pattern of patterns) {
    const match = itemName.match(pattern);
    if (match) {
      modelNumber = match[1].trim().replace(/\s+/g, ' ');
      break;
    }
  }

  // 型番が取得できなかった場合は、商品名の最初の50文字を使用
  if (!modelNumber) {
    // 商品名から不要な情報を削除してシンプルにする
    modelNumber = itemName
      .replace(/【.*?】/g, '')  // 【】内を削除
      .replace(/（.*?）/g, '')  // （）内を削除
      .replace(/\(.*?\)/g, '')  // ()内を削除
      .replace(/\|.*/g, '')     // | 以降を削除
      .replace(/\s+/g, ' ')     // 連続スペースを1つに
      .trim()
      .substring(0, 50);
  }

  return {
    name: itemName,
    model: modelNumber,
    url: itemUrl,
    maker: maker,
  };
}

/**
 * 商品の重複判定（型番の正規化）
 */
function normalizeModel(model) {
  return model
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/[-_]/g, '')
    .replace(/WIRELESS|WIRED|RGB|BLACK|WHITE/g, '');
}

/**
 * メイン処理
 */
async function main() {
  console.log('Fetching gaming mice and keyboards from Rakuten API...\n');

  const devices = {
    mice: [],
    keyboards: [],
    lastUpdated: new Date().toISOString(),
  };

  // ゲーミングマウスを取得（複数ページ）
  console.log('Fetching gaming mice...');
  const mouseKeywords = [
    'ゲーミングマウス',
    'ゲーミング マウス 有線',
    'ゲーミング マウス ワイヤレス',
  ];

  for (const keyword of mouseKeywords) {
    console.log(`  Searching: ${keyword}`);
    // 各キーワードで2ページ分取得
    for (let page = 1; page <= 2; page++) {
      const data = await searchRakuten(keyword, page);

      if (data && data.Items) {
        const products = data.Items
          .map(item => extractProductInfo(item.Item))
          .filter(item => item !== null);
        devices.mice.push(...products);
        console.log(`    Page ${page}: Found ${products.length} valid items`);
      }

      // APIレート制限対策
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // ゲーミングキーボードを取得（複数ページ）
  console.log('\nFetching gaming keyboards...');
  const keyboardKeywords = [
    'ゲーミングキーボード',
    'メカニカルキーボード ゲーミング',
  ];

  for (const keyword of keyboardKeywords) {
    console.log(`  Searching: ${keyword}`);
    // 各キーワードで2ページ分取得
    for (let page = 1; page <= 2; page++) {
      const data = await searchRakuten(keyword, page);

      if (data && data.Items) {
        const products = data.Items
          .map(item => extractProductInfo(item.Item))
          .filter(item => item !== null);
        devices.keyboards.push(...products);
        console.log(`    Page ${page}: Found ${products.length} valid items`);
      }

      // APIレート制限対策
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 重複を削除（正規化した型番ベース）
  const uniqueMice = new Map();
  devices.mice.forEach(item => {
    const normalizedKey = `${item.maker}_${normalizeModel(item.model)}`;
    if (!uniqueMice.has(normalizedKey)) {
      uniqueMice.set(normalizedKey, item);
    }
  });
  devices.mice = Array.from(uniqueMice.values());

  const uniqueKeyboards = new Map();
  devices.keyboards.forEach(item => {
    const normalizedKey = `${item.maker}_${normalizeModel(item.model)}`;
    if (!uniqueKeyboards.has(normalizedKey)) {
      uniqueKeyboards.set(normalizedKey, item);
    }
  });
  devices.keyboards = Array.from(uniqueKeyboards.values());

  // メーカー名でソート
  devices.mice.sort((a, b) => {
    if (a.maker !== b.maker) {
      return a.maker.localeCompare(b.maker);
    }
    return a.model.localeCompare(b.model);
  });
  devices.keyboards.sort((a, b) => {
    if (a.maker !== b.maker) {
      return a.maker.localeCompare(b.maker);
    }
    return a.model.localeCompare(b.model);
  });

  // データを保存
  const outputPath = path.join(__dirname, '..', 'data', 'devices.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(devices, null, 2), 'utf8');

  console.log(`\n✅ Data saved to ${outputPath}`);
  console.log(`   Total mice: ${devices.mice.length}`);
  console.log(`   Total keyboards: ${devices.keyboards.length}`);
}

main().catch(console.error);
