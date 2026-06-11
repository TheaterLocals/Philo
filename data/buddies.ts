import type { Buddy, PhilosopherId } from '@/types/game'

export const BUDDIES: Buddy[] = [
  {
    id: 'socrates',
    name: 'ソクラテス',
    nameEn: 'Socrates',
    tagline: '問い続ける魂の守護者',
    description: '「なんのために生きているんだろう」——その問いを、一緒に掘り下げていく旅へ。',
    bossId: 'doksa',
    worries: ['意味', 'アイデンティティ', '社会', '未来'],
    philosophers: ['socrates', 'plato', 'aristotle', 'kant', 'nietzsche'] as PhilosopherId[],
    color: '#7BA7BC',
    icon: '🏛️',
  },
  {
    id: 'buddha',
    name: 'ブッダ',
    nameEn: 'Buddha',
    tagline: '執着を解く慈悲の道標',
    description: '頑張っても満たされない。その苦しさの根っこを、一緒に見つける旅へ。',
    bossId: 'tanha',
    worries: ['意味', '競争', '死', '自由'],
    philosophers: ['buddha', 'nagarjuna', 'dogen', 'nishida', 'heidegger'] as PhilosopherId[],
    color: '#D4A853',
    icon: '☸️',
  },
  {
    id: 'laozi',
    name: '老子',
    nameEn: 'Laozi',
    tagline: '無為の流れに乗る道の案内人',
    description: '周りと比べて、取り残された気がする。そのレースから降りる旅へ。',
    bossId: 'wei',
    worries: ['自由', '競争', '社会', '意味'],
    philosophers: ['laozi', 'zhuangzi', 'confucius', 'mencius', 'wang_yangming'] as PhilosopherId[],
    color: '#6BAF8C',
    icon: '☯️',
  },
]

export function getBuddy(id: string) {
  return BUDDIES.find(b => b.id === id)
}
