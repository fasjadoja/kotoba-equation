# Formula Studio

「人生の成果 ＝ 能力 × 熱量 × 考え方」のような**四則演算の方程式画像**をブラウザだけで作成し、X / Instagram にそのまま投稿できる高画質PNGを書き出すジェネレーターです。

無料で使えるツールで集客し、**買い切りのProライセンス**（＋任意で広告）で収益化する構成になっています。

## 収益モデル

| | Free | Pro（買い切り） |
| --- | --- | --- |
| 画像生成・ダウンロード | 無制限 | 無制限 |
| テーマ | 2種 | 6種すべて |
| サイズ | 16:9 | 16:9 / 1:1 / 4:5 |
| 解像度 | 等倍（1200px） | 2倍（2400px） |
| テンプレート | 5種 | 12種すべて |
| 透かし | あり | なし |

- 決済は Stripe Checkout（買い切り・サブスク管理不要）。
- ライセンスキーは **HMAC署名付きのキー**で、DB不要で検証できます（`src/lib/license.ts`）。
- 広告は `NEXT_PUBLIC_ADSENSE_CLIENT` を設定したときだけ AdSense タグを読み込みます。

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値を設定
npm run dev                  # http://localhost:3000
```

Stripe / ライセンス鍵が未設定でも、無料機能（画像生成・ダウンロード）はそのまま動作します。購入ボタンは「準備中」を返します。

## デプロイ（Vercel想定）

1. このリポジトリを GitHub にプッシュし、Vercel で Import。
2. Vercel の Environment Variables に `.env.example` の値を設定。
   - `LICENSE_SECRET` は `openssl rand -hex 32` で生成した値を使用（**変更すると発行済みライセンスが無効になります**）。
3. 独自ドメインを割り当て、`NEXT_PUBLIC_SITE_URL` をそのドメインに設定。
4. Stripe ダッシュボードで本番APIキーを取得し `STRIPE_SECRET_KEY` に設定。

## Stripe の設定

- 商品：`Formula Studio Pro`（一回払い / JPY）
- `STRIPE_PRICE_ID` を設定するとその Price を使用。未設定なら `PRO_PRICE_JPY` の金額で都度作成します。
- 購入完了後、`/success?session_id=...` で決済を検証し、その場でライセンスキーを発行・自動有効化します（Webhook不要）。

## 公開前チェックリスト

- [ ] `/legal/tokushoho` の事業者名・住所・電話番号を実際の情報に差し替え（特定商取引法の表示義務）
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` を実在のアドレスに設定
- [ ] `LICENSE_SECRET` を本番用に生成して設定
- [ ] Google Search Console にサイトを登録（`/sitemap.xml` を送信）
- [ ] AdSense を使う場合は審査通過後に `NEXT_PUBLIC_ADSENSE_CLIENT` を設定

## 主なディレクトリ

```
src/
  app/                  ページ・APIルート
    api/checkout        Stripe Checkout セッション作成
    api/license/issue   決済検証＋ライセンス発行
    api/license/verify  ライセンス検証
  components/Editor.tsx エディタUI（Canvasプレビュー）
  lib/render.ts         Canvas描画（無料/Pro共通のレンダラ）
  lib/presets.ts        テンプレート
  lib/themes.ts         テーマ
  lib/license.ts        HMACライセンス
```
