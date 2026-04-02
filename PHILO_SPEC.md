# PHILO — 仕様書 v8
**Claude Code移行用 / 2026年4月**

---

## 1. プロダクト概要

| 項目 | 内容 |
|------|------|
| 名称 | PHILO（フィロ） |
| コンセプト | 「あなたの悩みを、2500年前にすでに言語化していた人がいる」 |
| ジャンル | 哲学学習 × Lofi RPG |
| ターゲット | AI時代に自分の軸を作りたい知的探求者（30〜40代） |
| マネタイズ | 広告 + 有料会員（広告非表示） |
| 技術スタック（移行後） | Next.js + TypeScript + Vercel |

---

## 2. デザインシステム

### カラーパレット
```
bg          = "#0f1a1a"   ベース背景
panel       = "#162020"   パネル背景
panelBorder = "#2a4a4a"   ボーダー
teal        = "#3d8080"
tealLight   = "#5aacac"
tealDim     = "#234040"
amber       = "#d4a853"   アクセント・ゴールド
amberDim    = "#7a5a20"
cream       = "#e8dcc8"   本文テキスト
creamDim    = "#9a8870"
red         = "#c05040"   エラー・ダメージ
green       = "#4a8a5a"   正解・成功
text        = "#d0e8e8"
textDim     = "#6a9a9a"
pixel       = "#2a5050"
hp          = "#e05050"
hpBg        = "#3a1010"
```

### フォント
- **UI・ラベル**: `Press Start 2P`（Google Fonts）→ ピクセルRPG感
- **本文・会話・クイズ**: `Noto Serif JP`（Google Fonts）→ 読みやすさ

### 背景テクスチャ（CSSのみ）
```
repeating-linear-gradient(0deg, transparent 3px, rgba(0,0,0,0.12) 4px),
repeating-linear-gradient(90deg, transparent 3px, rgba(0,0,0,0.06) 4px),
#0f1a1a
```

### アニメーション
- `bob` キャラのふわふわ上下 2.5s
- `float-up` パーティクル上昇
- `blink-a` ▼カーソル点滅
- `fadeSlide` フェードイン+スライド
- `pulse-border` ボスバトル枠の点滅

---

## 3. 画面構成・遷移

```
title
  ├─ NEW GAME → buddy → map → story_[id] → deep_[id]
  │                      └───→ boss → ending → title
  └─ CONTINUE → map（保存状態から復元）
```

### 画面一覧

| screen値 | コンポーネント | 説明 |
|----------|--------------|------|
| `"title"` | TitleScreen | タイトル・NEW GAME/CONTINUE |
| `"buddy"` | BuddySelect | バディ選択（3人） |
| `"map"` | MapScreen | 哲学者マップ・進捗表示 |
| `"story_[philId]"` | StoryScreen | 会話→クイズ→結果 |
| `"deep_[philId]"` | DeepTextScreen | 深掘りテキスト（4セクション） |
| `"boss"` | BossScreen | ラスボスバトル（10問） |
| `"ending"` | EndingScreen | エンディング |

---

## 4. 状態管理

### Appレベルのstate
```typescript
screen:   string        // 現在の画面
buddy:    string | null // 選択されたバディID
progress: ProgressMap   // 各哲学者の進捗
hasSave:  boolean       // セーブデータの有無
```

### ProgressMap型
```typescript
type PhilProgress = {
  talked:  boolean  // 会話を最後まで読んだ
  quizzed: boolean  // クイズを完了した
  deep:    boolean  // 深掘りテキストを読了した
}
type ProgressMap = Record<string, PhilProgress>
```

### localStorage
| キー | 内容 |
|------|------|
| `philo_save_v1` | `{ buddy, progress, beaten? }` |
| `philo_bonus` | `{ [philId]: boolean }` 深掘り読了フラグ |

### unlocked（BossScreen互換用・算出値）
```typescript
const unlocked = Object.entries(progress)
  .filter(([, v]) => v.quizzed)
  .map(([k]) => k)
```

---

## 5. 導線ロジック（StoryScreen）

```
startPhase() で再開位置を決定:

  quizzed && deep   → "complete"   コンプリート表示のみ
  quizzed && !deep  → "goto_deep"  深掘りへ誘導（大ボタン）
  talked && !quizzed→ "quiz"       クイズから再開
  それ以外          → "dialogue"   初回・会話から
```

### フェーズ別表示

| phase | 表示内容 |
|-------|---------|
| `dialogue` | キャラ全画面 + 下部テキストウィンドウ（34%）|
| `quiz` | キャラ背景 + 下部クイズウィンドウ（62%）|
| `result` | キャラ背景 + 結果 + 深掘りボタン（未読なら大きく表示）|
| `goto_deep` | 「深掘りへ」大ボタンのみ |
| `complete` | ⭐コンプリート表示のみ |

