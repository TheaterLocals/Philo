import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════

const WORRIES = [
  { id: "meaning",     emoji: "🌑", label: "生きる意味が見えない" },
  { id: "competition", emoji: "⚡", label: "競争に疲れた" },
  { id: "identity",    emoji: "🪞", label: "本当の自分がわからない" },
  { id: "society",     emoji: "🌐", label: "社会の常識に違和感がある" },
  { id: "death",       emoji: "🍂", label: "死や喪失が怖い" },
  { id: "freedom",     emoji: "🔓", label: "自由に生きたいのに縛られる" },
  { id: "connection",  emoji: "🫧", label: "人とのつながりが薄い" },
  { id: "future",      emoji: "🌫️", label: "AI時代の未来が不安" },
];

// Map grid: x=0(far west) → x=10(far east), y=era position
// Eras: ancient(-600~-200), hellenistic(-300~0), medieval(400~1300), early-modern(1500~1700), modern(1700~1900), contemporary(1850~now)

const PHILOSOPHERS = [
  // ── ANCIENT EAST ──
  {
    id:"laozi", name:"老子", nameEn:"Laozi", born:"BC 600頃", era:"ancient",
    region:"east", gridX:8.5, gridY:0.5,
    worries:["freedom","competition","society","meaning"],
    icon:"☯️", color:"#6BAF8C",
    tagline:"「流れに従え」と言った謎の賢者",
    unlockFrom:null, influences:["zhuangzi","buddha"],
    quote:"上善は水の如し",
    story:`インドの王族として生まれたシッダールタは——ではなく、老子は中国周王朝の図書館員だったと伝えられます。しかし彼自身が謎の人物で、本当に実在したかも歴史家の間で議論があります。

伝説では、世の乱れを見て西へ去る際、国境の門番に頼まれて書き残したのが『道徳経』5000文字。

その核心は「道（タオ）」——言葉で説明しようとした瞬間、それはもう道ではない。

**「無為自然」——何もしないことが、最善の行動だ。**

川は岩を押しのけず、低いところへ流れることで、やがて岩さえ穿つ。競争社会で「もっと頑張れ」と言われ続けるあなたへ、老子はこう問います。

「あなたは川の流れに逆らって泳いでいませんか？」`,
    nextHint:"老子の「道」の思想は、荘子によってさらに自由で詩的な形に展開されます——"
  },
  {
    id:"confucius", name:"孔子", nameEn:"Confucius", born:"BC 551",  era:"ancient",
    region:"east", gridX:8.0, gridY:0.8,
    worries:["connection","society","identity"],
    icon:"📜", color:"#6BAF8C",
    tagline:"「人と人のつながり」がすべての答えだと言った教育者",
    unlockFrom:null, influences:["mencius","zhuxi"],
    quote:"己の欲せざるところを、人に施すなかれ",
    story:`魯の国で貧しく生まれた孔子は、猛烈な勉強家でした。やがて弟子を集め、生涯をかけて対話し続けた人物。

彼の思想の核心は「仁（じん）」——人への思いやり。

社会のルールより、人間関係の質そのものを重視しました。「礼（れい）」とは形式でなく、相手への敬意の表れ。

14年間も国を追われて放浪した彼が最後まで手放さなかったのは、弟子たちとの対話でした。

**「学びて思わざれば則ち罔し」**

学ぶだけで考えなければ意味がない。考えるだけで学ばなければ危うい。

孤独を感じるAI時代に、孔子はこう言います。「あなたは誰かと、本当に語り合っていますか？」`,
    nextHint:"孔子の思想は孟子によって「人間は本来善い」という方向に発展します——"
  },
  {
    id:"buddha", name:"ブッダ", nameEn:"Buddha", born:"BC 563", era:"ancient",
    region:"east", gridX:6.5, gridY:0.6,
    worries:["meaning","competition","death","freedom"],
    icon:"☸️", color:"#D4A853",
    tagline:"苦しみの原因を、初めて解き明かした人",
    unlockFrom:null, influences:["nagarjuna","zhuangzi"],
    quote:"すべての苦しみは執着から生まれる",
    story:`インドの王族として生まれたシッダールタは、29歳まで宮殿の中で暮らしていました。

城の外で初めて「老い・病・死」を目にした彼は問います——「なぜ人間は苦しまなければならないのか？」

6年の苦行の末、菩提樹の下で悟りを開きます。

**苦しみは「執着」から生まれる。**

もっと欲しい、失いたくない、こうあるべきだ——この執着がすべての苦しみの根っこ。

解脱とは「何も持たないこと」ではなく、「執着しないこと」。川の流れのように、今この瞬間を生きること。

「もっと効率を」「もっと成長を」と追い立てられるあなたへ——

「あなたが苦しんでいるのは、現実そのものではなく、現実への執着かもしれない。」`,
    nextHint:"ブッダの思想はインドで龍樹（ナーガールジュナ）によって深化し、やがて中国へ渡ります——"
  },
  // ── ANCIENT WEST ──
  {
    id:"socrates", name:"ソクラテス", nameEn:"Socrates", born:"BC 470", era:"ancient",
    region:"west", gridX:2.0, gridY:0.9,
    worries:["meaning","identity","society","future"],
    icon:"🏛️", color:"#7BA7BC",
    tagline:"「知らない」と言い続けた、最も危険な哲学者",
    unlockFrom:null, influences:["plato"],
    quote:"無知の知——知らないと知ることが知恵の始まり",
    story:`アテネの広場で、ソクラテスはいつも人々に話しかけていました。政治家も詩人も職人も——誰でもつかまえて問うのです。

「あなたは『善い』とはどういうことか、本当に知っていますか？」

どんな相手も、問いを重ねると答えられなくなる。

**「私は自分が何も知らないことを、知っている。」**

知っているふりをやめること。問い続けること。それが知恵への唯一の道。

その姿勢は権力者には危険に映り、死刑判決を受けます。逃げることもできたのに、彼は毒杯を選びました。

AIが答えを出してくれる時代に、ソクラテスは問います——「その答えを、あなた自身は本当に理解していますか？」`,
    nextHint:"ソクラテスの対話の精神は、弟子プラトンによって壮大な宇宙論へと発展します——"
  },
  {
    id:"plato", name:"プラトン", nameEn:"Plato", born:"BC 428", era:"ancient",
    region:"west", gridX:2.2, gridY:1.3,
    worries:["meaning","identity","society"],
    icon:"💎", color:"#7BA7BC",
    tagline:"「本当の現実」はこの世界の外にあると言った人",
    unlockFrom:"socrates", influences:["aristotle","plotinus","augustine"],
    quote:"私たちは洞窟の中の影を、現実だと思って生きている",
    story:`師ソクラテスの処刑を目撃した28歳の青年プラトンは、その後の人生を師の思想の記録と発展に捧げます。

「イデア論」——目の前にある椅子は、完全な「椅子のイデア（本質）」の影に過ぎない。本当の現実はイデア界にある。

**洞窟の比喩：**人間は洞窟の中で壁に映る影しか見ていない。それが現実だと思っている。しかし鎖を解いて外に出れば、太陽の光の下に本当の世界がある。

哲学とは、洞窟から出る勇気のことだ。

スクリーンに映る情報の「影」を見続ける私たちへ——「あなたは今、洞窟の中にいますか？」`,
    nextHint:"プラトンの弟子アリストテレスは、師の思想をまったく逆の方向から捉え直します——"
  },
  {
    id:"aristotle", name:"アリストテレス", nameEn:"Aristotle", born:"BC 384", era:"ancient",
    region:"west", gridX:2.5, gridY:1.7,
    worries:["meaning","society","future"],
    icon:"🔬", color:"#7BA7BC",
    tagline:"「本当の現実は目の前にある」と言った万能の天才",
    unlockFrom:"plato", influences:["aquinas","avicenna"],
    quote:"幸福とは、自分の最善を尽くして生きることの中にある",
    story:`プラトンの弟子でありながら、アリストテレスは師の考えを真っ向から否定。「イデア界？ そんなものはない。本当の現実は今ここにある。」

植物・動物・政治・詩——ほぼすべての学問の基礎を一人で作った人物。

**エウダイモニア（幸福）**——快楽の最大化ではなく、自分の「徳（アレテー）」を発揮して生きること。

黄金の中庸——勇気は無謀と臆病の中間。あらゆる徳は極端を避けた適切な場所にある。

「完璧な答えより、今ここでよい判断を重ねることが人間らしい生き方だ。」`,
    nextHint:"アリストテレスの著作は中世イスラムで保存され、ヨーロッパへ逆輸入されます——"
  },
  // ── HELLENISTIC ──
  {
    id:"zhuangzi", name:"荘子", nameEn:"Zhuangzi", born:"BC 369", era:"hellenistic",
    region:"east", gridX:8.2, gridY:2.0,
    worries:["freedom","meaning","identity"],
    icon:"🦋", color:"#6BAF8C",
    tagline:"「蝶の夢」で、自由の本質を語った詩人哲学者",
    unlockFrom:"laozi", influences:["zhuxi"],
    quote:"昔、荘周は蝶になった夢を見た——自分が蝶なのか蝶が荘周なのか",
    story:`老子の道家思想を受け継ぎ、さらに自由で詩的な形に展開した荘子。

**蝶の夢：**「昔、荘周は蝶になった夢を見た。目覚めると自分だった。果たして荘周が蝶の夢を見ているのか、蝶が荘周の夢を見ているのか。」

固定した「自分」などない。現実と夢の境界さえ揺らぐ。

**「無用の用」**——役に立たないものにこそ、本当の価値がある。大木は役立たないから切られず、だから大きくなれた。

効率と生産性だけが正義の時代に荘子は問います——「あなたが切り捨てている『無駄』の中に、本当の自分はありませんか？」`,
    nextHint:"荘子の自由な精神はのちに禅仏教と融合し、日本文化の核になっていきます——"
  },
  {
    id:"mencius", name:"孟子", nameEn:"Mencius", born:"BC 372", era:"hellenistic",
    region:"east", gridX:8.0, gridY:2.1,
    worries:["society","identity","connection"],
    icon:"🌱", color:"#6BAF8C",
    tagline:"「人間は本来善い」と言い切った孔子の後継者",
    unlockFrom:"confucius", influences:["zhuxi"],
    quote:"惻隠の心は仁の端なり——思いやりは善の芽生え",
    story:`孔子の思想を受け継ぎ、さらに人間の本性論を展開した孟子。

**性善説**——人間は生まれながらに善い本性を持っている。悪になるのは環境や欲望に流されるからだ。

「惻隠の心」——井戸に落ちそうな子どもを見れば、誰でも思わず助けようとする。これが人間の本来の姿。

王に対して「民が最も貴く、社稷これに次ぎ、君は軽い」と言い放った。権力者への直言を恐れなかった人物。

競争社会で「人間は本来利己的だ」という前提が蔓延する時代に——「あなたの中の善の芽を、踏み潰していませんか？」`,
    nextHint:"儒教の思想はやがて宋代の朱子によって壮大な哲学体系へと統合されます——"
  },
  {
    id:"nagarjuna", name:"龍樹（ナーガールジュナ）", nameEn:"Nagarjuna", born:"AD 150頃", era:"hellenistic",
    region:"east", gridX:6.8, gridY:2.5,
    worries:["meaning","identity","death"],
    icon:"🌀", color:"#D4A853",
    tagline:"「すべては空（くう）だ」と言った仏教哲学の革命家",
    unlockFrom:"buddha", influences:["kumarajiva"],
    quote:"色即是空、空即是色——形あるものは空であり、空こそが形である",
    story:`ブッダの思想をさらに深化させた龍樹（ナーガールジュナ）は、大乗仏教の基礎を作った人物。

**「空（くう）」の哲学：**すべての存在は固定した実体を持たない。椅子も、自分も、社会のルールも——すべては関係性の中で仮に存在しているだけ。

これは「何もない」ということではない。関係性によって成り立っているから、変化できる。固定していないから、自由だ。

**縁起**——すべてはつながりの中で生まれ、変化し、消えていく。

「自分が変われない」と思っているあなたへ——「その『自分』は本当に固定したものですか？」`,
    nextHint:"龍樹の空の思想は鳩摩羅什によって中国に伝えられ、禅宗へとつながります——"
  },
  {
    id:"plotinus", name:"プロティノス", nameEn:"Plotinus", born:"AD 204", era:"hellenistic",
    region:"west", gridX:2.8, gridY:2.8,
    worries:["meaning","identity","death"],
    icon:"✨", color:"#9B8EC4",
    tagline:"「万物は一者から流出する」と言った神秘の哲学者",
    unlockFrom:"plato", influences:["augustine"],
    quote:"美しいものを見るとき、あなたの中の美が目覚めている",
    story:`プラトンの思想をさらに神秘的な方向へ展開したプロティノス。新プラトン主義の創始者。

**「一者（ヘン）」からの流出：**すべての存在は究極の一者から流れ出ている。人間の魂も本来は一者の一部。

哲学の目標は、論理による理解ではなく、一者との合一（エクスタシー）。彼自身、生涯に4回この合一を体験したと弟子が記録している。

物質的な身体を恥じており、「自分が身体を持って生まれたことが恥ずかしい」とさえ言ったとか。

「あなたが美しい夕日を見て胸を打たれる瞬間——それはあなたの中の一者が目覚めているのかもしれない。」`,
    nextHint:"プロティノスの神秘哲学はアウグスティヌスによってキリスト教と融合します——"
  },
  // ── MEDIEVAL ──
  {
    id:"augustine", name:"アウグスティヌス", nameEn:"Augustine", born:"354", era:"medieval",
    region:"west", gridX:2.2, gridY:3.5,
    worries:["meaning","identity","death","freedom"],
    icon:"✝️", color:"#C4956A",
    tagline:"「神よ、あなたのために作られた心は、あなたの中で休むまで安らわない」",
    unlockFrom:"plato", influences:["aquinas"],
    quote:"私たちの心は、あなたの中に宿るまで安らぐことがない",
    story:`若い頃は享楽的な生活を送り、マニ教にも傾倒したアウグスティヌス。33歳でキリスト教に回心し、北アフリカの司教となります。

プラトンの「イデア界」をキリスト教の「神の国」と重ね合わせ、西洋中世哲学の基礎を作りました。

**「原罪」と「恩寵」：**人間は生まれながらに罪を抱えている。しかし神の恩寵によってのみ救われる。自力では限界がある。

自伝『告白』は、世界初の本格的な内省文学。「過去の自分はなんと愚かだったか」と神に語りかける形式。

「あなたがどんなに頑張っても埋まらない空洞——それはもしかしたら、何か大きなものへの渇望かもしれない。」`,
    nextHint:"アウグスティヌスの神学はトマス・アクィナスによってアリストテレルと統合されます——"
  },
  {
    id:"avicenna", name:"イブン・シーナー（アヴィセンナ）", nameEn:"Avicenna", born:"980", era:"medieval",
    region:"east", gridX:5.5, gridY:3.8,
    worries:["identity","meaning","future"],
    icon:"🌙", color:"#B8986A",
    tagline:"アリストテレルを保存し、東西の橋渡しをしたイスラムの天才",
    unlockFrom:"aristotle", influences:["aquinas","zhuxi"],
    quote:"知識は、魂の装飾である",
    story:`ペルシャ生まれのイブン・シーナーは、10歳でコーランを暗記し、18歳で医学を修めた神童。医学・哲学・天文学・音楽——あらゆる分野の百科全書を著しました。

**「浮遊する人間」の思考実験：**もし人間が生まれた瞬間から宙に浮かび、何も感覚できないとしたら？それでも「私は存在する」と気づくはずだ——これは「我思う、ゆえに我あり」の650年前の先取り。

ヨーロッパが暗黒時代の中でギリシャ哲学を忘れかけていた頃、イスラム世界がアリストテレルの著作を保存・発展させ、やがてヨーロッパへ逆輸入した。

「知の伝達は、直線ではなく迂回する。あなたの知識も、誰かが守ってくれたものかもしれない。」`,
    nextHint:"イスラムが保存したアリストテレルはトマス・アクィナスによって神学と統合されます——"
  },
  {
    id:"aquinas", name:"トマス・アクィナス", nameEn:"Thomas Aquinas", born:"1225", era:"medieval",
    region:"west", gridX:2.5, gridY:4.2,
    worries:["meaning","society","future"],
    icon:"⛪", color:"#C4956A",
    tagline:"「理性と信仰は矛盾しない」と言ったスコラ哲学の集大成者",
    unlockFrom:"aristotle", influences:["descartes"],
    quote:"信仰は理性の敵ではなく、理性を超えたものへの道だ",
    story:`ドミニコ会修道士のトマス・アクィナスは、アリストテレルの哲学とキリスト教神学を見事に統合しました。スコラ哲学の頂点。

「神は存在するか？」という問いに対して、彼は5つの論理的な証明を展開します（宇宙論的証明・目的論的証明など）。

**自然法：**神が作った自然の秩序の中に、人間が従うべき法則がある。これは後の人権思想の基礎になります。

「理性で到達できる真理」と「信仰で受け入れる真理」は矛盾しない——これが彼の中心的な主張。

科学とスピリチュアルを対立させたがる現代に、アクィナスはこう言います。「対立させているのは、あなたの狭い枠組みかもしれない。」`,
    nextHint:"スコラ哲学の体系は、デカルトの懐疑によって根本から揺さぶられます——"
  },
  {
    id:"zhuxi", name:"朱子（朱熹）", nameEn:"Zhu Xi", born:"1130", era:"medieval",
    region:"east", gridX:8.5, gridY:4.0,
    worries:["society","meaning","identity"],
    icon:"📚", color:"#6BAF8C",
    tagline:"儒教を宇宙論まで広げた、東アジア最大の哲学体系の構築者",
    unlockFrom:"confucius", influences:["yangming"],
    quote:"格物致知——ものの本質を究めることで、知に至る",
    story:`孔子・孟子の儒教を宋代に集大成した朱子（朱熹）。儒教を単なる社会倫理から、宇宙の理を説く壮大な哲学へと変えました。

**「理（り）と気（き）」：**万物は「理（本質・法則）」と「気（エネルギー・素材）」から成り立つ。人間も同じ。

**「敬（けい）」の実践：**常に心を引き締め、誠実でいること。これが修養の基本。

その哲学体系は日本・朝鮮・ベトナムにも広がり、東アジアの精神文化の骨格を形成しました。江戸時代の日本では「朱子学」が武士道の哲学的基盤になります。

「宇宙の理と自分の理は同じもの——あなたが誠実であることは、宇宙の秩序に参加することだ。」`,
    nextHint:"朱子の「理」を重視する学問は、王陽明によって「心」の哲学へと反転します——"
  },
  // ── EARLY MODERN ──
  {
    id:"yangming", name:"王陽明", nameEn:"Wang Yangming", born:"1472", era:"early-modern",
    region:"east", gridX:8.3, gridY:5.0,
    worries:["identity","meaning","freedom"],
    icon:"💡", color:"#6BAF8C",
    tagline:"「知ることと行動することは一つだ」と言った実践の哲学者",
    unlockFrom:"zhuxi", influences:["nishida"],
    quote:"知行合一——知ることと行うことは本来ひとつである",
    story:`朱子学の「外の理を学べ」という教えに疑問を持った王陽明。若い頃、朱子の教えに従って竹を7日間じっと観察し続け、悟りを得ようとしましたが、得られたのは病気だけでした。

**「心即理（しんそくり）」：**理（真理）は外の世界にあるのではなく、自分の心の中にある。

**「知行合一（ちこうごういつ）」：**本当に「知っている」とは、それを実行しているということ。知っていて行動しないなら、まだ本当には知っていない。

「善を知って行わないのは、まだ善を知っていないのと同じだ。」

「やるべきことはわかっているのに、できない」——そんな悩みを持つ人へ、王陽明は言います。「あなたはまだ、本当の意味では知っていないのかもしれない。」`,
    nextHint:"王陽明の実践哲学は明治の日本知識人に影響を与え、近代日本思想の一翼を担います——"
  },
  {
    id:"descartes", name:"デカルト", nameEn:"Descartes", born:"1596", era:"early-modern",
    region:"west", gridX:1.8, gridY:5.0,
    worries:["identity","meaning","future"],
    icon:"🔍", color:"#9B8EC4",
    tagline:"「我思う、ゆえに我あり」——すべてを疑った哲学の父",
    unlockFrom:"aquinas", influences:["spinoza","kant"],
    quote:"我思う、ゆえに我あり",
    story:`フランスの数学者・哲学者デカルトは、徹底的な懐疑から始めます。

感覚は騙されることがある。夢と現実の区別もつかないかもしれない。神さえも、私を騙す悪魔かもしれない——。

**しかし、どんなに疑っても、「今疑っている私」の存在だけは疑えない。**

「我思う、ゆえに我あり（Cogito ergo sum）」

これが哲学の出発点になりました。「主体としての個人」の誕生です。

**心身二元論：**「考える心」と「広がりを持つ物体」は、まったく別のものだ——この分離が後の西洋哲学と科学の基礎になります。

「あなたが信じていることを、一度すべて疑ってみてください。それでも残るものが、あなたの本当の基盤です。」`,
    nextHint:"デカルトの「心と物の分離」は、スピノザによって「すべては一つ」へと反転します——"
  },
  {
    id:"spinoza", name:"スピノザ", nameEn:"Spinoza", born:"1632", era:"early-modern",
    region:"west", gridX:2.0, gridY:5.4,
    worries:["meaning","freedom","connection","death"],
    icon:"🌊", color:"#9B8EC4",
    tagline:"「神即自然」——神と宇宙は同じものだと言った異端の哲学者",
    unlockFrom:"descartes", influences:["kant","hegel"],
    quote:"自由とは、自分の本性の必然性から行動することだ",
    story:`ユダヤ教のコミュニティから破門されたスピノザは、レンズ磨きをしながら独自の哲学を構築しました。

**「神即自然（Deus sive Natura）」：**神と自然は別々の存在ではない。神こそが自然であり、自然こそが神だ。

デカルトが「心と物は別」と言ったのに対し、スピノザは「すべては一つの実体（神・自然）の異なる表れ方だ」と言います。

**感情の哲学：**喜びは自分の力が増すこと。悲しみは力が減ること。より多くの喜びを持つことが、自由な生き方。

「自由とは、何でも好き勝手できることではない。自分の本性に従って生きること——それが本当の自由だ。」

「生きる意味がわからない」あなたへ——スピノザは言います。「あなたはすでに宇宙の一部として、必然的にここにいる。」`,
    nextHint:"スピノザの「全体は一つ」という発想はヘーゲルの弁証法へとつながります——"
  },
  // ── MODERN ──
  {
    id:"hume", name:"ヒューム", nameEn:"Hume", born:"1711", era:"modern",
    region:"west", gridX:1.5, gridY:6.0,
    worries:["identity","meaning","future"],
    icon:"🌊", color:"#7BA7BC",
    tagline:"「自己などない、感覚の束があるだけだ」と言った懐疑論者",
    unlockFrom:"descartes", influences:["kant"],
    quote:"理性は感情の奴隷であり、そうあるべきだ",
    story:`スコットランドの哲学者ヒュームは、デカルトの「確実な自己」を根底から疑います。

**「自己とは何か？」を探して内側を見つめると——**感覚、感情、記憶が流れているだけで、それを統合する「自己」は見当たらない。

「自己とは感覚の束に過ぎない。」これはブッダの「無我」と驚くほど近い。

**因果関係への懐疑：**「AのあとにBが起きた」という観察が何度あっても、「AがBを引き起こす」とは論理的に言えない。私たちが信じている「原因と結果」は、習慣的な思い込みかもしれない。

「理性は感情の奴隷だ」——私たちは感情で動いてから、後から理性で正当化しているだけかもしれない。

「あなたが『論理的に正しい』と思っていることは、実は感情の正当化では？」`,
    nextHint:"ヒュームの懐疑論はカントを「独断のまどろみから目覚めさせ」ます——"
  },
  {
    id:"kant", name:"カント", nameEn:"Kant", born:"1724", era:"modern",
    region:"west", gridX:2.2, gridY:6.3,
    worries:["society","future","identity","meaning"],
    icon:"⚖️", color:"#9B8EC4",
    tagline:"「人間の認識が世界を作っている」と言った哲学の革命家",
    unlockFrom:"descartes", influences:["hegel","schopenhauer","nietzsche"],
    quote:"自分の理性を使う勇気を持て——これが啓蒙の標語だ",
    story:`ドイツのケーニヒスベルクで生まれ、生涯その街を離れなかったカント。毎日同じ時間に散歩し、近所の人が時計代わりにするほど規則正しい生活。

しかしその頭の中では哲学史上最大の革命が起きていました。

**コペルニクス的転回：**「世界が中心で、人間がその周りを回る」のではなく「人間の認識が中心で、世界がそれに合わせて現れる」。

太陽は「黄色い丸」として見える。しかしそれは私たちの認識が作り出したものであり、「物自体」には永遠にアクセスできない。

**定言命法（道徳法則）：**「もしすべての人がそれをしたら、世界はどうなるか？」——これが道徳判断の基準。

AIが「現実」を提示してくれる時代に——「あなたが見ている世界は、誰の認識フィルターで作られていますか？」`,
    nextHint:"カントの思想はヘーゲルによって歴史と時間の中に解き放たれます——"
  },
  {
    id:"schopenhauer", name:"ショーペンハウアー", nameEn:"Schopenhauer", born:"1788", era:"modern",
    region:"west", gridX:2.8, gridY:6.5,
    worries:["meaning","competition","death","freedom"],
    icon:"🌑", color:"#9B8EC4",
    tagline:"西洋で初めてインド哲学と出会い、「意志の哲学」を生んだ悲観論者",
    unlockFrom:"kant", influences:["nietzsche","nishida"],
    quote:"人生は苦しみと退屈の間を振り子のように揺れる",
    story:`カントの弟子でありながら、まったく異なる結論に至ったショーペンハウアー。そしてインドの「ウパニシャッド」を読んで衝撃を受けた最初の西洋哲学者。

**「意志（Wille）」：**世界の本質は「盲目的な意志」——目的もなく、ただ存在し続けようとする衝動。人間もその一部に過ぎない。

人生は欲望（苦しみ）→満足（退屈）→欲望の繰り返し。根本的な幸福などない。

**救済の道：**芸術（特に音楽）による一時的な意志からの解放。そして仏教的な「意志の否定」による解脱。

「悲観論者」と呼ばれましたが、彼は同時に最もリアリストだったかもしれない。苦しみを直視した上で、それでも美しいものを愛でることを教えてくれます。

「あなたの苦しみは、あなただけのものではない。それは人間存在の本質かもしれない。」`,
    nextHint:"ショーペンハウアーの影響を受けたニーチェは、まったく逆の結論——肯定へと向かいます——"
  },
  {
    id:"hegel", name:"ヘーゲル", nameEn:"Hegel", born:"1770", era:"modern",
    region:"west", gridX:2.0, gridY:6.7,
    worries:["meaning","society","future"],
    icon:"🌀", color:"#9B8EC4",
    tagline:"「歴史は精神の自己実現だ」と言った弁証法の哲学者",
    unlockFrom:"kant", influences:["marx","nietzsche"],
    quote:"理性的なものは現実的であり、現実的なものは理性的である",
    story:`カントの哲学を引き継ぎ、さらに壮大なスケールへ発展させたヘーゲル。

**弁証法：**「テーゼ（主張）→アンチテーゼ（反論）→ジンテーゼ（統合）」というプロセスで、思想も歴史も進歩する。

歴史は「絶対精神（世界精神）」が自己を実現していくプロセス。ナポレオンを見て「世界精神が馬に乗っている」と言ったとか。

**「否定の力」：**物事は否定されることで初めて発展する。矛盾や対立は解消すべき問題ではなく、より高い統合へのステップ。

AI時代の変化の激しさに不安を感じる人へ——「矛盾と対立の中にこそ、次のステージへのヒントがある。」`,
    nextHint:"ヘーゲルの「精神」をマルクスは「物質と経済」に置き換えます——"
  },
  {
    id:"marx", name:"マルクス", nameEn:"Marx", born:"1818", era:"modern",
    region:"west", gridX:2.3, gridY:7.0,
    worries:["competition","society","freedom","meaning"],
    icon:"⚙️", color:"#E07070",
    tagline:"「哲学者は世界を解釈するだけでなく、変革しなければならない」",
    unlockFrom:"hegel", influences:["nietzsche"],
    quote:"これまでの哲学者は世界を解釈してきたに過ぎない。重要なのは世界を変えることだ",
    story:`ヘーゲルの弟子でありながら、師の考えを根底からひっくり返したマルクス。

「ヘーゲルは頭で立っている。私はそれを足で立たせる。」

**唯物論：**歴史を動かすのは「精神」ではなく「物質的な生産関係」——誰が生産手段を持ち、誰がその恩恵を受けるか。

**疎外：**工場で働く労働者は、自分が作ったものと自分の創造性から切り離される（疎外）。競争社会で「歯車」と感じるのは、このせいかもしれない。

「宗教は民衆のアヘンだ」——現実の苦しみから目を背けさせる幻想。

競争に疲れた人へ——マルクスは問います。「あなたの疲れは個人の問題ですか？それとも構造的な問題ですか？」`,
    nextHint:"マルクスの問いはニーチェと並んで、近代哲学が行き着く限界点を示します——"
  },
  {
    id:"nietzsche", name:"ニーチェ", nameEn:"Nietzsche", born:"1844", era:"modern",
    region:"west", gridX:2.7, gridY:7.3,
    worries:["meaning","competition","freedom","future"],
    icon:"⚡", color:"#9B8EC4",
    tagline:"「神は死んだ」と叫び、新しい価値を作れと命じた哲学者",
    unlockFrom:"schopenhauer", influences:["heidegger","nishida"],
    quote:"自分自身になれ——あなたはまだ、あなた自身でいたことがないのだから",
    story:`牧師の家に生まれ、24歳でバーゼル大学教授になった天才ニーチェ。しかし哲学の世界では、誰もが「危険人物」と見なした。

**「神は死んだ。そして我々が殺したのだ。」**

科学と理性によって人々は神への信仰を失った。しかしそれは同時に、価値の根拠を失ったこと。

では神なき世界で、何を信じるか？

**「超人」と「力への意志」：**他者の価値観に従って生きる「家畜の道徳」を捨て、自分自身の価値を創造する存在へ。

**永劫回帰：**もし今の人生がまったく同じ形で永遠に繰り返されるとしたら、あなたはそれを望めますか？

望めるなら、あなたは本当に自分の人生を生きている。

「誰かに答えを委ねた瞬間、あなたは超人をやめた。」`,
    nextHint:"ニーチェの問いはハイデガーの「存在の問い」へと受け継がれます——"
  },
  // ── CONTEMPORARY ──
  {
    id:"kumarajiva", name:"鳩摩羅什", nameEn:"Kumarajiva", born:"344", era:"medieval",
    region:"east", gridX:7.2, gridY:3.2,
    worries:["meaning","connection","society"],
    icon:"📿", color:"#D4A853",
    tagline:"インドの仏教を中国語に翻訳し、東アジア仏教の礎を作った人",
    unlockFrom:"nagarjuna", influences:["zhuxi"],
    quote:"言葉は月を指す指——指ではなく、月を見よ",
    story:`亀茲国（現在の中国新疆）生まれの鳩摩羅什は、7歳で出家し、インド各地で仏教を学びました。

後秦の皇帝に請われて長安に来て、3000人の弟子とともに仏典の漢訳プロジェクトに生涯をかけます。

『般若心経』『法華経』『阿弥陀経』——これらの名訳が東アジアの仏教の言語と形を作りました。

**翻訳とは文化の架け橋：**彼がなければ、インドの深い思想が中国・日本・朝鮮に伝わることはなかった。

「言葉は月を指す指に過ぎない。指を見るのではなく、月を見よ。」

知識を積み上げることに夢中になっているあなたへ——「あなたは指を見ていますか？それとも月を見ていますか？」`,
    nextHint:"鳩摩羅什によって伝えられた仏教思想はやがて禅宗として独自の発展を遂げます——"
  },
  {
    id:"heidegger", name:"ハイデガー", nameEn:"Heidegger", born:"1889", era:"contemporary",
    region:"west", gridX:2.5, gridY:8.0,
    worries:["meaning","death","identity","future"],
    icon:"🌲", color:"#8FB87A",
    tagline:"「存在とは何か」を2500年ぶりに問い直した哲学者",
    unlockFrom:"nietzsche", influences:["nishida"],
    quote:"言語は存在の家である",
    story:`ニーチェ以後、哲学は「存在とは何か」という根本問題を忘れていた、とハイデガーは言います。

**「現存在（ダーザイン）」：**人間は「世界の中に投げ込まれた存在」。私たちは意味を自分で作るのではなく、すでに意味のある世界の中に生まれてくる。

**死への先駆け：**自分の死を真剣に考えることで初めて、今ここの生が本物になる。「いつかは死ぬ」を忘れるから、本当に生きることができない。

**「道具性」：**ハンマーを使っているとき、私たちはハンマーを意識しない。それが「壊れて」初めて存在に気づく。スムーズにいっている時は「存在」が隠れている。

禅の鈴木大拙と文通し、「存在の問い」が禅の公案と通底することに気づいた。

「いつか死ぬとわかっていながら、今日あなたは本当に生きましたか？」`,
    nextHint:"ハイデガーの問いはサルトルの実存主義として大衆に広がります——"
  },
  {
    id:"nishida", name:"西田幾多郎", nameEn:"Nishida Kitaro", born:"1870", era:"contemporary",
    region:"east", gridX:7.8, gridY:8.2,
    worries:["identity","meaning","connection","freedom"],
    icon:"⛩️", color:"#6BAF8C",
    tagline:"東洋思想と西洋哲学を統合した、日本初の独自哲学者",
    unlockFrom:"yangming", influences:[],
    quote:"純粋経験——主客未分の直接の経験こそ、すべての根本だ",
    story:`石川県生まれの西田幾多郎は、禅の修行を続けながら西洋哲学を研究し、日本で初めて独自の哲学体系を作り上げました。

**「純粋経験」：**「私が花を見ている」という経験の前に、見る主体（私）と見られる対象（花）に分かれていない、分割以前の直接経験がある。これが哲学の出発点だ。

西洋哲学は「主語—述語」の文法構造の中で考える。しかし東洋の言語と思想には「述語的なもの」が先にある——という西田の洞察は、哲学の文法そのものへの問いかけです。

**「場所の論理」：**すべての存在は「場所」の中で成立する。自己も、固定した実体ではなく「絶対矛盾的自己同一」として、矛盾を含みながら存在する。

「あなたが『自分』と『他者』を分ける前の瞬間——そこに本当の経験がある。」`,
    nextHint:"西田哲学は京都学派として発展し、東西哲学対話の拠点となります——"
  },
  {
    id:"sartre", name:"サルトル", nameEn:"Sartre", born:"1905", era:"contemporary",
    region:"west", gridX:2.2, gridY:8.5,
    worries:["meaning","freedom","identity","future"],
    icon:"🗽", color:"#8FB87A",
    tagline:"「存在は本質に先立つ」——自由の重さを教えた実存主義の旗手",
    unlockFrom:"heidegger", influences:[],
    quote:"人間は自由の刑に処せられている",
    story:`第二次世界大戦後のパリで、サルトルの実存主義は爆発的に広がりました。

**「存在は本質に先立つ」：**椅子は「座るもの」という本質が先にあって作られる。しかし人間は、生まれた後に自分で自分の本質を作っていく。

神はいない。あらかじめ決められた人間の「目的」もない。だから——

**「人間は自由の刑に処せられている。」**

選ばないことも、選択だ。逃げることも、逃げることを選んだことだ。完全な自由は、完全な責任を意味する。

**「他者は地獄だ」：**他者の眼差しによって、私は「物」として固定される。自由な主体から、他者に見られる「客体」になる。

「何のために生きればいいかわからない」人へ——サルトルは言います。「それはあなたが、自分で決めていいということだ。重いけれど。」`,
    nextHint:"サルトルと同時代に、東西哲学の対話が本格的に始まります——"
  },
];

