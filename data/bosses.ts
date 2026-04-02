import type { Boss } from '@/types/game'

export const BOSSES: Boss[] = [
  {
    id: 'doksa',
    name: 'ドクサ',
    buddyId: 'socrates',
    title: '無知の暴君',
    description:
      '「知っているふり」が生み出した幻想の支配者。\n' +
      'ドクサとはギリシャ語で「思い込み・意見・俗見」を意味する。\n' +
      '問いを封じ、答えを疑わせない——それがドクサの武器だ。\n' +
      'ソクラテスとの対話で磨いた「問う力」で、その仮面を剥げ。',
    color: '#7BA7BC',
    sprite: '👁️',
  },
  {
    id: 'tanha',
    name: 'タンハー',
    buddyId: 'buddha',
    title: '執着の魔王',
    description:
      '「渇愛」が具現化した苦しみの権化。\n' +
      'タンハーとはパーリ語で「渇望・執着」を意味する。\n' +
      'もっと欲しい、失いたくない——その執着があなたを縛り続ける。\n' +
      'ブッダと龍樹から学んだ「空」の智慧で、執着の鎖を断て。',
    color: '#D4A853',
    sprite: '🔗',
  },
  {
    id: 'wei',
    name: 'ウェイ',
    buddyId: 'laozi',
    title: '支配の亡霊',
    description:
      '「力による制御」という幻想に憑かれた亡霊。\n' +
      'ウェイとは中国語で「作為・強制的な行為」を意味する。\n' +
      '流れに逆らい、すべてを支配しようとする傲慢さの化身。\n' +
      '老子・荘子・孔子から学んだ「無為の道」で、その執着を解け。',
    color: '#6BAF8C',
    sprite: '⛓️',
  },
]

export function getBoss(id: string) {
  return BOSSES.find(b => b.id === id)
}
