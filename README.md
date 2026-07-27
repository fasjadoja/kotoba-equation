# formula.studio

四則演算で思考を1枚の画像にする、無料のジェネレーター。
「人生の成果 ＝ 能力 × 熱量 × 考え方」のような思考式を、X / note / Instagram 向けの画像として書き出せます。

- すべての機能が無料。ログイン・回数制限・広告なし
- 収益は任意の寄付（Buy Me a Coffee など）のみ
- 画像生成も履歴保存もブラウザ内で完結（サーバーに送信しない）

## 機能

| | |
| --- | --- |
| サイズ | X 横長 1200×675 / 正方形 1080×1080 / note 1280×670 |
| 書き出し | 2倍解像度のPNG保存、クリップボードコピー |
| 共有 | 「画像を保存してXでシェア」でダウンロードとX投稿画面を同時に起動 |
| 履歴 | 直近5件を localStorage に保存し、ワンクリックで復元 |
| テーマ | ライト / ダーク、ロゴ表示のON/OFF |
| テンプレート | 12種のプリセット |

### レイアウト崩れ対策

`src/lib/render.ts` が描画のすべてを担当します。文字数や要素数が増えても崩れないよう、次を実装しています。

- 見出し・補足は禁則処理つきの文字単位で折り返し
- 方程式は「演算子＋要素」を1グループとして行送りするため、行末に演算子が取り残されない
- 1要素が1行に収まらない場合のみ、その要素を文字単位で分割
- 全ブロックの合計高さが収まるまで基準サイズを段階的に縮小し、上下中央に再配置
- 補足と「＝」には最小サイズを設定し、縮小しても読めるサイズを維持

## セットアップ

```bash
npm install
cp .env.example .env.local   # 必要な値を設定
npm run dev
```

| 環境変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 公開URL（OGP・sitemap・canonical に使用） |
| `NEXT_PUBLIC_DONATE_URL` | 寄付ページのURL。未設定なら寄付リンクは表示されません |
| `NEXT_PUBLIC_CONTACT_URL` | 問い合わせ先URL（任意） |

## デプロイ

1. Vercel でこのリポジトリをインポート
2. 上記の環境変数を設定
3. デプロイ後、Google Search Console に `https://<ドメイン>/sitemap.xml` を送信

## 主なディレクトリ

```
src/app          ページ（トップ / 利用規約 / プライバシー / sitemap / robots）
src/components   Editor（UI）
src/lib          render.ts（描画エンジン）, presets.ts, themes.ts, types.ts, site.ts
src/hooks        useHistory.ts（localStorage 履歴）
```
