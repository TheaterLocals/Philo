import type { Buddy, PhilosopherId } from '@/types/game'

export const BUDDIES: Buddy[] = [
  {
    id: 'socrates',
    name: 'ソクラテス',
    nameEn: 'Socrates',
    tagline: '問い続ける魂の守護者',
    description: '「知らないと知ること」から始まる問いの旅。意味・アイデンティティ・社会・未来に悩むあなたへ。',
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
    description: '苦しみの根を見つめ、手放す智慧の旅。意味・競争・死・自由に悩むあなたへ。',
    bossId: 'tanha',
    worries: ['意味', '競争', '死', '自由'],
    philosophers: ['buddha', 'nagarjuna', 'heidegger'] as PhilosopherId[],
    color: '#D4A853',
    icon: '☸️',
  },
  {
    id: 'laozi',
    name: '老子',
    nameEn: 'Laozi',
    tagline: '無為の流れに乗る道の案内人',
    description: '争わず、ただ流れに沿う——自然の智慧の旅。自由・競争・社会・意味に悩むあなたへ。',
    bossId: 'wei',
    worries: ['自由', '競争', '社会', '意味'],
    philosophers: ['laozi', 'zhuangzi', 'confucius'] as PhilosopherId[],
    color: '#6BAF8C',
    icon: '☯️',
  },
]

export function getBuddy(id: string) {
  return BUDDIES.find(b => b.id === id)
}
