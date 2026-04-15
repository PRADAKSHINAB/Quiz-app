// Sound effects using Web Audio API - zero external dependencies

let _ctx = null

function getCtx() {
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch (_) {
      return null
    }
  }
  if (_ctx.state === "suspended") _ctx.resume()
  return _ctx
}

function playTone(frequency, duration, type = "sine", gainValue = 0.3) {
  const ctx = getCtx()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(gainValue, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + duration)
}

export const sounds = {
  correct() {
    // Happy ascending chord
    const ctx = getCtx()
    if (!ctx) return
    ;[523.25, 659.25, 783.99].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.35, "sine", 0.25), i * 60)
    })
  },

  wrong() {
    // Descending dissonance
    const ctx = getCtx()
    if (!ctx) return
    playTone(220, 0.25, "sawtooth", 0.15)
    setTimeout(() => playTone(196, 0.3, "sawtooth", 0.12), 100)
  },

  click() {
    playTone(880, 0.05, "sine", 0.1)
  },

  next() {
    // Soft whoosh
    const ctx = getCtx()
    if (!ctx) return
    playTone(600, 0.12, "sine", 0.12)
    setTimeout(() => playTone(800, 0.1, "sine", 0.08), 80)
  },

  complete() {
    // Victory fanfare
    const ctx = getCtx()
    if (!ctx) return
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.5, "sine", 0.3)
        playTone(freq * 1.25, 0.5, "triangle", 0.1)
      }, i * 120)
    })
  },

  countdown() {
    playTone(440, 0.15, "sine", 0.2)
  },

  levelUp() {
    const ctx = getCtx()
    if (!ctx) return
    ;[523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.4, "triangle", 0.2), i * 80)
    })
  },

  tick() {
    playTone(1200, 0.03, "square", 0.05)
  },
}
