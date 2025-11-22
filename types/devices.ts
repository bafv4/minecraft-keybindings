/**
 * デバイス情報の型定義
 */

export interface DeviceInfo {
  name: string;      // 商品名
  model: string;     // 型番
  url: string;       // 商品ページURL
  maker: string;     // メーカー/ショップ名
}

export interface DevicesData {
  mice: DeviceInfo[];
  keyboards: DeviceInfo[];
  lastUpdated: string | null;
}
