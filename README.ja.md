# Gatsby Base

[English](./README.md) | **日本語**

Gatsby・TypeScript・Three.js で作ったポートフォリオ兼ブログです。記事は microCMS で書き、静的ページとして公開します。ページの背後には地球が浮かび、スクロールに合わせて位置と大きさが変わります。同じコンテンツを Astro・Next.js・Nuxt・SvelteKit で作った姉妹サイトが、衛星として地球の周りを回ります。

公開サイト: <https://gatsbybase.vercel.app/>

## 技術スタック

| 分野             | 使用技術                                                  |
| ---------------- | --------------------------------------------------------- |
| フレームワーク   | Gatsby 5.16 / React 19                                    |
| 言語             | TypeScript 7                                              |
| 3D               | Three.js r187                                             |
| スタイル         | Sass（役割ごとに分割した SCSS）、セルフホストの可変フォント |
| コンテンツ       | microCMS（`gatsby-source-microcms`）                      |
| お問い合わせ     | Vercel Functions + Nodemailer、reCAPTCHA v3（任意）       |
| ホスティング     | Vercel（Node.js 24）                                      |

## 主な機能

- **スクロールに連動する地球**: 各セクションの `data-state` で、地球の位置と大きさが決まります。Three.js は初回描画のあとに別チャンクとして読み込むため、初期バンドルには含まれません。
- **microCMS の静的ブログ**: 記事ページは File System Route API（`{MicrocmsBlog.blogId}.tsx`）で生成します。アイキャッチが無い記事には、自動生成した惑星のイラストを表示します。アイキャッチは microCMS の画像 API でリサイズし、WebP で配信します。
- **お問い合わせフォーム**: React 19 の `useActionState` を使い、入力欄を離れたときと送信時に入力をチェックします。送信先は Web 標準の `Request` / `Response` で書いた Vercel Function（`api/contact.ts`）です。
- **新しいブラウザ機能で JavaScript を減らす**:
  - モバイルメニューは Popover API。Esc キーや外側クリックで閉じる動作、フォーカス管理はブラウザに任せています。`@starting-style` でフェードインし、開いている間は `body:has(:popover-open)` でページのスクロールを止めます。
  - 読了プログレスバーは CSS スクロールタイムライン（`animation-timeline: scroll()`）で動かしています。
  - ヒーローの登場は CSS アニメーション。メッセージ欄は `field-sizing` で入力量に合わせて広がります。
- **アクセシビリティ**: `prefers-reduced-motion` で動きを止めます。キーボードのフォーカスをはっきり表示し、表示中のセクションを `aria-current` で示し、エラー文を各入力欄に関連付けています。
- **型安全な GraphQL**: Gatsby 組み込みの GraphQL Typegen が `Queries.*` 型を生成します。

## はじめかた

必要なもの: Node.js 24

```sh
npm install
cp .env.example .env.development   # 値を入力
npm run develop                    # http://localhost:8000
```

`npm run develop` を実行すると、GraphQL の型ファイル `src/gatsby-types.d.ts` も生成されます。`npm run typecheck` の前に一度は実行してください。

### 環境変数

| 変数名                      | 必須 | 説明                                           |
| --------------------------- | ---- | ---------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN`   | ○    | microCMS のサービス ID（`xxx.microcms.io` の `xxx`） |
| `MICROCMS_API_KEY`          | ○    | microCMS の API キー                           |
| `CONTACT_TO_EMAIL`          | ○    | お問い合わせを受け取るアドレス                 |
| `SMTP_HOST` / `SMTP_PORT`   |      | 既定値は `smtp.gmail.com` / `465`              |
| `SMTP_USER` / `SMTP_PASS`   | ○    | SMTP の認証情報（Gmail ならアプリパスワード）  |
| `RECAPTCHA_SECRET_KEY`      |      | reCAPTCHA v3 のシークレットキー（サーバーで検証） |
| `GATSBY_RECAPTCHA_SITE_KEY` |      | reCAPTCHA v3 のサイトキー（ブラウザに公開）    |

reCAPTCHA を使う場合は 2 つのキーを必ずセットで設定してください。シークレットキーだけだとブラウザからトークンが送られず、すべての送信が拒否されます。

ローカルでは、`gatsby-config.ts` が Node 組み込みの `process.loadEnvFile` で `.env.<NODE_ENV>` を読み込みます。Vercel ではプロジェクト設定で環境変数を登録してください。

### microCMS のスキーマ

リスト形式の API `blogs` を 1 つ使います。

| フィールド  | 種類                                  |
| ----------- | ------------------------------------- |
| `title`     | テキスト                              |
| `content`   | リッチエディタ                        |
| `eyecatch`  | 画像（任意）                          |
| `category`  | `name` を持つコンテンツ参照（任意）   |

## スクリプト

| コマンド            | 内容                                 |
| ------------------- | ------------------------------------ |
| `npm run develop`   | 開発サーバーの起動と型の生成         |
| `npm run build`     | `public/` に本番ビルドを出力         |
| `npm run serve`     | 本番ビルドをローカルで配信           |
| `npm run typecheck` | `tsc --noEmit` で型チェック          |
| `npm run clean`     | `.cache` と `public` を削除          |

## ディレクトリ構成

```text
api/contact.ts            お問い合わせ用の Vercel Function
gatsby-browser.ts         グローバルスタイルとフォント
gatsby-ssr.ts             <html lang> の設定
src/
  components/             Header、Space（地球の canvas）、Contact、PostCover、Seo など
  data/site.ts            サイト情報、スキル、姉妹サイト
  hooks/useReveal.ts      スクロールで表示（IntersectionObserver）
  three/planet.ts         Three.js のシーン（遅延読み込み）
  pages/                  index、404、articles/{MicrocmsBlog.blogId}
  styles/
    global.scss           エントリー（@use のみ）
    abstracts/            mixin とブレークポイント
    base/                 デザイントークン、リセット、モーション
    layout/               ヘッダー、フッター、canvas
    components/           ボタン、フォーム
    sections/             Hero、About、Skills、Blog、Contact
    pages/                記事、404
static/                   earth.webp（地球のテクスチャ）、favicon.svg
```

## デプロイ

Vercel でリポジトリをインポートすると Gatsby として認識され、`api/` 内のファイルは Vercel Functions としてデプロイされます。上記の環境変数を登録してからデプロイしてください。

## 補足

- `package.json` の `overrides` で `sharp` を新しいバージョンに差し替えています。Gatsby の optional 依存 `gatsby-sharp` は今も sharp 0.32 を要求しますが、このバージョンには最近の Node 向けのビルド済みバイナリが無く、ソースからのビルドにも失敗するためです。このサイトでは sharp による画像処理はしていません。
- HTML のビルド中に `ERROR UNKNOWN` と `punycode` の非推奨警告が表示されることがあります。Gatsby の依存パッケージが出しているもので、出力には影響しません。