### 会話画面のUI仕様
- `position: fixed` で1画面に収める（スクロールなし）
- キャラ立ち絵: 画面上70%・`object-fit: contain`・`object-position: center bottom`
- テキストウィンドウ: 下部34%固定・`rgba(5,14,14,0.82)` + `backdrop-filter: blur(10px)`
- NEXTボタン: 常に表示（タイプ中は「SKIP」、終わったら「NEXT ▶」）

### MAPカードのバッジ
| 状態 | バッジ |
|------|-------|
| 未訪問 | なし |
| talked | 📖 |
| quizzed | ✓ |
| quizzed + deep | ⭐ |

---

## 6. データ定義

### バディ（3人）

| id | 名前 | ボスID | 関連する悩み |
|----|------|--------|------------|
| socrates | ソクラテス | doksa | 意味・アイデンティティ・社会・未来 |
| buddha | ブッダ | tanha | 意味・競争・死・自由 |
| laozi | 老子 | wei | 自由・競争・社会・意味 |

### ラスボス（3体）

| id | 名前 | バディ | タイトル |
|----|------|--------|---------|
| doksa | ドクサ | socrates | 無知の暴君 |
| tanha | タンハー | buddha | 執着の魔王 |
| wei | ウェイ | laozi | 支配の亡霊 |

### 哲学者（11人）

| id | 名前 | バディ | unlockFrom | quiz数 |
|----|------|--------|-----------|-------|
| socrates | ソクラテス | socrates | null | 2 |
| plato | プラトン | socrates | socrates | 2 |
| aristotle | アリストテレス | socrates | plato | 2 |
| kant | カント | socrates | aristotle | 2 |
| nietzsche | ニーチェ | socrates, laozi | kant | 2 |
| buddha | ブッダ | buddha | null | 2 |
| nagarjuna | 龍樹 | buddha | buddha | 2 |
| heidegger | ハイデガー | buddha | nagarjuna | 2 |
| laozi | 老子 | laozi | null | 2 |
| zhuangzi | 荘子 | laozi | laozi | 2 |
| confucius | 孔子 | laozi | zhuangzi | 2 |

**ボス解放条件**: バディの哲学者を4人以上クリア（quizzed）

### 深掘りテキスト構造
各哲学者に4セクション:
1. **時代背景** — なぜその思想が生まれたか
2. **核心思想の深掘り** — ダイアログより詳しい解説
3. **現代への接続** — AI時代・競争社会への示唆
4. **キーワード** — 重要概念3つ

対象: socrates, plato, aristotle, buddha, laozi, nietzsche, kant, heidegger, sartre, confucius（10人）

---

## 7. ボスバトル仕様

- **問題数**: 10問
- **問題プール**: quizzed済み哲学者のquizをシャッフル・重複補填
- **HP初期値**: 10 − 読了ボーナス（最大3）
- **ダメージ**: 正解1問 = HP -1
- **勝利条件**: HP = 0
- **敗北条件**: 10問全て答えてHP残り
- **読了ボーナス**: `philo_bonus` の読了数（最大3）を初期HPから減算

---

## 8. イラスト管理

### 現状（v8）
- ソクラテスのみ base64埋め込み（約106KB・800×800px正方形）
- その他: スプライト絵文字で代替

### イラスト仕様
- サイズ: 800×800px以上の正方形
- 画風: モノクロ線画（Yasu作）
- 形式: PNG推奨（透明背景）
- 表示: 画面上70%エリアに `object-fit: contain`

### 移行後ファイル配置
```
/public/illustrations/
  socrates.png   ✅ 完成
  plato.png      未作成
  buddha.png     未作成
  laozi.png      未作成
  aristotle.png  未作成
  kant.png       未作成
  nietzsche.png  未作成
  nagarjuna.png  未作成
  heidegger.png  未作成
  zhuangzi.png   未作成
  confucius.png  未作成
```

---

## 9. 動画背景（移行後に追加予定）

会話画面の背景を動画にする。

```html
<video autoPlay loop muted playsInline
  style={{ position: 'absolute', inset: 0, objectFit: 'cover' }}>
  <source src={`/videos/${p.id}.mp4`} type="video/mp4" />
</video>
```

- 配置: `/public/videos/[philId].mp4`
- 推奨: 縦型 720×1280・5〜15秒ループ・2MB以下
- フォールバック: カラーグラデーション背景

---

## 10. 未実装・TODO

| 項目 | 優先度 | 備考 |
|------|--------|------|
| 残り10人のイラスト | 高 | Yasuが描く |
| 深掘りテキスト（消失） | 高 | 再実装必要・仕様は本書を参照 |
| 動画背景 | 中 | 動画素材が必要 |
| シェア機能 | 中 | 「私は○○と共鳴」カード画像生成 |
| 広告配置 | 低 | 読了後・マップ遷移時 |
| sartre, marx, hume, spinoza追加 | 中 | データはあるが未割当 |

---

## 11. ファイル構成（移行後 Next.js）

