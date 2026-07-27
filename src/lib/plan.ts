export const PRO_PRICE_JPY = Number(process.env.NEXT_PUBLIC_PRO_PRICE_JPY ?? 1980);

export const PRO_PRICE_LABEL = `¥${PRO_PRICE_JPY.toLocaleString("ja-JP")}`;

export const PRO_FEATURES = [
  "透かし（Formula Studio）を削除",
  "全テーマを解放（ペーパー / オーシャン / サクラ / モノクローム）",
  "正方形・縦長サイズ（Instagram・スレッズ向け）",
  "2倍解像度での書き出し（2400px）",
  "Pro限定テンプレート（市場価値・価値の方程式など）",
  "買い切り。以降の追加課金なし",
];

export const FREE_FEATURES = [
  "四則演算の方程式画像を無制限に作成",
  "基本テーマ2種（クリーン / ミッドナイト）",
  "16:9（1200×675px）で書き出し",
  "無料テンプレート5種",
  "画像に Formula Studio の透かしが入ります",
];