const WORRY_TO_PHILOSOPHERS = {
  meaning:     ["buddha","socrates","nietzsche","laozi","plotinus","sartre","schopenhauer"],
  competition: ["buddha","laozi","marx","nietzsche","mencius"],
  identity:    ["socrates","plato","confucius","kant","yangming","hume","nishida","sartre"],
  society:     ["socrates","aristotle","laozi","confucius","kant","aquinas","marx","zhuxi"],
  death:       ["buddha","augustine","nagarjuna","heidegger","schopenhauer"],
  freedom:     ["laozi","nietzsche","buddha","spinoza","yangming","sartre","marx"],
  connection:  ["confucius","mencius","spinoza","kumarajiva","nishida"],
  future:      ["socrates","aristotle","kant","nietzsche","heidegger","sartre","avicenna"],
};

// Era definitions for the timeline
const ERAS = [
  { id:"ancient",      label:"古代",       sublabel:"BC 600〜BC 200",  color:"#D4A853", y:0 },
  { id:"hellenistic",  label:"ヘレニズム", sublabel:"BC 300〜AD 300",  color:"#B8986A", y:1 },
  { id:"medieval",     label:"中世",       sublabel:"AD 300〜1400",    color:"#C4956A", y:2 },
  { id:"early-modern", label:"近世",       sublabel:"1400〜1700",      color:"#9B8EC4", y:3 },
  { id:"modern",       label:"近代",       sublabel:"1700〜1900",      color:"#7BA7BC", y:4 },
  { id:"contemporary", label:"現代",       sublabel:"1850〜現在",      color:"#8FB87A", y:5 },
];

