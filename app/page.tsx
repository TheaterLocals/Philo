'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { BUDDIES, getBuddy } from '@/data/buddies'
import { getBoss } from '@/data/bosses'
import { getPhilosopher, getPhilosophersByBuddy } from '@/data/philosophers'
import type { PhilProgress, Quiz, StoryPhase } from '@/types/game'

// ── Palette & fonts ──────────────────────────────────────────────
const C = {
  bg: '#0f1a1a', panel: '#162020', border: '#2a4a4a',
  teal: '#3d8080', tealLight: '#5aacac', tealDim: '#234040',
  amber: '#d4a853', amberDim: '#7a5a20',
  cream: '#e8dcc8', creamDim: '#9a8870',
  text: '#d0e8e8', textDim: '#6a9a9a',
  red: '#c05040', green: '#4a8a5a',
  hp: '#e05050', hpBg: '#3a1010',
}
const PIXEL = "var(--font-pixel), monospace"

// 選択肢をシャッフルし、correct インデックスを更新して返す
function shuffleQuizOptions(quiz: Quiz): Quiz {
  const items = quiz.options.map((opt, i) => ({ opt, isCorrect: i === quiz.correct }))
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]]
  }
  return {
    ...quiz,
    options: items.map(x => x.opt),
    correct: items.findIndex(x => x.isCorrect),
  }
}
const SERIF = "'DotGothic16', sans-serif"

// ── Shared UI ────────────────────────────────────────────────────

function PixelBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ border: `2px solid ${C.border}`, background: C.panel, position: 'relative', ...style }}>
      <div style={{ position: 'absolute', inset: 3, border: `1px solid ${C.tealDim}`, pointerEvents: 'none' }} />
      {children}
    </div>
  )
}

function PixelBtn({ children, onClick, disabled, color, style }: {
  children: React.ReactNode; onClick?: () => void
  disabled?: boolean; color?: string; style?: React.CSSProperties
}) {
  const [hover, setHover] = useState(false)
  const c = color ?? C.tealLight
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: PIXEL, fontSize: 10, letterSpacing: 1,
        border: `2px solid ${c}`, background: hover ? C.tealDim : 'transparent',
        color: hover ? C.cream : c, padding: '10px 20px',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        transition: 'background .15s, color .15s', ...style,
      }}>
      {children}
    </button>
  )
}

function HPBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, current / max)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.textDim, minWidth: 24 }}>HP</span>
      <div style={{ flex: 1, height: 16, background: C.hpBg, border: `2px solid ${C.red}`, position: 'relative' }}>
        <div style={{
          height: '100%', width: `${pct * 100}%`,
          background: pct > 0.5 ? C.green : pct > 0.25 ? C.amber : C.hp,
          transition: 'width .5s ease',
        }} />
      </div>
      <span style={{ fontFamily: PIXEL, fontSize: 9, color: C.hp, minWidth: 36 }}>{current}/{max}</span>
    </div>
  )
}

// ── Global Nav ───────────────────────────────────────────────────

function GlobalNav({ screen, onMap, onSave }: {
  screen: string; onMap: () => void; onSave: () => void
}) {
  const [saved, setSaved] = useState(false)
  const showNav = screen === 'map' || screen.startsWith('story_') || screen.startsWith('deep_') || screen === 'boss'
  if (!showNav) return null

  const label =
    screen === 'map'         ? 'MAP' :
    screen.startsWith('story_') ? 'STORY' :
    screen.startsWith('deep_')  ? 'DEEP TEXT' :
    screen === 'boss'        ? 'BOSS BATTLE' : ''

  const handleSave = () => {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 48, zIndex: 100,
      background: `${C.bg}ee`, borderBottom: `1px solid ${C.border}`,
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
    }}>
      {/* Left: logo */}
      <span style={{ fontFamily: PIXEL, fontSize: 11, color: C.amber, letterSpacing: 2, flexShrink: 0 }}>
        PHILO
      </span>

      {/* Center: screen name */}
      <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.textDim, letterSpacing: 3, flex: 1, textAlign: 'center' }}>
        {label}
      </span>

      {/* Right: buttons */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {screen !== 'map' && (
          <button onClick={onMap} style={{
            fontFamily: PIXEL, fontSize: 8, letterSpacing: 1,
            border: `1px solid ${C.border}`, background: 'transparent',
            color: C.tealLight, padding: '6px 12px', cursor: 'pointer',
          }}>
            ◀ MAP
          </button>
        )}
        <button onClick={handleSave} style={{
          fontFamily: PIXEL, fontSize: 8, letterSpacing: 1,
          border: `1px solid ${saved ? C.green : C.amberDim}`,
          background: saved ? `${C.green}22` : 'transparent',
          color: saved ? '#8adc8a' : C.amber,
          padding: '6px 12px', cursor: 'pointer',
          transition: 'all .2s',
        }}>
          {saved ? 'SAVED ✓' : 'SAVE'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// TITLE SCREEN
// ══════════════════════════════════════════════════════════════════

function TitleScreen({ hasSave, onNew, onContinue }: {
  hasSave: boolean; onNew: () => void; onContinue: () => void
}) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: C.bg, padding: '40px 20px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.08) 2px,rgba(0,0,0,.08) 4px)',
      }} />
      <div style={{
        position: 'relative', zIndex: 1,
        opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(32px)',
        transition: 'all 1.2s cubic-bezier(.16,1,.3,1)',
      }}>
        <p style={{ fontFamily: PIXEL, fontSize: 9, letterSpacing: 3, color: C.tealLight, marginBottom: 32 }}>
          PHILOSOPHY  RPG
        </p>
        <h1 style={{
          fontFamily: PIXEL, fontSize: 'clamp(40px,12vw,80px)',
          color: C.amber, letterSpacing: 8, margin: '0 0 4px',
          textShadow: `0 0 40px ${C.amberDim}, 0 0 80px rgba(212,168,83,.2)`,
        }}>
          PHILO
        </h1>
        <p style={{ fontFamily: SERIF, fontSize: 16, color: C.creamDim, letterSpacing: 6, marginBottom: 48 }}>
          フィロ
        </p>
        <p style={{
          fontFamily: SERIF, fontSize: 'clamp(15px,2.5vw,19px)',
          color: C.cream, lineHeight: 2.2, marginBottom: 56, maxWidth: 440,
        }}>
          あなたの悩みを、<br />
          2500年前にすでに言語化していた人がいる。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <PixelBtn onClick={onNew} color={C.amber} style={{ minWidth: 220, padding: '14px 32px', fontSize: 11 }}>
            ▶ NEW GAME
          </PixelBtn>
          {hasSave && (
            <PixelBtn onClick={onContinue} style={{ minWidth: 220, padding: '12px 32px' }}>
              ▷ CONTINUE
            </PixelBtn>
          )}
        </div>
        <p style={{ marginTop: 64, fontFamily: PIXEL, fontSize: 7, color: C.tealDim, letterSpacing: 2 }}>
          © 2026 PHILO
        </p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// PROLOGUE SCREEN
