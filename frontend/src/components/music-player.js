"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Volume2, VolumeX, Music, ChevronUp, ChevronDown, Music2 } from "lucide-react"

// Procedurally generated ambient music using Web Audio API
// No external files needed — pure synthesized sounds

export function MusicPlayer({ autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [isMuted, setIsMuted] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [mounted, setMounted] = useState(false)

  const audioCtxRef = useRef(null)
  const gainNodeRef = useRef(null)
  const nodesRef = useRef([])
  const intervalRef = useRef(null)
  const noteIndexRef = useRef(0)

  const TRACKS = [
    { name: "Focus Flow", emoji: "🎯", color: "from-violet-500 to-purple-600" },
    { name: "Deep Think", emoji: "🧠", color: "from-cyan-500 to-blue-600" },
    { name: "Quiz Zen", emoji: "✨", color: "from-amber-500 to-orange-500" },
  ]

  // Note frequencies for ambient melodies
  const MELODIES = [
    // Track 0 - Calm arp (C maj pentatonic)
    [261.63, 329.63, 392.0, 523.25, 659.25, 523.25, 392.0, 329.63],
    // Track 1 - Dreamy (D min pentatonic)
    [293.66, 349.23, 440.0, 587.33, 698.46, 587.33, 440.0, 349.23],
    // Track 2 - Upbeat (G maj pentatonic)
    [392.0, 493.88, 587.33, 784.0, 987.77, 784.0, 587.33, 493.88],
  ]

  const stopMusic = useCallback(() => {
    nodesRef.current.forEach((n) => { try { n.stop(); n.disconnect() } catch (_) {} })
    nodesRef.current = []
    clearInterval(intervalRef.current)
    setIsPlaying(false)
  }, [])

  const playNote = useCallback((freq, time, duration = 0.4) => {
    const ctx = audioCtxRef.current
    const gain = gainNodeRef.current
    if (!ctx || !gain) return

    const osc = ctx.createOscillator()
    const env = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, time)

    // Subtle vibrato
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 5
    lfoGain.gain.value = 2
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start(time)
    lfo.stop(time + duration + 0.1)

    env.gain.setValueAtTime(0, time)
    env.gain.linearRampToValueAtTime(0.15, time + 0.05)
    env.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc.connect(env)
    env.connect(gain)

    osc.start(time)
    osc.stop(time + duration + 0.05)
    nodesRef.current.push(osc)

    // Add harmonics for richness
    const osc2 = ctx.createOscillator()
    const env2 = ctx.createGain()
    osc2.type = "triangle"
    osc2.frequency.setValueAtTime(freq * 2, time)
    env2.gain.setValueAtTime(0, time)
    env2.gain.linearRampToValueAtTime(0.05, time + 0.05)
    env2.gain.exponentialRampToValueAtTime(0.001, time + duration * 0.7)
    osc2.connect(env2)
    env2.connect(gain)
    osc2.start(time)
    osc2.stop(time + duration)
    nodesRef.current.push(osc2)
  }, [])

  const startMusic = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === "suspended") ctx.resume()

      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain()
        gainNodeRef.current.connect(ctx.destination)
      }
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime)

      // Add reverb-like effect using delay
      const delay = ctx.createDelay(0.5)
      const delayGain = ctx.createGain()
      delay.delayTime.value = 0.3
      delayGain.gain.value = 0.2
      gainNodeRef.current.connect(delay)
      delay.connect(delayGain)
      delayGain.connect(ctx.destination)

      const melody = MELODIES[currentTrack]
      const BPM = 72
      const beat = 60 / BPM

      noteIndexRef.current = 0
      const scheduleNext = () => {
        const now = ctx.currentTime
        const freq = melody[noteIndexRef.current % melody.length]
        playNote(freq, now, beat * 0.85)
        // Occasionally play bass note
        if (noteIndexRef.current % 4 === 0) {
          playNote(freq / 2, now, beat * 2)
        }
        noteIndexRef.current++
      }
      scheduleNext()
      intervalRef.current = setInterval(scheduleNext, beat * 1000)
      setIsPlaying(true)
    } catch (e) {
      console.warn("Audio context error:", e)
    }
  }, [currentTrack, volume, isMuted, playNote])

  useEffect(() => {
    setMounted(true)
    return () => stopMusic()
  }, [stopMusic])

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      )
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (isPlaying) {
      stopMusic()
    } else {
      startMusic()
    }
  }

  const switchTrack = (idx) => {
    stopMusic()
    setCurrentTrack(idx)
    setTimeout(() => startMusic(), 100)
  }

  if (!mounted) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="music-panel glass-card rounded-2xl p-4 w-64 border border-violet-200/30 dark:border-violet-800/30 shadow-2xl shadow-violet-500/20 animate-slideUp">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${TRACKS[currentTrack].color} flex items-center justify-center text-sm`}>
              {TRACKS[currentTrack].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{TRACKS[currentTrack].name}</p>
              <p className="text-[10px] text-muted-foreground">{isPlaying ? "♪ Now playing..." : "Paused"}</p>
            </div>
          </div>

          {/* Track selector */}
          <div className="space-y-1.5 mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Tracks</p>
            {TRACKS.map((track, i) => (
              <button
                key={i}
                onClick={() => i !== currentTrack ? switchTrack(i) : null}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all duration-200 ${
                  i === currentTrack
                    ? "bg-violet-100 dark:bg-violet-500/20 border border-violet-300 dark:border-violet-600"
                    : "hover:bg-secondary border border-transparent"
                }`}
              >
                <span className="text-base">{track.emoji}</span>
                <span className="text-xs font-medium">{track.name}</span>
                {i === currentTrack && isPlaying && (
                  <span className="ml-auto flex gap-0.5">
                    {[0, 1, 2].map(b => (
                      <span key={b} className="w-0.5 bg-violet-500 rounded-full animate-equalizer" style={{ animationDelay: `${b * 0.15}s`, height: '12px' }} />
                    ))}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Volume</p>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => { setIsMuted(false); setVolume(parseFloat(e.target.value)) }}
              className="w-full h-1.5 rounded-full accent-violet-600 cursor-pointer"
            />
          </div>

          {/* Sound effects note */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground text-center">🎵 Ambient synthesized audio<br/>Sound effects auto-play on answers</p>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <div className="flex items-center gap-2">
        {isPlaying && (
          <div className="flex gap-0.5 items-end h-5 mr-1">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-1 bg-violet-500 rounded-full animate-equalizer opacity-80" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-4 w-4 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
        <button
          onClick={togglePlay}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isPlaying
              ? "bg-gradient-to-br from-violet-600 to-purple-600 shadow-violet-500/40 scale-105"
              : "glass-card hover:shadow-violet-500/20"
          }`}
        >
          {isPlaying ? (
            <Music2 className="h-5 w-5 text-white animate-pulse" />
          ) : (
            <Music className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          )}
        </button>
      </div>
    </div>
  )
}
