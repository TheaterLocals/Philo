export type BuddyId = 'socrates' | 'buddha' | 'laozi'

export type PhilosopherId =
  | 'socrates' | 'plato' | 'aristotle' | 'kant' | 'nietzsche'
  | 'buddha' | 'nagarjuna' | 'dogen' | 'nishida' | 'heidegger'
  | 'laozi' | 'zhuangzi' | 'confucius' | 'mencius' | 'wang_yangming'

export type BossId = 'doksa' | 'tanha' | 'wei'

export type PhilProgress = {
  talked:  boolean
  quizzed: boolean
  deep:    boolean
}

export type ProgressMap = Record<string, PhilProgress>

export type SaveData = {
  buddy:    BuddyId
  progress: ProgressMap
  beaten?:  boolean
}

export type Quiz = {
  q:           string
  options:     string[]
  correct:     number
  explanation: string
}

export type DeepDiveSection = {
  title: string
  body:  string
}

export type DialogueLine = {
  speaker: 'sakura' | 'philosopher'
  text:    string
}

export type Wisdom = {
  name:        string
  description: string
  icon:        string
}

export type Philosopher = {
  id:          PhilosopherId
  name:        string
  nameEn:      string
  buddyIds:    BuddyId[]
  unlockFrom:  PhilosopherId | null
  tagline:     string
  quote:       string
  dialogue:    DialogueLine[]
  quizzes:     Quiz[]
  color:       string
  icon:        string
  deepDive:    DeepDiveSection[]
  wisdom:      Wisdom
}

export type Buddy = {
  id:          BuddyId
  name:        string
  nameEn:      string
  tagline:     string
  description: string
  bossId:      BossId
  worries:     string[]
  philosophers: PhilosopherId[]
  color:       string
  icon:        string
}

export type Boss = {
  id:          BossId
  name:        string
  buddyId:     BuddyId
  title:       string
  description: string
  color:       string
  sprite:      string
}

export type StoryPhase =
  | 'dialogue'
  | 'quiz'
  | 'result'
  | 'goto_deep'
  | 'complete'

export type GameScreen =
  | 'title'
  | 'prologue'
  | 'buddy'
  | 'map'
  | 'collection'
  | 'status'
  | `story_${string}`
  | `deep_${string}`
  | 'boss'
  | 'ending'