// ══════════════════════════════════════════════════════════════════

const PROLOGUE_SCENES = [
  {
    img: 'sakura',
    lines: [
      '深夜2時。',
      '東京のどこかのマンション、6畳の部屋。',
      'スマートフォンの光だけが、彼女の顔を照らしていた。',
    ],
  },
  {
    img: 'sakura',
    lines: [
      '「また上司に怒鳴られた。」',
      '「同期は今年、主任になった。」',
      '「昨日、友達の結婚式の帰りに泣いた。理由は、わからなかった。」',
      '',
      '彼女——サクラ、27歳——は、',
      '自分が何に苦しんでいるのかさえ、',
      'もうわからなくなっていた。',
    ],
  },
  {
    img: 'monster',
    lines: [
      '心の苦しみが積み重なるとき、',
      'それはやがてカタチを持つ。',
      '',
      '執着、比較、恐れ、孤独——',
      '',
      '暗闇の中で、ゆっくりと',
      'モンスターへと変わっていく。',
    ],
  },
  {
    img: 'monster',
    lines: [
      'サクラだけじゃない。',
      '',
      '今夜、世界中の誰かが',
      '同じように天井を見つめている。',
      '',
      'そしてその心の奥で、',
      'モンスターが目を覚ます。',
    ],
  },
  {
    img: null,
    lines: [
      'しかし——',
      '',
      '遥か昔、同じ問いを抱えた者たちがいた。',
      '',
      '苦しみとは何か。',
      'なぜ人は悩むのか。',
      'どうすれば、自由になれるのか。',
      '',
      '彼らはすでに、答えを知っていた。',
    ],
  },
  {
    img: null,
    lines: [
      '今こそ、その智慧を武器に立ち上がれ。',
      '',
      '哲学者のバディを選び、',
      'モンスターを倒せ。',
      '',
      'サクラを——救え。',
    ],
    isLast: true,
  },
]

