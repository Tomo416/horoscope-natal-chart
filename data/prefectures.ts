export interface Prefecture {
  code: number;
  name: string;
  city: string; // 代表地点（県庁所在地）
  lat: number;
  lon: number;
}

/** 日本の47都道府県の代表緯度・経度（県庁所在地） */
export const PREFECTURES: Prefecture[] = [
  { code: 1, name: "北海道", city: "札幌市", lat: 43.0642, lon: 141.3469 },
  { code: 2, name: "青森県", city: "青森市", lat: 40.8244, lon: 140.7400 },
  { code: 3, name: "岩手県", city: "盛岡市", lat: 39.7036, lon: 141.1527 },
  { code: 4, name: "宮城県", city: "仙台市", lat: 38.2688, lon: 140.8721 },
  { code: 5, name: "秋田県", city: "秋田市", lat: 39.7186, lon: 140.1024 },
  { code: 6, name: "山形県", city: "山形市", lat: 38.2404, lon: 140.3633 },
  { code: 7, name: "福島県", city: "福島市", lat: 37.7500, lon: 140.4678 },
  { code: 8, name: "茨城県", city: "水戸市", lat: 36.3418, lon: 140.4468 },
  { code: 9, name: "栃木県", city: "宇都宮市", lat: 36.5658, lon: 139.8836 },
  { code: 10, name: "群馬県", city: "前橋市", lat: 36.3911, lon: 139.0608 },
  { code: 11, name: "埼玉県", city: "さいたま市", lat: 35.8569, lon: 139.6489 },
  { code: 12, name: "千葉県", city: "千葉市", lat: 35.6047, lon: 140.1233 },
  { code: 13, name: "東京都", city: "新宿区", lat: 35.6895, lon: 139.6917 },
  { code: 14, name: "神奈川県", city: "横浜市", lat: 35.4478, lon: 139.6425 },
  { code: 15, name: "新潟県", city: "新潟市", lat: 37.9026, lon: 139.0236 },
  { code: 16, name: "富山県", city: "富山市", lat: 36.6953, lon: 137.2114 },
  { code: 17, name: "石川県", city: "金沢市", lat: 36.5947, lon: 136.6256 },
  { code: 18, name: "福井県", city: "福井市", lat: 36.0652, lon: 136.2216 },
  { code: 19, name: "山梨県", city: "甲府市", lat: 35.6642, lon: 138.5684 },
  { code: 20, name: "長野県", city: "長野市", lat: 36.6513, lon: 138.1810 },
  { code: 21, name: "岐阜県", city: "岐阜市", lat: 35.3912, lon: 136.7223 },
  { code: 22, name: "静岡県", city: "静岡市", lat: 34.9769, lon: 138.3831 },
  { code: 23, name: "愛知県", city: "名古屋市", lat: 35.1802, lon: 136.9066 },
  { code: 24, name: "三重県", city: "津市", lat: 34.7303, lon: 136.5086 },
  { code: 25, name: "滋賀県", city: "大津市", lat: 35.0045, lon: 135.8686 },
  { code: 26, name: "京都府", city: "京都市", lat: 35.0214, lon: 135.7556 },
  { code: 27, name: "大阪府", city: "大阪市", lat: 34.6863, lon: 135.5200 },
  { code: 28, name: "兵庫県", city: "神戸市", lat: 34.6913, lon: 135.1830 },
  { code: 29, name: "奈良県", city: "奈良市", lat: 34.6853, lon: 135.8327 },
  { code: 30, name: "和歌山県", city: "和歌山市", lat: 34.2260, lon: 135.1675 },
  { code: 31, name: "鳥取県", city: "鳥取市", lat: 35.5039, lon: 134.2381 },
  { code: 32, name: "島根県", city: "松江市", lat: 35.4723, lon: 133.0505 },
  { code: 33, name: "岡山県", city: "岡山市", lat: 34.6618, lon: 133.9344 },
  { code: 34, name: "広島県", city: "広島市", lat: 34.3966, lon: 132.4596 },
  { code: 35, name: "山口県", city: "山口市", lat: 34.1859, lon: 131.4714 },
  { code: 36, name: "徳島県", city: "徳島市", lat: 34.0658, lon: 134.5593 },
  { code: 37, name: "香川県", city: "高松市", lat: 34.3401, lon: 134.0434 },
  { code: 38, name: "愛媛県", city: "松山市", lat: 33.8416, lon: 132.7657 },
  { code: 39, name: "高知県", city: "高知市", lat: 33.5597, lon: 133.5311 },
  { code: 40, name: "福岡県", city: "福岡市", lat: 33.6064, lon: 130.4183 },
  { code: 41, name: "佐賀県", city: "佐賀市", lat: 33.2494, lon: 130.2988 },
  { code: 42, name: "長崎県", city: "長崎市", lat: 32.7448, lon: 129.8737 },
  { code: 43, name: "熊本県", city: "熊本市", lat: 32.7898, lon: 130.7417 },
  { code: 44, name: "大分県", city: "大分市", lat: 33.2381, lon: 131.6126 },
  { code: 45, name: "宮崎県", city: "宮崎市", lat: 31.9111, lon: 131.4239 },
  { code: 46, name: "鹿児島県", city: "鹿児島市", lat: 31.5602, lon: 130.5581 },
  { code: 47, name: "沖縄県", city: "那覇市", lat: 26.2124, lon: 127.6809 },
];

export const TOKYO = PREFECTURES[12];