```
philo/
├── app/
│   ├── page.tsx
│   └── layout.tsx
├── components/
│   ├── screens/
│   │   ├── TitleScreen.tsx
│   │   ├── BuddySelect.tsx
│   │   ├── MapScreen.tsx
│   │   ├── StoryScreen.tsx
│   │   ├── DeepTextScreen.tsx
│   │   ├── BossScreen.tsx
│   │   └── EndingScreen.tsx
│   └── ui/
│       ├── PixelBox.tsx
│       ├── PixelBtn.tsx
│       ├── HPBar.tsx
│       └── Particles.tsx
├── data/
│   ├── philosophers.ts
│   ├── buddies.ts
│   ├── bosses.ts
│   ├── deepTexts.ts
│   └── constants.ts        // colors, fonts
├── hooks/
│   └── useProgress.ts      // セーブ・ロード
└── public/
    ├── illustrations/
    └── videos/
```

---

## 13. 変更仕様 v1（2026-04-02 承認）

### 13-1. フォント変更
- **本文フォント**: Noto Serif JP → `DotGothic16`（Google Fonts / ドット系日本語フォント）
- Press Start 2P（英語UI・ラベル）は維持
- `layout.tsx` の next/font/google を更新

### 13-2. バディ選択画面にイラスト表示
- バディカード上部に `/public/illustrations/{buddyId}.png` を表示（高さ 140px、object-fit: contain）
- 画像なし時は emoji をフォールバック表示

### 13-3. バディ用イラストファイル命名規則
```
/public/illustrations/
  socrates.png  ✅ 完成
  buddha.png    未作成（Yasuが描く）
  laozi.png     未作成（Yasuが描く）
```
- 推奨: 800×800px以上・PNG透明背景

### 13-4. フォントサイズ全体拡大（PC視認性向上）
| 箇所 | 変更前 | 変更後 |
|------|--------|--------|
| バディ名 | 22px | 30px |
| バディ説明文 | 13px | 16px |
| タグライン | 12px | 15px |
| 画面見出し | 28px | 38px |
| クイズ問題文 | 13px | 17px |
| 会話テキスト | 13px | 17px |

### 13-5. プロローグ画面（新規 `PrologueScreen`）

**遷移**: TitleScreen → PrologueScreen → BuddySelectScreen

**演出**: 1シーンずつテキストをフェードイン表示。クリック or スペースキーで次へ。最終シーンに「冒険を始める」ボタン。

**必要イラスト**:
| ファイル名 | 内容 |
|-----------|------|
| `sakura.png` | 暗い部屋でスマホを見る女性の横顔〜上半身。光源はスマホのみ。モノクロ線画 |
| `monster.png` | 人間シルエットの背後から影が滲み出す抽象的なモンスター。煙・靄のような存在感 |

**シーン内容**:
1. 「深夜2時。東京のどこかのマンション、6畳の部屋。スマートフォンの光だけが、彼女の顔を照らしていた。」
2. 「『また上司に怒鳴られた。』『同期は今年、主任になった。』『昨日、友達の結婚式の帰りに泣いた。理由は、わからなかった。』——彼女・サクラ、27歳——は、自分が何に苦しんでいるのかさえ、もうわからなくなっていた。」
3. 「心の苦しみが積み重なるとき、それはやがてカタチを持つ。執着、比較、恐れ、孤独——暗闇の中で、ゆっくりとモンスターへと変わっていく。」
4. 「サクラだけじゃない。今夜、世界中の誰かが同じように天井を見つめている。そしてその心の奥で、モンスターが目を覚ます。」
5. 「しかし——遥か昔、同じ問いを抱えた者たちがいた。苦しみとは何か。なぜ人は悩むのか。どうすれば、自由になれるのか。彼らはすでに、答えを知っていた。」
6. 「今こそ、その智慧を武器に立ち上がれ。哲学者のバディを選び、モンスターを倒せ。サクラを——救え。」

### 13-6. グローバルナビゲーションバー
- **表示画面**: map / story_* / deep_* / boss のみ（title / prologue / buddy / ending は非表示）
- **固定ヘッダー**: position: fixed, top: 0, height: 48px, z-index: 100
- **左**: `PHILO` ロゴ（Press Start 2P, 10px）
- **中央**: 現在画面名（MAP / STORY / DEEP / BOSS）
- **右**: `[ マップへ ]` ボタン + `[ SAVE ]` ボタン（押下後1秒間「SAVED ✓」表示）
- 各画面のコンテンツは `padding-top: 48px` を確保

---

## 12. Claude Code引き継ぎメモ

1. **philo-v8.jsx** を渡してコンポーネント分割を依頼する
2. **深掘りテキスト** はコード消失のため `data/deepTexts.ts` として再生成させる（本書の構造仕様を参照）
3. **ソクラテスのイラスト** は `/public/illustrations/socrates.png` に配置（base64不要になる）
4. **セーブキー** `philo_save_v1` のデータ構造は変えない（ユーザーデータ互換）
5. **Google Fonts** は Next.js の `next/font/google` に変更する
6. **CSSアニメーション** は `globals.css` に移動する