const ERA_ORDER = ERAS.map(e => e.id);
const eraIndex = (id) => ERA_ORDER.indexOf(id);

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════

function getPhil(id) { return PHILOSOPHERS.find(p => p.id === id); }

// ═══════════════════════════════════════════════════════════════
// STAR FIELD
// ═══════════════════════════════════════════════════════════════

const STARS = Array.from({length:80}, (_,i) => ({
  id:i, x:Math.random()*100, y:Math.random()*100,
  size:Math.random()*1.8+0.4, opacity:Math.random()*0.4+0.1,
  delay:Math.random()*5,
}));

function StarField() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
      {STARS.map(s => (
        <div key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size, borderRadius:"50%",
          background:"#fff", opacity:s.opacity,
          animation:`twinkle ${2+s.delay}s ease-in-out infinite alternate`,
        }}/>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TITLE SCREEN
// ═══════════════════════════════════════════════════════════════

function TitleScreen({onStart}) {
  const [v, setV] = useState(false);
  useEffect(()=>{ setTimeout(()=>setV(true),100); },[]);
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#070710 0%,#0c1020 50%,#0f1828 100%)",
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",textAlign:"center",padding:"40px 20px",
      fontFamily:"'Hiragino Mincho ProN','Yu Mincho',Georgia,serif",
      position:"relative",overflow:"hidden",color:"#e8e0d0",
    }}>
      <StarField/>
      {/* Radial glow */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        width:600,height:600,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(212,168,83,0.06) 0%,transparent 70%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"relative",zIndex:1,
        opacity:v?1:0,transform:v?"translateY(0)":"translateY(40px)",
        transition:"all 1.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{fontSize:12,letterSpacing:10,color:"#6a5a3a",marginBottom:40,textTransform:"uppercase"}}>
          Philosophy Journey
        </div>
        <h1 style={{
          fontSize:"clamp(72px,16vw,128px)",fontWeight:200,letterSpacing:20,
          margin:"0 0 8px",lineHeight:1,
          background:"linear-gradient(135deg,#a87830 0%,#d4a853 40%,#f0d890 60%,#d4a853 100%)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        }}>PHILO</h1>
        <div style={{fontSize:20,color:"#8a7050",marginBottom:40,letterSpacing:6,fontWeight:300}}>フィロ</div>
        <div style={{
          fontSize:"clamp(15px,3vw,20px)",color:"#c8b898",
          marginBottom:12,lineHeight:2,maxWidth:500,
        }}>
          あなたの悩みを、<br/>2500年前にすでに言語化していた人がいる。
        </div>
        <div style={{fontSize:13,color:"#5a4a30",marginBottom:64,lineHeight:1.8}}>
          東洋と西洋、2500年の哲学の旅へ
        </div>
        <button onClick={onStart} style={{
          background:"transparent",border:"1px solid rgba(212,168,83,0.5)",
          color:"#d4a853",padding:"18px 56px",fontSize:16,letterSpacing:6,
          cursor:"pointer",fontFamily:"inherit",
          transition:"all 0.4s ease",borderRadius:2,
        }}
        onMouseEnter={e=>{e.target.style.background="rgba(212,168,83,0.12)";e.target.style.borderColor="#d4a853";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.borderColor="rgba(212,168,83,0.5)";}}>
          旅を始める
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORRY SCREEN
// ═══════════════════════════════════════════════════════════════

function WorryScreen({onSelect}) {
  const [sel, setSel] = useState(null);
  const [v, setV] = useState(false);
  useEffect(()=>{ setTimeout(()=>setV(true),80); },[]);
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#070710 0%,#0c1020 50%,#0f1828 100%)",
      fontFamily:"'Hiragino Mincho ProN','Yu Mincho',Georgia,serif",
      color:"#e8e0d0",position:"relative",
    }}>
      <StarField/>
      <div style={{maxWidth:740,margin:"0 auto",padding:"64px 24px 100px",position:"relative",zIndex:1}}>
        <div style={{
          opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",
          transition:"all 0.9s ease",
        }}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <div style={{fontSize:11,letterSpacing:8,color:"#6a5a3a",marginBottom:24,textTransform:"uppercase"}}>
              Chapter I — 診断
            </div>
            <h2 style={{fontSize:"clamp(22px,5vw,36px)",fontWeight:300,margin:"0 0 20px",lineHeight:1.5,color:"#e0d0b0"}}>
              最近、こんなことで<br/>悩んでいませんか？
            </h2>
            <p style={{fontSize:14,color:"#6a5a40",lineHeight:1.9}}>
              一番近いものを選んでください。正解はありません。
            </p>
          </div>
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
            gap:14,
          }}>
            {WORRIES.map((w,i) => (
              <button key={w.id} onClick={()=>setSel(w.id)} style={{
                background:sel===w.id?"rgba(212,168,83,0.12)":"rgba(255,255,255,0.025)",
                border:sel===w.id?"1px solid rgba(212,168,83,0.5)":"1px solid rgba(255,255,255,0.07)",
                borderRadius:10,padding:"22px 26px",textAlign:"left",cursor:"pointer",
                fontFamily:"inherit",color:"#e8d5b0",transition:"all 0.3s ease",
                opacity:v?1:0,transform:v?"translateY(0)":"translateY(16px)",
                transitionDelay:`${0.08+i*0.04}s`,
                boxShadow:sel===w.id?"0 0 24px rgba(212,168,83,0.1)":"none",
              }}
              onMouseEnter={e=>{if(sel!==w.id){e.currentTarget.style.background="rgba(255,255,255,0.045)";e.currentTarget.style.borderColor="rgba(255,255,255,0.14)";}}}
              onMouseLeave={e=>{if(sel!==w.id){e.currentTarget.style.background="rgba(255,255,255,0.025)";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}}
              >
                <span style={{fontSize:26,marginRight:14}}>{w.emoji}</span>
                <span style={{fontSize:16}}>{w.label}</span>
              </button>
            ))}
          </div>
          {sel && (
            <div style={{textAlign:"center",marginTop:48,
              opacity:1,animation:"fadeIn 0.5s ease"}}>
              <button onClick={()=>onSelect(sel)} style={{
                background:"linear-gradient(135deg,#c4983a,#d4a853)",
                border:"none",color:"#0a0810",padding:"18px 60px",
                fontSize:17,letterSpacing:4,cursor:"pointer",
                fontFamily:"inherit",borderRadius:3,fontWeight:500,
                boxShadow:"0 8px 32px rgba(212,168,83,0.25)",
                transition:"all 0.3s ease",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(212,168,83,0.35)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 32px rgba(212,168,83,0.25)";}}>
                世界地図を開く →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WORLD MAP SCREEN  ← THE BIG UPGRADE
// ═══════════════════════════════════════════════════════════════

const MAP_W = 1100;
const MAP_H = 860;
const ERA_H = MAP_H / ERAS.length;
const WEST_X = MAP_W * 0.22;
const EAST_X = MAP_W * 0.78;

function philPos(p) {
  const eraIdx = eraIndex(p.era);
  const baseY = eraIdx * ERA_H + ERA_H * 0.5;
  const jitterY = (p.gridY % 1 - 0.5) * ERA_H * 0.7;
  const baseX = p.region === "west" ? WEST_X : EAST_X;
  const jitterX = (p.gridX % 1 - 0.5) * 120;
  return { x: baseX + jitterX, y: baseY + jitterY };
}

function WorldMapScreen({worry, unlocked, onSelectPhilosopher, onBack}) {
  const [hoverId, setHoverId] = useState(null);
  const [v, setV] = useState(false);
  const svgRef = useRef(null);
  useEffect(()=>{ setTimeout(()=>setV(true),80); },[]);

  const highlighted = WORRY_TO_PHILOSOPHERS[worry] || [];
  const isAccessible = (p) => !p.unlockFrom || unlocked.includes(p.unlockFrom);
  const isCompleted  = (p) => unlocked.includes(p.id);

  const worryLabel = WORRIES.find(w=>w.id===worry)?.label || "";

  // Build influence lines (only between accessible ones or completed ones)
  const lines = [];
  PHILOSOPHERS.forEach(p => {
    const pos1 = philPos(p);
    p.influences.forEach(tid => {
      const t = getPhil(tid);
      if (!t) return;
      const pos2 = philPos(t);
      const bothKnown = isCompleted(p) || isCompleted(t);
      lines.push({ key:`${p.id}-${tid}`, x1:pos1.x, y1:pos1.y, x2:pos2.x, y2:pos2.y, known:bothKnown });
    });
  });

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#070710 0%,#0b0f1e 60%,#0f1828 100%)",
      fontFamily:"'Hiragino Mincho ProN','Yu Mincho',Georgia,serif",
      color:"#e8e0d0",position:"relative",overflowX:"hidden",
    }}>
      <StarField/>
      <div style={{position:"relative",zIndex:1,padding:"32px 20px 80px"}}>

        {/* Header */}
        <div style={{
          maxWidth:1200,margin:"0 auto",
          display:"flex",alignItems:"center",gap:16,marginBottom:28,
          opacity:v?1:0,transition:"opacity 0.8s ease",
        }}>
          <button onClick={onBack} style={{
            background:"transparent",border:"1px solid rgba(255,255,255,0.1)",
            color:"#8a7050",padding:"8px 18px",cursor:"pointer",
            fontFamily:"inherit",fontSize:13,borderRadius:4,flexShrink:0,
          }}>← 戻る</button>
          <div>
            <div style={{fontSize:11,letterSpacing:6,color:"#6a5a3a",textTransform:"uppercase"}}>Chapter II — 世界地図</div>
            <div style={{fontSize:15,color:"#d4a853",marginTop:4}}>
              「{worryLabel}」への 哲学者たちの答え
            </div>
          </div>
          <div style={{marginLeft:"auto",fontSize:13,color:"#6a5a3a"}}>
            {unlocked.length} / {PHILOSOPHERS.length} 人解放
          </div>
        </div>

        {/* Map container */}
        <div style={{
          maxWidth:1200,margin:"0 auto",
          opacity:v?1:0,transform:v?"translateY(0)":"translateY(20px)",
          transition:"all 1s ease 0.2s",
        }}>
          {/* Column headers */}
          <div style={{
            display:"flex",justifyContent:"space-between",
            padding:"0 40px",marginBottom:8,
          }}>
            <div style={{fontSize:13,letterSpacing:6,color:"#7BA7BC",opacity:0.7}}>🏛 WEST 西洋哲学</div>
            <div style={{fontSize:13,letterSpacing:2,color:"#8a7050",opacity:0.5}}>── 影響の流れ ──</div>
            <div style={{fontSize:13,letterSpacing:6,color:"#6BAF8C",opacity:0.7,textAlign:"right"}}>EAST 東洋哲学 ☯</div>
          </div>

          {/* SVG Map */}
          <div style={{
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:16,overflow:"hidden",
            background:"rgba(5,5,15,0.6)",
            position:"relative",
          }}>
            <svg
              ref={svgRef}
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              style={{width:"100%",height:"auto",display:"block"}}
            >
              <defs>
                <marker id="arrow" markerWidth="6" markerHeight="6"
                  refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(255,255,255,0.15)"/>
                </marker>
                <marker id="arrow-gold" markerWidth="6" markerHeight="6"
                  refX="5" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="rgba(212,168,83,0.6)"/>
                </marker>
                {/* Fog gradient for locked eras */}
                <radialGradient id="glowW" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#7BA7BC" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#7BA7BC" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="glowE" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6BAF8C" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#6BAF8C" stopOpacity="0"/>
                </radialGradient>
              </defs>

              {/* Era bands */}
              {ERAS.map((era,i) => (
                <g key={era.id}>
                  <rect
                    x={0} y={i*ERA_H} width={MAP_W} height={ERA_H}
                    fill={i%2===0?"rgba(255,255,255,0.012)":"rgba(0,0,0,0.12)"}
                  />
                  {/* Era label left */}
                  <text x={14} y={i*ERA_H+22} fontSize={10}
                    fill={era.color} opacity={0.7} fontFamily="serif" letterSpacing={2}>
                    {era.label}
                  </text>
                  <text x={14} y={i*ERA_H+36} fontSize={8}
                    fill={era.color} opacity={0.4} fontFamily="serif">
                    {era.sublabel}
                  </text>
                  {/* Era label right */}
                  <text x={MAP_W-14} y={i*ERA_H+22} fontSize={10}
                    fill={era.color} opacity={0.7} fontFamily="serif"
                    textAnchor="end" letterSpacing={2}>
                    {era.label}
                  </text>
                  {/* Separator line */}
                  {i>0 && (
                    <line x1={0} y1={i*ERA_H} x2={MAP_W} y2={i*ERA_H}
                      stroke="rgba(255,255,255,0.05)" strokeWidth={1}
                      strokeDasharray="4 8"/>
                  )}
                </g>
              ))}

              {/* Center divider */}
              <line x1={MAP_W/2} y1={0} x2={MAP_W/2} y2={MAP_H}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="2 12"/>

              {/* Influence lines */}
              {lines.map(l => {
                const isHoverLine = hoverId && (
                  PHILOSOPHERS.find(p=>p.id===hoverId)?.influences.includes(l.key.split("-")[1]) ||
                  l.key.startsWith(hoverId+"-") || l.key.endsWith("-"+hoverId)
                );
                return (
                  <line key={l.key}
                    x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke={l.known?"rgba(212,168,83,0.35)":"rgba(255,255,255,0.08)"}
                    strokeWidth={l.known?1.5:1}
                    strokeDasharray={l.known?"none":"4 6"}
                    markerEnd={l.known?"url(#arrow-gold)":"url(#arrow)"}
                    opacity={hoverId ? (isHoverLine?1:0.2) : 1}
                    style={{transition:"opacity 0.2s ease"}}
                  />
                );
              })}

              {/* Philosopher nodes */}
              {PHILOSOPHERS.map(p => {
                const pos = philPos(p);
                const accessible = isAccessible(p);
                const completed = isCompleted(p);
                const isHigh = highlighted.includes(p.id);
                const isHovered = hoverId === p.id;
                const R = isHovered ? 28 : 22;

                return (
                  <g key={p.id}
                    style={{cursor:accessible?"pointer":"default"}}
                    onClick={()=>accessible && onSelectPhilosopher(p.id)}
                    onMouseEnter={()=>setHoverId(p.id)}
                    onMouseLeave={()=>setHoverId(null)}
                  >
                    {/* Glow for highlighted */}
                    {isHigh && accessible && (
                      <circle cx={pos.x} cy={pos.y} r={48}
                        fill={`${p.color}18`}
                        style={{animation:"pulse 2.5s ease-in-out infinite"}}/>
                    )}
                    {/* Fog overlay for locked */}
                    {!accessible && (
                      <circle cx={pos.x} cy={pos.y} r={34}
                        fill="rgba(5,5,15,0.7)"/>
                    )}
                    {/* Outer ring */}
                    <circle cx={pos.x} cy={pos.y} r={R+3}
                      fill="none"
                      stroke={completed ? p.color : isHigh && accessible ? p.color : "rgba(255,255,255,0.1)"}
                      strokeWidth={completed?2:isHigh&&accessible?1.5:1}
                      opacity={accessible?1:0.25}
                      strokeDasharray={!accessible?"4 4":"none"}
                    />
                    {/* Main circle */}
                    <circle cx={pos.x} cy={pos.y} r={R}
                      fill={completed
                        ? `${p.color}22`
                        : isHigh && accessible
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(255,255,255,0.02)"}
                      opacity={accessible?1:0.3}
                    />
                    {/* Icon */}
                    <text x={pos.x} y={pos.y+1} fontSize={accessible?18:14}
                      textAnchor="middle" dominantBaseline="middle"
                      opacity={accessible?1:0.25}>
                      {p.icon}
                    </text>
                    {/* Completed check */}
                    {completed && (
                      <text x={pos.x+17} y={pos.y-17} fontSize={10}
                        fill={p.color} textAnchor="middle">✓</text>
                    )}
                    {/* Lock */}
                    {!accessible && (
                      <text x={pos.x} y={pos.y+26} fontSize={10}
                        textAnchor="middle" fill="rgba(255,255,255,0.2)">🔒</text>
                    )}
                    {/* Name label */}
                    <text x={pos.x} y={pos.y+R+14} fontSize={10}
                      textAnchor="middle"
                      fill={accessible ? (completed?p.color:isHigh?"#e8d5b0":"#8a7050") : "#3a2a18"}
                      fontFamily="serif">
                      {p.name}
                    </text>

                    {/* Hover tooltip */}
                    {isHovered && accessible && (
                      <g>
                        <rect
                          x={pos.x > MAP_W*0.6 ? pos.x-220 : pos.x+36}
                          y={pos.y-50}
                          width={180} height={90} rx={8}
                          fill="rgba(8,8,20,0.96)"
                          stroke={`${p.color}44`} strokeWidth={1}
                        />
                        <text
                          x={pos.x > MAP_W*0.6 ? pos.x-130 : pos.x+126}
                          y={pos.y-28}
                          fontSize={12} textAnchor="middle" fill={p.color} fontFamily="serif">
                          {p.name}
                        </text>
                        <text
                          x={pos.x > MAP_W*0.6 ? pos.x-130 : pos.x+126}
                          y={pos.y-12}
                          fontSize={9} textAnchor="middle" fill="#8a7050" fontFamily="serif">
                          {p.born}
                        </text>
                        <foreignObject
                          x={pos.x > MAP_W*0.6 ? pos.x-216 : pos.x+40}
                          y={pos.y-2} width={172} height={40}>
                          <div xmlns="http://www.w3.org/1999/xhtml"
                            style={{fontSize:9,color:"#c0a878",lineHeight:1.5,fontFamily:"serif",padding:"0 4px"}}>
                            {p.tagline}
                          </div>
                        </foreignObject>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div style={{
            display:"flex",gap:24,marginTop:20,flexWrap:"wrap",
            padding:"0 4px",
          }}>
            {[
              {color:"#d4a853", label:"あなたの悩みに共鳴（光っている）"},
              {color:"rgba(212,168,83,0.5)", label:"影響の線（実線＝解放済み）"},
              {color:"rgba(255,255,255,0.2)", label:"未探索（点線）"},
            ].map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#6a5a3a"}}>
                <div style={{width:10,height:10,borderRadius:"50%",background:l.color,flexShrink:0}}/>
                {l.label}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{
            marginTop:20,padding:"18px 24px",
            background:"rgba(212,168,83,0.04)",
            border:"1px solid rgba(212,168,83,0.1)",borderRadius:10,
          }}>
            <div style={{display:"flex",alignItems:"center",gap:16}}>
              <div style={{fontSize:12,color:"#6a5a3a",whiteSpace:"nowrap"}}>哲学地図の探索度</div>
              <div style={{flex:1,height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden"}}>
                <div style={{
                  height:"100%",
                  width:`${(unlocked.length/PHILOSOPHERS.length)*100}%`,
                  background:"linear-gradient(90deg,#a87830,#d4a853)",
                  borderRadius:2,transition:"width 1s ease",
                }}/>
              </div>
              <div style={{fontSize:13,color:"#d4a853",whiteSpace:"nowrap"}}>
                {unlocked.length} / {PHILOSOPHERS.length}
              </div>
            </div>
          </div>
          <div style={{textAlign:"center",marginTop:12,fontSize:13,color:"#4a3a20"}}>
            ✨ 光っている哲学者をクリックして物語を読もう
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STORY SCREEN
// ═══════════════════════════════════════════════════════════════

function StoryScreen({philId, unlocked, onComplete, onBack}) {
  const p = getPhil(philId);
  const [v, setV] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(()=>{ setV(false); setDone(false); setTimeout(()=>setV(true),100); },[philId]);
  if (!p) return null;

  const alreadyDone = unlocked.includes(p.id);
  const nextPhils = p.influences.map(id=>getPhil(id)).filter(Boolean);

  const handleDone = () => {
    setDone(true);
    if (!alreadyDone) onComplete(p.id);
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#070710 0%,#0c1020 60%,#0f1828 100%)",
      fontFamily:"'Hiragino Mincho ProN','Yu Mincho',Georgia,serif",
      color:"#e8e0d0",position:"relative",
    }}>
      <StarField/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"44px 24px 100px",position:"relative",zIndex:1}}>
        <div style={{
          opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",
          transition:"all 0.9s ease",
        }}>
          <button onClick={onBack} style={{
            background:"transparent",border:"1px solid rgba(255,255,255,0.1)",
            color:"#8a7050",padding:"9px 18px",cursor:"pointer",
            fontFamily:"inherit",fontSize:13,borderRadius:4,marginBottom:44,
          }}>← 地図に戻る</button>

          {/* Hero */}
          <div style={{textAlign:"center",marginBottom:52}}>
            <div style={{fontSize:64,marginBottom:20}}>{p.icon}</div>
            <div style={{fontSize:11,letterSpacing:6,color:p.color,marginBottom:14,textTransform:"uppercase"}}>
              {p.region==="west"?"西洋哲学":"東洋哲学"} · {p.born}
            </div>
            <h2 style={{fontSize:"clamp(30px,6vw,48px)",fontWeight:200,margin:"0 0 16px",color:"#e8d5b0",letterSpacing:4}}>
              {p.name}
            </h2>
            <p style={{fontSize:"clamp(13px,2.5vw,16px)",color:"#7a6040",maxWidth:460,margin:"0 auto",lineHeight:1.8}}>
              {p.tagline}
            </p>
          </div>

          {/* Quote */}
          <div style={{
            borderLeft:`3px solid ${p.color}`,
            background:`linear-gradient(90deg,${p.color}10,transparent)`,
            padding:"22px 28px",borderRadius:"0 10px 10px 0",marginBottom:52,
          }}>
            <div style={{fontSize:"clamp(14px,2.8vw,17px)",color:"#d4c4a0",lineHeight:1.9,fontStyle:"italic"}}>
              「{p.quote}」
            </div>
          </div>

          {/* Story */}
          <div style={{marginBottom:52}}>
            {p.story.split("\n\n").map((para,i) => {
              if (para.startsWith("**") && para.endsWith("**")) {
                return (
                  <div key={i} style={{
                    fontSize:"clamp(15px,3vw,18px)",color:p.color,
                    fontWeight:500,margin:"36px 0",textAlign:"center",letterSpacing:1,
                  }}>{para.slice(2,-2)}</div>
                );
              }
              return (
                <p key={i} style={{
                  fontSize:"clamp(14px,2.4vw,16px)",color:"#c0b090",
                  lineHeight:2.1,margin:"0 0 26px",
                }}>{para}</p>
              );
            })}
          </div>

          {/* Complete */}
          {!done && !alreadyDone && (
            <div style={{textAlign:"center",marginBottom:48}}>
              <button onClick={handleDone} style={{
                background:`linear-gradient(135deg,${p.color}cc,${p.color})`,
                border:"none",color:"#080808",padding:"17px 52px",
                fontSize:16,letterSpacing:3,cursor:"pointer",
                fontFamily:"inherit",borderRadius:3,fontWeight:600,
                boxShadow:`0 8px 28px ${p.color}33`,
                transition:"all 0.3s ease",
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
                この哲学者を理解した ✓
              </button>
            </div>
          )}

          {/* Next quests */}
          {(done || alreadyDone) && nextPhils.length > 0 && (
            <div style={{
              background:"rgba(255,255,255,0.025)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:14,padding:28,marginBottom:36,
            }}>
              <div style={{fontSize:11,letterSpacing:5,color:"#6a5a3a",marginBottom:18,textTransform:"uppercase"}}>
                Next Quest
              </div>
              <div style={{fontSize:14,color:"#6a5040",marginBottom:22,lineHeight:1.9}}>
                {p.nextHint}
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {nextPhils.map(nx => (
                  <button key={nx.id} onClick={onBack} style={{
                    background:`${nx.color}14`,
                    border:`1px solid ${nx.color}44`,
                    color:nx.color,padding:"13px 22px",cursor:"pointer",
                    fontFamily:"inherit",fontSize:14,borderRadius:8,
                    display:"flex",alignItems:"center",gap:10,
                    transition:"all 0.3s ease",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${nx.color}28`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${nx.color}14`;}}>
                    <span>{nx.icon}</span>
                    <span>{nx.name}の物語へ</span>
                    <span style={{opacity:0.6}}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{textAlign:"center"}}>
            <button onClick={onBack} style={{
              background:"transparent",border:"1px solid rgba(255,255,255,0.09)",
              color:"#6a5a3a",padding:"13px 36px",cursor:"pointer",
              fontFamily:"inherit",fontSize:14,borderRadius:4,
            }}>世界地図に戻る</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [screen, setScreen]   = useState("title");
  const [worry, setWorry]     = useState(null);
  const [unlocked, setUnlocked] = useState([]);
  const [philId, setPhilId]   = useState(null);

  const handleWorry = (w) => { setWorry(w); setScreen("map"); };
  const handlePhil  = (id) => { setPhilId(id); setScreen("story"); };
  const handleComplete = (id) => setUnlocked(prev=>[...new Set([...prev,id])]);

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#070710;}
        @keyframes twinkle{from{opacity:0.08;transform:scale(1);}to{opacity:0.55;transform:scale(1.4);}}
        @keyframes pulse{0%,100%{opacity:0.6;}50%{opacity:1;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#070710;}
        ::-webkit-scrollbar-thumb{background:#2a1a08;border-radius:2px;}
      `}</style>

      {screen==="title" && <TitleScreen onStart={()=>setScreen("worry")}/>}
      {screen==="worry" && <WorryScreen onSelect={handleWorry}/>}
      {screen==="map"   && <WorldMapScreen worry={worry} unlocked={unlocked}
        onSelectPhilosopher={handlePhil} onBack={()=>setScreen("worry")}/>}
      {screen==="story" && <StoryScreen philId={philId} unlocked={unlocked}
        onComplete={handleComplete} onBack={()=>setScreen("map")}/>}
    </>
  );
}
