'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BuddyId, GameScreen, PhilProgress, ProgressMap } from '@/types/game'

const SAVE_KEY       = 'philo_save_v1'
const BONUS_KEY      = 'philo_bonus'
const COLLECTION_KEY = 'philo_collection_v1'

const DEFAULT_PROGRESS: PhilProgress = { talked: false, quizzed: false, deep: false }

export function useGameState() {
  const [screen,             setScreen]           = useState<GameScreen>('title')
  const [buddy,              setBuddy]            = useState<BuddyId | null>(null)
  const [progress,           setProgress]         = useState<ProgressMap>({})
  const [hasSave,            setHasSave]          = useState(false)
  const [collectionProgress, setCollectionProgress] = useState<ProgressMap>({})

  // Check for existing save on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (raw) setHasSave(true)
      const colRaw = localStorage.getItem(COLLECTION_KEY)
      if (colRaw) setCollectionProgress(JSON.parse(colRaw))
    } catch {
      // localStorage unavailable (SSR / private mode)
    }
  }, [])

  // ── Save helpers ──────────────────────────────────────────────
  const persist = useCallback((buddyId: BuddyId | null, prog: ProgressMap) => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ buddy: buddyId, progress: prog }))
    } catch { /* noop */ }
  }, [])

  // ── New game ──────────────────────────────────────────────────
  const newGame = useCallback((buddyId: BuddyId) => {
    setBuddy(buddyId)
    setProgress({})
    setHasSave(true)
    persist(buddyId, {})
    setScreen('map')
  }, [persist])

  // ── Continue from save ────────────────────────────────────────
  const loadGame = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return
      const data = JSON.parse(raw) as { buddy: BuddyId; progress: ProgressMap }
      setBuddy(data.buddy)
      setProgress(data.progress ?? {})
      setScreen('map')
    } catch { /* noop */ }
  }, [])

  // ── Progress helpers ──────────────────────────────────────────
  const getPhilProgress = useCallback((philId: string): PhilProgress => {
    return progress[philId] ?? { ...DEFAULT_PROGRESS }
  }, [progress])

  const persistCollection = useCallback((col: ProgressMap) => {
    try { localStorage.setItem(COLLECTION_KEY, JSON.stringify(col)) } catch { /* noop */ }
  }, [])

  const updateProgress = useCallback((philId: string, updates: Partial<PhilProgress>) => {
    setProgress(prev => {
      const next: ProgressMap = {
        ...prev,
        [philId]: { ...DEFAULT_PROGRESS, ...prev[philId], ...updates },
      }
      persist(buddy, next)
      // accumulate into collection
      setCollectionProgress(col => {
        const nextCol: ProgressMap = {
          ...col,
          [philId]: {
            talked:  (col[philId]?.talked  || updates.talked  || false),
            quizzed: (col[philId]?.quizzed || updates.quizzed || false),
            deep:    (col[philId]?.deep    || updates.deep    || false),
          },
        }
        persistCollection(nextCol)
        return nextCol
      })
      return next
    })
  }, [buddy, persist, persistCollection])

  // ── Deep text (bonus damage) ──────────────────────────────────
  const markDeepRead = useCallback((philId: string) => {
    try {
      const raw   = localStorage.getItem(BONUS_KEY)
      const bonus = raw ? JSON.parse(raw) : {}
      bonus[philId] = true
      localStorage.setItem(BONUS_KEY, JSON.stringify(bonus))
    } catch { /* noop */ }
    updateProgress(philId, { deep: true, quizzed: true, talked: true })
  }, [updateProgress])

  /** Number of deep-read completions (max 3, subtracts from boss initial HP) */
  const getReadBonus = useCallback((): number => {
    try {
      const raw   = localStorage.getItem(BONUS_KEY)
      const bonus = raw ? JSON.parse(raw) : {}
      return Math.min(3, Object.values(bonus).filter(Boolean).length)
    } catch {
      return 0
    }
  }, [])

  // ── Unlock helpers ────────────────────────────────────────────
  /** IDs of philosophers whose quiz has been completed */
  const quizzedIds = Object.entries(progress)
    .filter(([, v]) => v.quizzed)
    .map(([k]) => k)

  /** Whether the boss is unlockable (≥4 quizzed in current buddy's roster) */
  const isBossUnlocked = useCallback((buddyPhilosophers: string[]): boolean => {
    const count = buddyPhilosophers.filter(id => progress[id]?.quizzed).length
    return count >= 4
  }, [progress])

  return {
    screen,
    setScreen,
    buddy,
    progress,
    collectionProgress,
    hasSave,
    quizzedIds,
    newGame,
    loadGame,
    getPhilProgress,
    updateProgress,
    markDeepRead,
    getReadBonus,
    isBossUnlocked,
  }
}