function PrologueScreen({ onStart }: { onStart: () => void }) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [vis, setVis] = useState(true)
  const [imgError, setImgError] = useState<Record<string, boolean>>({})

  const scene = PROLOGUE_SCENES[sceneIdx]
  const isLast = !!(scene as { isLast?: boolean } | undefined)?.isLast

  const advance = useCallback(() => {
    // 範囲外 or 最終シーンなら即 onStart
    if (!scene || isLast) { onStart(); return }
    setVis(false)
    setTimeout(() => {
      setSceneIdx(i => {
        const next = i + 1
        return next < PROLOGUE_SCENES.length ? next : i
      })
      setVis(true)
    }, 400)
  }, [scene, isLast, onStart])

  // Space/Enter key support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') advance()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [advance])

  // scene が undefined の場合（インデックス超過）はそのまま開始
  if (!scene) { onStart(); return null }

  return (
    <div
      onClick={isLast ? undefined : advance}
      style={{
        minHeight: '100vh', background: '#050e0e',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', cursor: isLast ? 'default' : 'pointer',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* SKIP リンク */}
      <button
        onClick={e => { e.stopPropagation(); onStart() }}
        style={{
          position: 'absolute', top: 16, right: 20,
          background: 'none', border: 'none',
          fontFamily: PIXEL, fontSize: 8, color: C.textDim,
          cursor: 'pointer', letterSpacing: 2,
          textDecoration: 'underline', padding: 4,
          opacity: 0.5,
        }}
      >
        SKIP
      </button>
      {/* Scanline */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.1) 2px,rgba(0,0,0,.1) 4px)',
        zIndex: 0,
      }} />

      <div style={{
        position: 'relative', zIndex: 1, maxWidth: 640, width: '100%',
        opacity: vis ? 1 : 0, transition: 'opacity .4s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        {/* Scene counter */}
        <div style={{ display: 'flex', gap: 8 }}>
          {PROLOGUE_SCENES.map((_, i) => (
            <div key={i} style={{
              width: i === sceneIdx ? 20 : 6, height: 4,
              background: i <= sceneIdx ? C.amber : C.tealDim,
              transition: 'all .3s ease',
            }} />
          ))}
        </div>

        {/* Illustration */}
        {scene.img && (
          <div style={{
            width: 220, height: 220,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!imgError[scene.img] ? (
              <img
                src={`/illustrations/${scene.img}.png`}
                alt=""
                onError={() => setImgError(p => ({ ...p, [scene.img!]: true }))}
                style={{
                  maxWidth: '100%', maxHeight: '100%',
                  objectFit: 'contain',
                  filter: 'brightness(0.85)',
                  animation: 'bob 3s ease-in-out infinite',
                }}
              />
            ) : (
              <div style={{ fontSize: 80, opacity: 0.5 }}>
                {scene.img === 'monster' ? '👥' : '🌑'}
              </div>
            )}
          </div>
        )}

        {/* Text */}
        <div style={{ textAlign: 'center', minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          {scene.lines.map((line, i) => (
            <p key={i} style={{
              fontFamily: line.startsWith('「') ? SERIF : SERIF,
              fontSize: line === '' ? 8 : line.startsWith('今こそ') || line.startsWith('サクラを') ? 22 : 17,
              color: line.startsWith('「') ? C.creamDim
                   : line === '' ? 'transparent'
                   : line.startsWith('今こそ') || line.startsWith('サクラを') ? C.amber
                   : line.startsWith('しかし') ? C.tealLight
                   : C.cream,
              lineHeight: 1.9,
              letterSpacing: line.startsWith('今こそ') ? 2 : 0.5,
              animation: `fadeSlide .6s ease ${i * 0.12}s both`,
              fontStyle: line.startsWith('「') ? 'italic' : 'normal',
            }}>
              {line === '' ? '　' : line}
            </p>
          ))}
        </div>

        {/* CTA */}
        {isLast ? (
          <button
            onClick={onStart}
            style={{
              fontFamily: PIXEL, fontSize: 11, letterSpacing: 2,
              background: C.amberDim, border: `2px solid ${C.amber}`,
              color: C.cream, padding: '16px 40px', cursor: 'pointer',
              animation: 'fadeSlide .8s ease .8s both',
              boxShadow: `0 0 24px ${C.amberDim}`,
            }}
          >
            ▶ バディを選ぶ
          </button>
        ) : (
          <p style={{
            fontFamily: PIXEL, fontSize: 7, color: C.tealDim,
            letterSpacing: 2, animation: 'blink-a 1.5s step-end infinite',
          }}>
            CLICK  TO  CONTINUE
          </p>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// BUDDY SELECT
// ══════════════════════════════════════════════════════════════════

function BuddySelectScreen({ onSelect }: { onSelect: (id: string) => void }) {
  const [vis, setVis] = useState(false)
  const [hov, setHov] = useState<string | null>(null)
  const [imgError, setImgError] = useState<Record<string, boolean>>({})
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '60px 20px 80px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: 52,
          opacity: vis ? 1 : 0, transition: 'opacity .8s ease',
        }}>
          <p style={{ fontFamily: PIXEL, fontSize: 9, color: C.tealLight, letterSpacing: 3, marginBottom: 20 }}>
            SELECT  YOUR  BUDDY
          </p>
          <h2 style={{ fontFamily: SERIF, fontSize: 38, color: C.cream, fontWeight: 400, marginBottom: 14 }}>
            旅のバディを選んでください
          </h2>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: C.creamDim }}>
            バディはあなたとともに哲学者たちの世界へ導きます
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all .9s ease .2s',
        }}>
          {BUDDIES.map(b => (
            <button
              key={b.id}
              onClick={() => onSelect(b.id)}
              onMouseEnter={() => setHov(b.id)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: 'transparent',
                border: `2px solid ${hov === b.id ? b.color : C.border}`,
                padding: 0,
                cursor: 'pointer', textAlign: 'left',
                transition: 'all .2s ease',
                boxShadow: hov === b.id ? `0 0 28px ${b.color}30` : 'none',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Illustration — tall area */}
              <div style={{
                width: '100%', height: 300,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                overflow: 'hidden',
                background: `radial-gradient(ellipse at center bottom, ${b.color}20 0%, ${C.panel} 80%)`,
              }}>
                {!imgError[b.id] ? (
                  <img
                    src={`/illustrations/${b.id}.png`}
                    alt={b.name}
                    onError={() => setImgError(p => ({ ...p, [b.id]: true }))}
                    style={{
                      height: '100%', width: 'auto', maxWidth: '100%',
                      objectFit: 'contain', objectPosition: 'bottom center',
                      animation: hov === b.id ? 'bob 2s ease-in-out infinite' : 'none',
                      filter: `drop-shadow(0 0 12px ${b.color}44)`,
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: 90, paddingBottom: 16,
                    animation: hov === b.id ? 'bob 2s ease-in-out infinite' : 'none',
                  }}>
                    {b.icon}
                  </div>
                )}
              </div>

              {/* Text overlay — overlaps illustration, semi-transparent */}
              <div style={{
                marginTop: -56,
                background: 'rgba(22,32,32,0.82)',
                backdropFilter: 'blur(8px)',
                borderTop: `1px solid ${b.color}44`,
                padding: '20px 22px 22px',
                position: 'relative',
              }}>
                <p style={{ fontFamily: PIXEL, fontSize: 8, color: b.color, marginBottom: 8, letterSpacing: 1 }}>
                  {b.nameEn.toUpperCase()}
                </p>
                <h3 style={{ fontFamily: SERIF, fontSize: 30, color: C.cream, fontWeight: 400, marginBottom: 6 }}>
                  {b.name}
                </h3>
                <p style={{ fontFamily: SERIF, fontSize: 15, color: b.color, marginBottom: 12, fontStyle: 'italic' }}>
                  {b.tagline}
                </p>
                <p style={{ fontFamily: SERIF, fontSize: 15, color: C.creamDim, lineHeight: 1.9, marginBottom: 14 }}>
                  {b.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {b.worries.map(w => (
                    <span key={w} style={{
                      fontFamily: SERIF, fontSize: 13,
                      background: `${b.color}22`, color: b.color,
                      padding: '4px 10px', border: `1px solid ${b.color}44`,
                    }}>
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// MAP SCREEN
// ══════════════════════════════════════════════════════════════════

function MapScreen({ buddyId, progress, onSelectPhil, onBoss }: {
  buddyId: string; progress: Record<string, PhilProgress>
  onSelectPhil: (id: string) => void; onBoss: () => void
}) {
  const [vis, setVis] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const buddy = getBuddy(buddyId)
  if (!buddy) return null
  const phils = getPhilosophersByBuddy(buddyId)

  const getBadge = (p: PhilProgress | undefined) => {
    if (!p) return ''
    if (p.quizzed && p.deep) return '⭐'
    if (p.quizzed) return '✓'
    if (p.talked)  return '📖'
    return ''
  }

  const quizzedCount = buddy.philosophers.filter(id => progress[id]?.quizzed).length
  const bossUnlocked = quizzedCount >= 4

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '68px 20px 100px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ marginBottom: 36, opacity: vis ? 1 : 0, transition: 'opacity .8s ease' }}>
          <p style={{ fontFamily: PIXEL, fontSize: 8, color: C.tealLight, letterSpacing: 3, marginBottom: 12 }}>MAP</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{buddy.icon}</span>
            <div>
              <h2 style={{ fontFamily: SERIF, fontSize: 26, color: buddy.color, fontWeight: 400 }}>{buddy.name}ルート</h2>
              <p style={{ fontFamily: SERIF, fontSize: 15, color: C.creamDim }}>クリア: {quizzedCount} / {buddy.philosophers.length}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div style={{ width: 120, height: 6, background: C.tealDim, border: `1px solid ${C.border}` }}>
                <div style={{ height: '100%', width: `${(quizzedCount / buddy.philosophers.length) * 100}%`, background: buddy.color, transition: 'width .8s ease' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all .9s ease .15s',
        }}>
          {phils.map((p, i) => {
            const prog  = progress[p.id]
            const badge = getBadge(prog)
            const locked = p.unlockFrom !== null && !progress[p.unlockFrom]?.quizzed
            return (
              <button key={p.id} onClick={() => !locked && onSelectPhil(p.id)} disabled={locked}
                style={{
                  background: locked ? `${C.panel}80` : C.panel,
                  border: `2px solid ${prog?.quizzed ? p.color : C.border}`,
                  padding: '20px 22px', textAlign: 'left',
                  cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.45 : 1,
                  display: 'flex', alignItems: 'center', gap: 18,
                  animation: vis ? `slideIn .4s ease ${i * .08}s both` : 'none',
                }}
              >
                <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.textDim, minWidth: 22 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontSize: 30, minWidth: 100, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {locked ? '🔒' : !imgErrors[p.id] ? (
                    <img
                      src={`/illustrations/${p.id}.png`}
                      alt={p.name}
                      onError={() => setImgErrors(prev => ({ ...prev, [p.id]: true }))}
                      style={{ width: 100, height: 100, objectFit: 'contain' }}
                    />
                  ) : p.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: PIXEL, fontSize: 7, color: p.color, letterSpacing: 1, marginBottom: 5 }}>
                    {p.nameEn.toUpperCase()}
                  </p>
                  <p style={{ fontFamily: SERIF, fontSize: 20, color: C.cream, marginBottom: 4 }}>{p.name}</p>
                  <p style={{ fontFamily: SERIF, fontSize: 14, color: C.creamDim, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {locked ? `「${getPhilosopher(p.unlockFrom!)?.name}」をクリアして解放` : p.tagline}
                  </p>
                </div>
                {badge ? (
                  <span style={{ fontSize: 22, minWidth: 30, textAlign: 'center' }}>{badge}</span>
                ) : !locked ? (
                  <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.tealLight }}>▶ GO</span>
                ) : null}
              </button>
            )
          })}

          {/* Boss */}
          <div style={{
            marginTop: 16,
            border: bossUnlocked ? `2px solid ${buddy.color}` : `2px solid ${C.border}`,
            background: bossUnlocked ? `${buddy.color}14` : `${C.panel}60`,
            padding: '22px', opacity: bossUnlocked ? 1 : 0.4,
            animation: bossUnlocked ? 'pulse-border 2s ease-in-out infinite' : 'none',
          }}>
            {bossUnlocked ? (
              <button onClick={onBoss} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 18 }}>
                <span style={{ fontSize: 40 }}>{getBoss(buddy.bossId)?.sprite ?? '💀'}</span>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: PIXEL, fontSize: 7, color: C.red, letterSpacing: 2, marginBottom: 6 }}>BOSS  BATTLE</p>
                  <p style={{ fontFamily: SERIF, fontSize: 21, color: C.cream }}>
                    {getBoss(buddy.bossId)?.name} —— {getBoss(buddy.bossId)?.title}
                  </p>
                </div>
                <span style={{ marginLeft: 'auto', fontFamily: PIXEL, fontSize: 9, color: C.red }}>▶ FIGHT</span>
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 28 }}>🔒</span>
                <div>
                  <p style={{ fontFamily: PIXEL, fontSize: 7, color: C.textDim, letterSpacing: 2, marginBottom: 4 }}>BOSS  LOCKED</p>
                  <p style={{ fontFamily: SERIF, fontSize: 15, color: C.creamDim }}>{buddy.philosophers.length}人中4人以上クリアで解放</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// STORY SCREEN
// ══════════════════════════════════════════════════════════════════

function StoryScreen({ philId, progress, onUpdateProgress, onGoDeep, onBack }: {
  philId: string; progress: PhilProgress
  onUpdateProgress: (u: Partial<PhilProgress>) => void
  onGoDeep: () => void; onBack: () => void
}) {
  const p = getPhilosopher(philId)!

  const startPhase = useCallback((): StoryPhase => {
    if (progress.quizzed && progress.deep) return 'complete'
    if (progress.quizzed && !progress.deep) return 'goto_deep'
    if (progress.talked  && !progress.quizzed) return 'quiz'
    return 'dialogue'
  }, [progress])

  const [phase,     setPhase]     = useState<StoryPhase>(() => startPhase())
  const [lineIdx,   setLineIdx]   = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing,    setTyping]    = useState(false)
  const [quizIdx,   setQuizIdx]   = useState(0)
  const [selected,  setSelected]  = useState<number | null>(null)
  const [answered,  setAnswered]  = useState(false)
  const [score,     setScore]     = useState(0)
  const [shuffledQuizzes] = useState<Quiz[]>(() => p.quizzes.map(shuffleQuizOptions))
  const [imgError,   setImgError]   = useState(false)
  const [videoError, setVideoError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentLine = p.dialogue[lineIdx] ?? ''

  useEffect(() => {
    if (phase !== 'dialogue') return
    setDisplayed(''); setTyping(true)
    let i = 0
    const tick = () => {
      i++
      setDisplayed(currentLine.slice(0, i))
      if (i < currentLine.length) { timerRef.current = setTimeout(tick, 28) }
      else { setTyping(false) }
    }
    timerRef.current = setTimeout(tick, 28)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [phase, lineIdx, currentLine])

  const skipType = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setDisplayed(currentLine); setTyping(false)
  }

  const nextLine = () => {
    if (typing) { skipType(); return }
    if (lineIdx < p.dialogue.length - 1) { setLineIdx(l => l + 1) }
    else { onUpdateProgress({ talked: true }); setPhase('quiz') }
  }

  const currentQuiz: Quiz = shuffledQuizzes[quizIdx]!

  const selectAnswer = (idx: number) => {
    if (answered) return
    setSelected(idx); setAnswered(true)
    if (idx === currentQuiz.correct) setScore(s => s + 1)
  }

  const nextQuiz = () => {
    if (quizIdx < p.quizzes.length - 1) {
      setQuizIdx(q => q + 1); setSelected(null); setAnswered(false)
    } else {
      onUpdateProgress({ quizzed: true }); setPhase('result')
    }
  }

  if (!p) return null

  // ── COMPLETE
  if (phase === 'complete') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: 80 }}>
      <p style={{ fontSize: 64, marginBottom: 20 }}>⭐</p>
      <p style={{ fontFamily: PIXEL, fontSize: 10, color: p.color, letterSpacing: 2, marginBottom: 12 }}>COMPLETE!</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 28, color: C.cream, marginBottom: 10 }}>{p.name}</h2>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: C.creamDim, marginBottom: 32 }}>会話・クイズ・深掘りをすべて完了しました</p>
      <PixelBtn onClick={onBack}>← マップに戻る</PixelBtn>
    </div>
  )

  // ── GOTO DEEP
  if (phase === 'goto_deep') return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 52, marginBottom: 20 }}>{p.icon}</p>
      <p style={{ fontFamily: PIXEL, fontSize: 9, color: C.tealLight, letterSpacing: 2, marginBottom: 16 }}>DEEP TEXT UNLOCKED</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 26, color: C.cream, marginBottom: 14 }}>{p.name}の深掘りテキスト</h2>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: C.creamDim, marginBottom: 14, maxWidth: 400, lineHeight: 2, fontStyle: 'italic' }}>
        「{p.quote}」
      </p>
      <p style={{ fontFamily: SERIF, fontSize: 15, color: C.creamDim, marginBottom: 36 }}>
        深掘りを読了するとボスバトルでボーナスダメージを与えられます
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onGoDeep} style={{
          fontFamily: PIXEL, fontSize: 10, background: C.amberDim, border: `2px solid ${C.amber}`,
          color: C.cream, padding: '14px 28px', cursor: 'pointer',
        }}>▶ 深掘りを読む</button>
        <PixelBtn onClick={onBack}>← マップに戻る</PixelBtn>
      </div>
    </div>
  )

  // ── DIALOGUE
  if (phase === 'dialogue') return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, display: 'flex', flexDirection: 'column' }}>

      {/* ── nav 高さ分スペーサー ── */}
      <div style={{ height: 48, flexShrink: 0 }} />

      {/* ── キャラクターエリア（テキストと重ならない独立ゾーン） ── */}
      <div style={{
        flex: '0 0 54%',
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at center, ${p.color}20 0%, transparent 65%)`,
      }}>
        {/* 動画（/public/videos/[id].mp4 を置くと自動で表示） */}
        {!videoError && (
          <video
            key={p.id}
            autoPlay loop muted playsInline
            onError={() => setVideoError(true)}
            className="dialogue-video"
          >
            <source src={`/videos/${p.id}.mp4`} type="video/mp4"
              onError={() => setVideoError(true)} />
          </video>
        )}

        {/* 画像フォールバック（動画なし時） */}
        {videoError && (
          !imgError ? (
            <img
              src={`/illustrations/${p.id}.png`}
              alt={p.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center 20%',
                animation: 'bob 3s ease-in-out infinite',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(80px,18vw,140px)',
              animation: 'bob 3s ease-in-out infinite',
            }}>
              {p.icon}
            </div>
          )
        )}
      </div>

      {/* ── テキストパネル（キャラエリアの下、オーバーレイなし） ── */}
      <div style={{
        flex: 1,
        background: 'rgba(4,12,12,.96)',
        borderTop: `2px solid ${p.color}55`,
        padding: '12px 20px 10px',
        display: 'flex', flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Speaker name */}
        <div style={{
          fontFamily: PIXEL, fontSize: 8, color: p.color,
          letterSpacing: 2, marginBottom: 8, flexShrink: 0,
          borderBottom: `1px solid ${p.color}44`, paddingBottom: 7,
        }}>
          {p.name}  <span style={{ opacity: 0.6 }}>/{p.nameEn}/</span>
        </div>

        {/* Dialogue text — スクロール可能 */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, marginBottom: 8 }}>
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(15px,2.6vw,19px)',
            color: C.cream, lineHeight: 1.9,
          }}>
            {displayed}
            {typing && (
              <span style={{ animation: 'blink-a .7s step-end infinite', color: C.tealLight }}>▌</span>
            )}
          </p>
        </div>

        {/* Progress dots + NEXT button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {p.dialogue.map((_, i) => (
              <div key={i} style={{
                width: i === lineIdx ? 14 : 6, height: 6,
                background: i <= lineIdx ? p.color : C.tealDim,
                borderRadius: 3, transition: 'width .3s',
              }} />
            ))}
          </div>

          {/* NEXT ボタン */}
          <button onClick={nextLine} style={{
            fontFamily: PIXEL, fontSize: 11, letterSpacing: 2,
            color: typing ? C.textDim : C.bg,
            background: typing
              ? 'transparent'
              : `linear-gradient(135deg, ${p.color}cc, ${p.color})`,
            border: `2px solid ${typing ? C.tealDim : p.color}`,
            padding: '10px 22px',
            cursor: 'pointer',
            boxShadow: typing ? 'none' : `0 0 14px ${p.color}66`,
            transition: 'all .2s',
            minWidth: 120,
          }}>
            {typing
              ? 'SKIP'
              : lineIdx < p.dialogue.length - 1
                ? 'NEXT ▶'
                : 'QUIZ ▶'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── QUIZ
  if (phase === 'quiz') return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: 48, left: 0, right: 0, bottom: '62%',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: `radial-gradient(ellipse at center bottom, ${p.color}14 0%, transparent 70%)`, opacity: 0.85,
      }}>
        {!imgError ? (
          <img
            src={`/illustrations/${p.id}.png`}
            alt={p.name}
            onError={() => setImgError(true)}
            style={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', objectPosition: 'bottom center' }}
          />
        ) : (
          <div style={{ fontSize: 'clamp(48px,12vw,80px)', paddingBottom: 8 }}>{p.icon}</div>
        )}
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '62%',
        background: 'rgba(5,14,14,.60)', backdropFilter: 'blur(12px)',
        borderTop: `2px solid ${C.border}`, padding: '18px 24px',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.tealLight, letterSpacing: 2 }}>QUIZ {quizIdx + 1} / {p.quizzes.length}</span>
          <span style={{ fontFamily: PIXEL, fontSize: 8, color: p.color }}>{p.name}</span>
        </div>
        <p style={{ fontFamily: SERIF, fontSize: 'clamp(15px,2.2vw,18px)', color: C.cream, lineHeight: 1.9, marginBottom: 18, animation: 'fadeSlide .4s ease' }}>
          {currentQuiz.q}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {currentQuiz.options.map((opt, i) => {
            const isCorrect = i === currentQuiz.correct, isSelected = i === selected
            let bg = C.tealDim, border = C.border, color = C.text
            if (answered) {
              if (isCorrect)       { bg = `${C.green}44`; border = C.green; color = '#8adc8a' }
              else if (isSelected) { bg = `${C.red}33`;   border = C.red;   color = '#e08070' }
              else                 { bg = 'transparent';  color = C.textDim }
            }
            return (
              <button key={i} onClick={() => selectAnswer(i)} disabled={answered}
                style={{
                  background: bg, border: `2px solid ${border}`, color,
                  padding: '12px 16px', cursor: answered ? 'default' : 'pointer',
                  textAlign: 'left', fontFamily: SERIF, fontSize: 15,
                  lineHeight: 1.6, transition: 'all .2s',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                }}
              >
                <span style={{ fontFamily: PIXEL, fontSize: 8, minWidth: 16, marginTop: 3 }}>
                  {answered && isCorrect ? '✓' : answered && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
        {answered && (
          <div style={{ marginTop: 14, animation: 'fadeSlide .3s ease' }}>
            <p style={{
              fontFamily: SERIF, fontSize: 14, color: C.creamDim, lineHeight: 1.9, marginBottom: 12,
              borderLeft: `2px solid ${selected === currentQuiz.correct ? C.green : C.amber}`, paddingLeft: 12,
            }}>
              {currentQuiz.explanation}
            </p>
            <div style={{ textAlign: 'right' }}>
              <PixelBtn onClick={nextQuiz} color={C.amber}>
                {quizIdx < p.quizzes.length - 1 ? 'NEXT QUIZ ▶' : 'RESULT ▶'}
              </PixelBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── RESULT
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center', paddingTop: 80, animation: 'fadeSlide .5s ease' }}>
      <p style={{ fontSize: 60, marginBottom: 18 }}>{p.icon}</p>
      <p style={{ fontFamily: PIXEL, fontSize: 9, color: p.color, letterSpacing: 2, marginBottom: 14 }}>QUIZ  CLEAR!</p>
      <h2 style={{ fontFamily: SERIF, fontSize: 26, color: C.cream, marginBottom: 10 }}>{p.name}</h2>
      <p style={{ fontFamily: SERIF, fontSize: 32, color: C.amber, marginBottom: 8 }}>{score} / {p.quizzes.length}</p>
      <p style={{ fontFamily: SERIF, fontSize: 16, color: C.creamDim, marginBottom: 36, maxWidth: 380, lineHeight: 2, fontStyle: 'italic' }}>
        「{p.quote}」
      </p>
      <PixelBox style={{ padding: '22px 26px', marginBottom: 28, maxWidth: 460, width: '100%' }}>
        <p style={{ fontFamily: PIXEL, fontSize: 8, color: C.tealLight, letterSpacing: 2, marginBottom: 14 }}>DEEP  TEXT</p>
        <p style={{ fontFamily: SERIF, fontSize: 15, color: C.creamDim, lineHeight: 1.9, marginBottom: 18 }}>
          {p.name}の思想をさらに深く読むことで、<br />ボスバトルでボーナスダメージを与えられます。
        </p>
        <button onClick={onGoDeep} style={{
          width: '100%', fontFamily: PIXEL, fontSize: 10,
          background: C.amberDim, border: `2px solid ${C.amber}`,
          color: C.cream, padding: '14px', cursor: 'pointer',
        }}>▶ 深掘りテキストを読む</button>
      </PixelBox>
      <PixelBtn onClick={onBack}>← マップに戻る</PixelBtn>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// DEEP TEXT SCREEN
// ══════════════════════════════════════════════════════════════════

function DeepTextScreen({ philId, onComplete, onBack }: {
  philId: string; onComplete: () => void; onBack: () => void
}) {
  const p = getPhilosopher(philId)!
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const sections = p.deepDive

  const [readSections, setReadSections] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState<number | null>(null)

  const toggleSection = (i: number) => {
    setExpanded(e => e === i ? null : i)
    setReadSections(s => { const n = new Set(s); n.add(i); return n })
  }

  const allRead = readSections.size >= sections.length

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '68px 20px 80px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 32, opacity: vis ? 1 : 0, transition: 'opacity .8s ease' }}>
          <button onClick={onBack} style={{
            fontFamily: PIXEL, fontSize: 8, color: C.textDim,
            background: 'transparent', border: `1px solid ${C.border}`,
            padding: '8px 16px', cursor: 'pointer', marginBottom: 24,
          }}>← 戻る</button>
          <p style={{ fontFamily: PIXEL, fontSize: 8, color: p.color, letterSpacing: 2, marginBottom: 14 }}>DEEP  TEXT</p>
          <h2 style={{ fontFamily: SERIF, fontSize: 28, color: C.cream, fontWeight: 400, marginBottom: 10 }}>{p.icon} {p.name}</h2>
          <p style={{ fontFamily: SERIF, fontSize: 16, color: C.creamDim, marginBottom: 16 }}>{p.tagline}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 4, background: C.tealDim }}>
              <div style={{ height: '100%', width: `${(readSections.size / sections.length) * 100}%`, background: p.color, transition: 'width .5s ease' }} />
            </div>
            <span style={{ fontFamily: PIXEL, fontSize: 7, color: C.textDim }}>{readSections.size}/{sections.length}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: vis ? 1 : 0, transition: 'opacity .9s ease .2s' }}>
          {sections.map((sec, i) => (
            <div key={i}>
              <button onClick={() => toggleSection(i)} style={{
                width: '100%', background: expanded === i ? `${p.color}18` : C.panel,
                border: `2px solid ${readSections.has(i) ? p.color : C.border}`,
                padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontFamily: PIXEL, fontSize: 8, color: readSections.has(i) ? p.color : C.textDim }}>
                  {readSections.has(i) ? '✓' : String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontFamily: SERIF, fontSize: 18, color: C.cream }}>{sec.title}</span>
                <span style={{ marginLeft: 'auto', color: C.textDim, fontSize: 14 }}>{expanded === i ? '▲' : '▼'}</span>
              </button>
              {expanded === i && (
                <div style={{
                  background: `${C.panel}cc`, border: `2px solid ${p.color}55`,
                  borderTop: 'none', padding: '22px 20px', animation: 'fadeSlide .3s ease',
                }}>
                  {sec.body.split('\n\n').map((para, pi) => (
                    <p key={pi} style={{
                      fontFamily: SERIF, fontSize: 16, color: C.cream,
                      lineHeight: 2.1, marginBottom: pi < sec.body.split('\n\n').length - 1 ? 20 : 0,
                      whiteSpace: 'pre-line',
                    }}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {allRead && (
          <div style={{ marginTop: 32, textAlign: 'center', animation: 'fadeSlide .5s ease' }}>
            <p style={{ fontFamily: SERIF, fontSize: 15, color: C.creamDim, marginBottom: 20 }}>
              すべてのセクションを読了しました。ボスバトルにボーナスダメージが追加されます。
            </p>
            <button onClick={onComplete} style={{
              fontFamily: PIXEL, fontSize: 10, background: C.amberDim,
              border: `2px solid ${C.amber}`, color: C.cream,
              padding: '14px 32px', cursor: 'pointer', letterSpacing: 1,
            }}>✓ 読了完了</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// BOSS SCREEN
// ══════════════════════════════════════════════════════════════════

function BossScreen({ buddyId, quizzedIds, getReadBonus, onWin, onLose }: {
  buddyId: string; quizzedIds: string[]; getReadBonus: () => number
  onWin: () => void; onLose: () => void
}) {
  const buddy = getBuddy(buddyId)!
  const boss  = getBoss(buddy.bossId)!

  const buildPool = useCallback((): Quiz[] => {
    const pool: Quiz[] = []
    for (const id of quizzedIds) {
      const phil = getPhilosopher(id)
      if (phil) pool.push(...phil.quizzes.map(shuffleQuizOptions))
    }
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]]
    }
    while (pool.length < 10) pool.push(...pool.slice(0, 10 - pool.length))
    return pool.slice(0, 10)
  }, [quizzedIds])

  const readBonus   = getReadBonus()
  const maxHP       = 10 - readBonus
  const [hp,        setHp]       = useState(maxHP)
  const [questions] = useState<Quiz[]>(() => buildPool())
  const [qIdx,      setQIdx]     = useState(0)
  const [selected,  setSelected] = useState<number | null>(null)
  const [answered,  setAnswered] = useState(false)
  const [done,      setDone]     = useState(false)
  const [shake,     setShake]    = useState(false)
  const [vis,       setVis]      = useState(false)

  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t) }, [])

  const currentQ = questions[qIdx]!

  const selectAnswer = (idx: number) => {
    if (answered || done) return
    setSelected(idx); setAnswered(true)
    if (idx === currentQ.correct) {
      const next = hp - 1
      setHp(next)
      if (next <= 0) { setDone(true); setTimeout(onWin, 1200) }
    } else {
      setShake(true); setTimeout(() => setShake(false), 500)
    }
  }

  const nextQ = () => {
    if (qIdx >= questions.length - 1) {
      setDone(true)
      setTimeout(hp <= 0 ? onWin : onLose, 800)
      return
    }
    setQIdx(q => q + 1); setSelected(null); setAnswered(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '68px 20px 60px', opacity: vis ? 1 : 0, transition: 'opacity .6s ease' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: 24,
          animation: done ? undefined : 'pulse-border 2.5s ease-in-out infinite',
          border: `2px solid ${C.red}`, padding: '22px',
          background: `${C.hpBg}cc`,
        }}>
          <p style={{ fontFamily: PIXEL, fontSize: 8, color: C.red, letterSpacing: 3, marginBottom: 12 }}>BOSS  BATTLE</p>
          <div style={{ fontSize: 60, marginBottom: 10, transform: shake ? 'translateX(8px)' : 'none', transition: 'transform .1s', display: 'inline-block' }}>
            {boss.sprite}
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: 24, color: C.red, marginBottom: 6 }}>
            {boss.name} —— {boss.title}
          </h2>
          <div style={{ maxWidth: 540, margin: '14px auto 16px' }}>
            <HPBar current={hp} max={maxHP} />
          </div>
          {readBonus > 0 && (
            <p style={{ fontFamily: PIXEL, fontSize: 7, color: C.amber, letterSpacing: 1 }}>
              ★ BONUS: -{readBonus} HP (深掘り読了ボーナス)
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontFamily: PIXEL, fontSize: 8, color: C.textDim }}>Q {qIdx + 1} / {questions.length}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {questions.map((_, i) => (
              <div key={i} style={{ width: 8, height: 8, background: i < qIdx ? C.green : i === qIdx ? C.amber : C.tealDim, border: `1px solid ${C.border}` }} />
            ))}
          </div>
        </div>

        <PixelBox style={{ padding: '22px', marginBottom: 18 }}>
          <p style={{ fontFamily: SERIF, fontSize: 'clamp(15px,2.2vw,18px)', color: C.cream, lineHeight: 1.9 }}>
            {currentQ.q}
          </p>
        </PixelBox>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {currentQ.options.map((opt, i) => {
            const isCorrect = i === currentQ.correct, isSelected = i === selected
            let bg = C.tealDim, border = C.border, color = C.text
            if (answered) {
              if (isCorrect)       { bg = `${C.green}44`; border = C.green; color = '#8adc8a' }
              else if (isSelected) { bg = `${C.red}33`;   border = C.red;   color = '#e08070' }
              else                 { bg = 'transparent';  color = C.textDim }
            }
            return (
              <button key={i} onClick={() => selectAnswer(i)} disabled={answered}
                style={{
                  background: bg, border: `2px solid ${border}`, color,
                  padding: '14px 18px', textAlign: 'left', fontFamily: SERIF, fontSize: 16,
                  lineHeight: 1.6, cursor: answered ? 'default' : 'pointer',
                  display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all .2s',
                }}
              >
                <span style={{ fontFamily: PIXEL, fontSize: 8, minWidth: 16, marginTop: 3 }}>
                  {answered && isCorrect ? '✓' : answered && isSelected && !isCorrect ? '✗' : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {answered && (
          <div style={{ animation: 'fadeSlide .3s ease' }}>
            <p style={{ fontFamily: SERIF, fontSize: 14, color: C.creamDim, lineHeight: 1.9, marginBottom: 16, borderLeft: `2px solid ${selected === currentQ.correct ? C.green : C.amber}`, paddingLeft: 14 }}>
              {currentQ.explanation}
            </p>
            {!done && (
              <div style={{ textAlign: 'right' }}>
                <PixelBtn onClick={nextQ} color={hp <= 0 ? C.amber : C.red} style={{ fontSize: 9 }}>
                  {hp <= 0 ? '🏆 VICTORY!' : qIdx >= questions.length - 1 ? 'FINISH ▶' : 'NEXT ▶'}
                </PixelBtn>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ENDING SCREEN
// ══════════════════════════════════════════════════════════════════

function EndingScreen({ buddyId, won, onNext }: {
  buddyId: string; won: boolean; onNext: () => void
}) {
  const buddy = getBuddy(buddyId)!
  const boss  = getBoss(buddy.bossId)!
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), 200); return () => clearTimeout(t) }, [])

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', textAlign: 'center',
      opacity: vis ? 1 : 0, transition: 'opacity 1s ease',
    }}>
      <p style={{ fontSize: won ? 72 : 52, marginBottom: 22 }}>{won ? '🏆' : '💀'}</p>
      <p style={{ fontFamily: PIXEL, fontSize: 10, color: won ? C.amber : C.red, letterSpacing: 3, marginBottom: 22 }}>
        {won ? 'VICTORY!' : 'DEFEAT...'}
      </p>
      <h2 style={{ fontFamily: SERIF, fontSize: 28, color: C.cream, fontWeight: 400, marginBottom: 14 }}>
        {won ? `${boss.name}を倒した！` : `${boss.name}に敗れた...`}
      </h2>
      <p style={{ fontFamily: SERIF, fontSize: 17, color: C.creamDim, lineHeight: 2.1, maxWidth: 460, marginBottom: 48, whiteSpace: 'pre-line' }}>
        {won
          ? `${buddy.name}バディとの旅が完結しました。\n${boss.title}に打ち勝ち、あなたは哲学の智慧を手にした。`
          : `もう一度哲学者たちと語り、深掘りテキストを読んで再挑戦しよう。\n智慧は一夜にして身につかない。`}
      </p>
      <PixelBtn onClick={onNext} color={C.amber} style={{ fontSize: 11, padding: '14px 32px' }}>
        {won ? '▶ TITLE へ' : '↩ マップに戻る'}
      </PixelBtn>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════════

export default function Page() {
  const gs = useGameState()
  const [won, setWon] = useState(false)

  const { screen, setScreen, buddy, hasSave, progress, newGame, loadGame, getPhilProgress, updateProgress, markDeepRead, getReadBonus, quizzedIds } = gs

  const goMap   = () => setScreen('map')
  const goTitle = () => setScreen('title')
  const goBoss  = () => setScreen('boss')

  // Manual save
  const handleSave = useCallback(() => {
    try {
      const raw = localStorage.getItem('philo_save_v1')
      if (raw) {
        const data = JSON.parse(raw)
        localStorage.setItem('philo_save_v1', JSON.stringify({ ...data, buddy, progress }))
      }
    } catch { /* noop */ }
  }, [buddy, progress])

  const storyPhilId = screen.startsWith('story_') ? screen.slice(6) : null
  const deepPhilId  = screen.startsWith('deep_')  ? screen.slice(5) : null

  return (
    <>
      <GlobalNav screen={screen} onMap={goMap} onSave={handleSave} />

      {screen === 'title' && (
        <TitleScreen hasSave={hasSave} onNew={() => setScreen('prologue')} onContinue={loadGame} />
      )}
      {screen === 'prologue' && (
        <PrologueScreen onStart={() => setScreen('buddy')} />
      )}
      {screen === 'buddy' && (
        <BuddySelectScreen onSelect={id => newGame(id as never)} />
      )}
      {screen === 'map' && buddy && (
        <MapScreen buddyId={buddy} progress={progress} onSelectPhil={id => setScreen(`story_${id}`)} onBoss={goBoss} />
      )}
      {storyPhilId && buddy && (
        <StoryScreen
          philId={storyPhilId}
          progress={getPhilProgress(storyPhilId)}
          onUpdateProgress={u => updateProgress(storyPhilId, u)}
          onGoDeep={() => setScreen(`deep_${storyPhilId}`)}
          onBack={goMap}
        />
      )}
      {deepPhilId && buddy && (
        <DeepTextScreen
          philId={deepPhilId}
          onComplete={() => { markDeepRead(deepPhilId); goMap() }}
          onBack={() => setScreen(`story_${deepPhilId}`)}
        />
      )}
      {screen === 'boss' && buddy && (
        <BossScreen
          buddyId={buddy}
          quizzedIds={quizzedIds}
          getReadBonus={getReadBonus}
          onWin={() => { setWon(true); setScreen('ending') }}
          onLose={() => { setWon(false); setScreen('ending') }}
        />
      )}
      {screen === 'ending' && buddy && (
        <EndingScreen buddyId={buddy} won={won} onNext={won ? goTitle : goMap} />
      )}
    </>
  )
}
