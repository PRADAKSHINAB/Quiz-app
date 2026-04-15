const svgToDataUrl = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

const normalizeText = (value) => (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

const hashString = (value) => {
  const str = value || ""
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

const pick = (arr, seed) => arr[seed % arr.length]

// ─── Richer palettes ────────────────────────────────────────────────────────
const palettes = [
  { bgA: "#0f0c29", bgB: "#302b63", bgC: "#24243e", accent: "#a78bfa", accent2: "#7c3aed", glow: "rgba(167,139,250,0.35)" },
  { bgA: "#0c1445", bgB: "#1e3a6e", bgC: "#0f2554", accent: "#38bdf8", accent2: "#0ea5e9", glow: "rgba(56,189,248,0.35)" },
  { bgA: "#1a0533", bgB: "#3b0764", bgC: "#2d1b69", accent: "#f0abfc", accent2: "#d946ef", glow: "rgba(240,171,252,0.35)" },
  { bgA: "#052e16", bgB: "#166534", bgC: "#064e3b", accent: "#4ade80", accent2: "#16a34a", glow: "rgba(74,222,128,0.35)" },
  { bgA: "#431407", bgB: "#7c2d12", bgC: "#9a3412", accent: "#fb923c", accent2: "#ea580c", glow: "rgba(251,146,60,0.35)" },
  { bgA: "#0f172a", bgB: "#1e293b", bgC: "#0f2554", accent: "#60a5fa", accent2: "#2563eb", glow: "rgba(96,165,250,0.35)" },
  { bgA: "#18181b", bgB: "#27272a", bgC: "#1c1917", accent: "#fbbf24", accent2: "#d97706", glow: "rgba(251,191,36,0.35)" },
  { bgA: "#0d0d0d", bgB: "#1f2937", bgC: "#111827", accent: "#f472b6", accent2: "#db2777", glow: "rgba(244,114,182,0.35)" },
]

const paletteFor = ({ title, topic }) => pick(palettes, hashString(`${normalizeText(title)}|${normalizeText(topic)}`))

// ─── Shared SVG wrapper ──────────────────────────────────────────────────────
const wrap = (content, palette) => `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.bgA}"/>
      <stop offset="0.5" stop-color="${palette.bgC}"/>
      <stop offset="1" stop-color="${palette.bgB}"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="30%" r="50%">
      <stop offset="0" stop-color="${palette.glow}"/>
      <stop offset="1" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="80%" cy="70%" r="50%">
      <stop offset="0" stop-color="${palette.glow.replace("0.35", "0.2")}"/>
      <stop offset="1" stop-color="transparent"/>
    </radialGradient>
    <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="rgba(0,0,0,0.5)"/>
    </filter>
    <filter id="glow_filter">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="400" height="200" fill="url(#bg)"/>
  <rect width="400" height="200" fill="url(#glow1)"/>
  <rect width="400" height="200" fill="url(#glow2)"/>
  ${content}
</svg>
`

// ─── MATHEMATICS ────────────────────────────────────────────────────────────
const mathCoverSvg = ({ title, palette }) => wrap(`
  <!-- Floating math symbols -->
  <g opacity="0.15" fill="${palette.accent}" font-family="monospace" font-weight="900">
    <text x="10" y="30" font-size="28">∑</text>
    <text x="330" y="50" font-size="22">∫</text>
    <text x="15" y="100" font-size="18">π</text>
    <text x="345" y="140" font-size="24">√</text>
    <text x="30" y="165" font-size="16">∞</text>
    <text x="355" y="185" font-size="14">≠</text>
  </g>

  <!-- Central equation board -->
  <g filter="url(#shadow)">
    <rect x="60" y="30" width="280" height="130" rx="18" fill="rgba(255,255,255,0.06)" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
  </g>

  <!-- Math grid decoration left -->
  <g transform="translate(78, 50)" opacity="0.9">
    <rect x="0" y="0" width="72" height="72" rx="12" fill="rgba(255,255,255,0.05)" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <line x1="24" y1="0" x2="24" y2="72" stroke="${palette.accent}" stroke-width="0.5" stroke-opacity="0.2"/>
    <line x1="48" y1="0" x2="48" y2="72" stroke="${palette.accent}" stroke-width="0.5" stroke-opacity="0.2"/>
    <line x1="0" y1="24" x2="72" y2="24" stroke="${palette.accent}" stroke-width="0.5" stroke-opacity="0.2"/>
    <line x1="0" y1="48" x2="72" y2="48" stroke="${palette.accent}" stroke-width="0.5" stroke-opacity="0.2"/>
    <!-- glowing dots at intersections -->
    <circle cx="24" cy="24" r="3" fill="${palette.accent}" opacity="0.8"/>
    <circle cx="48" cy="24" r="3" fill="${palette.accent2}" opacity="0.8"/>
    <circle cx="24" cy="48" r="3" fill="${palette.accent2}" opacity="0.8"/>
    <circle cx="48" cy="48" r="3" fill="${palette.accent}" opacity="0.8"/>
  </g>

  <!-- Main formula text -->
  <g font-family="'Courier New', monospace" fill="${palette.accent}" filter="url(#glow_filter)">
    <text x="170" y="72" font-size="15" font-weight="700" fill="rgba(255,255,255,0.9)">f(x) = x² + 2x + 1</text>
    <text x="170" y="96" font-size="20" font-weight="900" fill="${palette.accent}">∫ dx = x + C</text>
    <text x="170" y="118" font-size="14" font-weight="700" fill="rgba(255,255,255,0.65)">π ≈ 3.14159...</text>
    <text x="170" y="138" font-size="13" font-weight="600" fill="rgba(255,255,255,0.5)">E = mc²</text>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">MATHEMATICS</text>
  </g>

  <!-- Decorative circles -->
  <circle cx="352" cy="38" r="18" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
  <circle cx="352" cy="38" r="10" fill="${palette.accent2}" fill-opacity="0.3"/>
  <circle cx="50" cy="160" r="12" fill="none" stroke="${palette.accent2}" stroke-width="1.5" stroke-opacity="0.3"/>
`, palette)

// ─── SCIENCE / PHYSICS / CHEMISTRY / BIOLOGY ────────────────────────────────
const scienceCoverSvg = ({ title, palette }) => wrap(`
  <!-- Atom diagram -->
  <g transform="translate(90, 100)" opacity="0.9">
    <!-- Orbit rings -->
    <ellipse cx="0" cy="0" rx="52" ry="22" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.7" stroke-dasharray="4 3"/>
    <ellipse cx="0" cy="0" rx="52" ry="22" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.7" stroke-dasharray="4 3" transform="rotate(60)"/>
    <ellipse cx="0" cy="0" rx="52" ry="22" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.7" stroke-dasharray="4 3" transform="rotate(120)"/>
    <!-- Nucleus -->
    <circle cx="0" cy="0" r="12" fill="${palette.accent}" opacity="0.3"/>
    <circle cx="0" cy="0" r="8" fill="${palette.accent2}" filter="url(#glow_filter)"/>
    <circle cx="0" cy="0" r="4" fill="rgba(255,255,255,0.9)"/>
    <!-- Electrons -->
    <circle cx="52" cy="0" r="4" fill="${palette.accent}" filter="url(#glow_filter)"/>
    <circle cx="-26" cy="19" r="4" fill="${palette.accent}" filter="url(#glow_filter)"/>
    <circle cx="-26" cy="-19" r="4" fill="${palette.accent}" filter="url(#glow_filter)"/>
  </g>

  <!-- Molecule chain right side -->
  <g transform="translate(240, 60)" opacity="0.8">
    <circle cx="30" cy="30" r="16" fill="${palette.accent2}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5"/>
    <text x="30" y="35" font-size="11" fill="white" text-anchor="middle" font-weight="800" font-family="monospace">H₂O</text>
    <line x1="46" y1="30" x2="70" y2="55" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.5"/>
    <circle cx="80" cy="60" r="13" fill="${palette.accent}" fill-opacity="0.25" stroke="${palette.accent2}" stroke-width="1.5"/>
    <text x="80" y="65" font-size="10" fill="white" text-anchor="middle" font-weight="800" font-family="monospace">O₂</text>
    <line x1="70" y1="55" x2="60" y2="85" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.5"/>
    <circle cx="50" cy="98" r="12" fill="${palette.accent2}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5"/>
    <text x="50" y="102" font-size="9" fill="white" text-anchor="middle" font-weight="800" font-family="monospace">CO₂</text>
  </g>

  <!-- Beaker icon top-right -->
  <g transform="translate(335, 20)" opacity="0.6">
    <path d="M0 0h20v30l12 28H-12L0 30V0z" fill="none" stroke="${palette.accent}" stroke-width="1.5"/>
    <path d="M-12 58c4-6 32-6 32 0" fill="${palette.accent}" fill-opacity="0.3"/>
    <line x1="0" y1="0" x2="20" y2="0" stroke="${palette.accent}" stroke-width="2"/>
    <circle cx="5" cy="40" r="3" fill="${palette.accent}" opacity="0.8"/>
    <circle cx="12" cy="48" r="2" fill="${palette.accent2}" opacity="0.8"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">SCIENCE</text>
  </g>

  <!-- Stars/particles -->
  <circle cx="40" cy="35" r="2" fill="${palette.accent}" opacity="0.6"/>
  <circle cx="360" cy="30" r="1.5" fill="${palette.accent2}" opacity="0.7"/>
  <circle cx="20" cy="150" r="2.5" fill="${palette.accent}" opacity="0.5"/>
  <circle cx="380" cy="150" r="2" fill="${palette.accent2}" opacity="0.6"/>
`, palette)

// ─── GEOGRAPHY / WORLD / COUNTRIES / CAPITALS ───────────────────────────────
const geographyCoverSvg = ({ title, palette }) => wrap(`
  <!-- Globe wireframe -->
  <g transform="translate(100, 100)">
    <circle cx="0" cy="0" r="65" fill="${palette.accent}" fill-opacity="0.08" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <!-- Latitude lines -->
    <ellipse cx="0" cy="0" rx="65" ry="24" fill="none" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.35" stroke-dasharray="3 2"/>
    <ellipse cx="0" cy="0" rx="65" ry="45" fill="none" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.25" stroke-dasharray="3 2"/>
    <!-- Longitude -->
    <line x1="-65" y1="0" x2="65" y2="0" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <line x1="0" y1="-65" x2="0" y2="65" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <!-- Continents simplified -->
    <path d="M-20 -30 Q-5 -45 15 -35 Q30 -25 25 -10 Q10 0 -5 -5 Q-20 -15 -20 -30z" fill="${palette.accent}" fill-opacity="0.4"/>
    <path d="M-40 10 Q-35 0 -20 5 Q-10 15 -25 25 Q-38 20 -40 10z" fill="${palette.accent2}" fill-opacity="0.4"/>
    <path d="M10 10 Q20 5 35 15 Q40 28 30 35 Q20 38 10 28 Q5 20 10 10z" fill="${palette.accent}" fill-opacity="0.35"/>
    <!-- Location pin -->
    <g transform="translate(25, -40)" filter="url(#glow_filter)">
      <path d="M0 0 Q12 0 12 12 Q12 22 0 32 Q-12 22 -12 12 Q-12 0 0 0z" fill="${palette.accent2}"/>
      <circle cx="0" cy="12" r="5" fill="white"/>
    </g>
  </g>

  <!-- Compass rose right -->
  <g transform="translate(300, 80)" opacity="0.7">
    <circle cx="40" cy="40" r="38" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.3"/>
    <circle cx="40" cy="40" r="28" fill="none" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.2"/>
    <!-- N S E W markers -->
    <text x="36" y="10" font-size="11" fill="${palette.accent}" font-weight="800" font-family="monospace">N</text>
    <text x="36" y="76" font-size="11" fill="${palette.accent}" font-weight="700" font-family="monospace">S</text>
    <text x="70" y="45" font-size="11" fill="${palette.accent}" font-weight="700" font-family="monospace">E</text>
    <text x="4" y="45" font-size="11" fill="${palette.accent}" font-weight="700" font-family="monospace">W</text>
    <!-- Compass arrows -->
    <polygon points="40,16 44,36 40,40 36,36" fill="${palette.accent}" opacity="0.9"/>
    <polygon points="40,64 44,44 40,40 36,44" fill="${palette.accent2}" opacity="0.6"/>
    <circle cx="40" cy="40" r="4" fill="white" fill-opacity="0.8"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">GEOGRAPHY</text>
  </g>

  <!-- Map dots -->
  <circle cx="50" cy="50" r="3" fill="${palette.accent}" opacity="0.5"/>
  <circle cx="360" cy="160" r="2.5" fill="${palette.accent2}" opacity="0.5"/>
  <circle cx="35" cy="165" r="2" fill="${palette.accent}" opacity="0.4"/>
`, palette)

// ─── HISTORY / ANCIENT / CIVILIZATION ───────────────────────────────────────
const historyCoverSvg = ({ title, palette }) => wrap(`
  <!-- Scroll/Parchment -->
  <g transform="translate(70, 30)" filter="url(#shadow)">
    <rect x="0" y="10" width="160" height="130" rx="4" fill="rgba(255,255,255,0.07)" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
    <!-- Scroll rolls -->
    <ellipse cx="80" cy="10" rx="80" ry="12" fill="rgba(255,255,255,0.05)" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <ellipse cx="80" cy="140" rx="80" ry="12" fill="rgba(255,255,255,0.05)" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <!-- Text lines inside scroll -->
    <line x1="20" y1="35" x2="140" y2="35" stroke="${palette.accent}" stroke-width="2" stroke-linecap="round" stroke-opacity="0.5"/>
    <line x1="20" y1="50" x2="120" y2="50" stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.35"/>
    <line x1="20" y1="64" x2="130" y2="64" stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.35"/>
    <line x1="20" y1="78" x2="110" y2="78" stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.35"/>
    <line x1="20" y1="92" x2="125" y2="92" stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.35"/>
    <line x1="20" y1="106" x2="100" y2="106" stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.35"/>
  </g>

  <!-- Pyramid silhouette right -->
  <g transform="translate(270, 50)" opacity="0.8">
    <polygon points="70,110 140,110 105,25" fill="${palette.accent}" fill-opacity="0.15" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <!-- Pyramid layers -->
    <line x1="85" y1="75" x2="125" y2="75" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <line x1="78" y1="90" x2="132" y2="90" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <line x1="70" y1="105" x2="140" y2="105" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <!-- Sun above pyramid -->
    <circle cx="105" cy="10" r="12" fill="${palette.accent}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5"/>
    <circle cx="105" cy="10" r="7" fill="${palette.accent2}" fill-opacity="0.7"/>
    <!-- Sun rays -->
    <g stroke="${palette.accent}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6">
      <line x1="105" y1="-8" x2="105" y2="-4"/>
      <line x1="119" y1="-2" x2="116" y2="1"/>
      <line x1="123" y1="11" x2="119" y2="11"/>
      <line x1="119" y1="24" x2="116" y2="21"/>
      <line x1="105" y1="28" x2="105" y2="24"/>
      <line x1="91" y1="24" x2="94" y2="21"/>
      <line x1="87" y1="11" x2="91" y2="11"/>
      <line x1="91" y1="-2" x2="94" y2="1"/>
    </g>
  </g>

  <!-- Hourglass icon -->
  <g transform="translate(32, 45)" opacity="0.6">
    <path d="M0 0 h28 L14 35 L28 70 H0 L14 35 Z" fill="none" stroke="${palette.accent}" stroke-width="1.5"/>
    <line x1="0" y1="0" x2="28" y2="0" stroke="${palette.accent}" stroke-width="2"/>
    <line x1="0" y1="70" x2="28" y2="70" stroke="${palette.accent}" stroke-width="2"/>
    <path d="M4 5 Q14 30 14 35" fill="${palette.accent}" fill-opacity="0.5"/>
    <circle cx="14" cy="55" r="5" fill="${palette.accent2}" fill-opacity="0.8"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">HISTORY</text>
  </g>
`, palette)

// ─── TECHNOLOGY / PROGRAMMING / COMPUTER / CODING ───────────────────────────
const techCoverSvg = ({ title, palette }) => wrap(`
  <!-- Code terminal -->
  <g filter="url(#shadow)">
    <rect x="55" y="28" width="200" height="135" rx="12" fill="rgba(0,0,0,0.5)" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
    <!-- Terminal header bar -->
    <rect x="55" y="28" width="200" height="22" rx="12" fill="${palette.accent2}" fill-opacity="0.3"/>
    <rect x="55" y="38" width="200" height="12" fill="${palette.accent2}" fill-opacity="0.3"/>
    <!-- Terminal dots -->
    <circle cx="73" cy="39" r="5" fill="#ff5f57"/>
    <circle cx="89" cy="39" r="5" fill="#febc2e"/>
    <circle cx="105" cy="39" r="5" fill="#28c840"/>
    <!-- Code lines -->
    <text x="70" y="70" font-size="11" fill="${palette.accent}" font-family="'Courier New',monospace" font-weight="600">&gt; const quiz = {}</text>
    <text x="70" y="87" font-size="11" fill="rgba(255,255,255,0.55)" font-family="'Courier New',monospace">&gt; quiz.topic = "Tech"</text>
    <text x="70" y="104" font-size="11" fill="${palette.accent2}" font-family="'Courier New',monospace" filter="url(#glow_filter)">&gt; <tspan fill="white">run</tspan>(quiz)</text>
    <text x="70" y="121" font-size="11" fill="#4ade80" font-family="'Courier New',monospace">✓ Loading...</text>
    <text x="70" y="138" font-size="11" fill="${palette.accent}" font-family="'Courier New',monospace" opacity="0.7">_<tspan opacity="0">|</tspan></text>
  </g>

  <!-- Circuit board right side -->
  <g transform="translate(275, 30)" opacity="0.7" stroke="${palette.accent}" stroke-width="1.5" fill="none">
    <rect x="0" y="0" width="90" height="140" rx="8" stroke-opacity="0.3"/>
    <!-- Circuit traces -->
    <path d="M20 20 h20 v15 h30 v-15 h10" stroke-opacity="0.5"/>
    <path d="M20 50 h50 v20 h-20" stroke-opacity="0.5"/>
    <path d="M20 85 h15 v20 h40 v-10" stroke-opacity="0.5"/>
    <path d="M50 110 v20 h25" stroke-opacity="0.5"/>
    <!-- Circuit nodes -->
    <circle cx="20" cy="20" r="4" fill="${palette.accent}" stroke="none" filter="url(#glow_filter)"/>
    <circle cx="80" cy="20" r="4" fill="${palette.accent2}" stroke="none" filter="url(#glow_filter)"/>
    <circle cx="70" cy="50" r="3" fill="${palette.accent}" stroke="none"/>
    <circle cx="20" cy="50" r="3" fill="${palette.accent2}" stroke="none"/>
    <circle cx="20" cy="85" r="4" fill="${palette.accent}" stroke="none" filter="url(#glow_filter)"/>
    <circle cx="60" cy="110" r="3" fill="${palette.accent2}" stroke="none"/>
    <!-- Chip -->
    <rect x="32" y="58" width="26" height="18" rx="3" fill="${palette.accent}" fill-opacity="0.2" stroke="${palette.accent}" stroke-width="1" filter="url(#glow_filter)"/>
  </g>

  <!-- Floating tags -->
  <g font-family="'Courier New',monospace" fill="${palette.accent}" font-size="10" opacity="0.4">
    <text x="20" y="20">&lt;/&gt;</text>
    <text x="22" y="180">{ }</text>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">TECHNOLOGY</text>
  </g>
`, palette)

// ─── LITERATURE / BOOKS / POETRY ─────────────────────────────────────────────
const literatureCoverSvg = ({ title, palette }) => wrap(`
  <!-- Stacked books -->
  <g transform="translate(65, 40)">
    <!-- Book 1 (bottom, wide) -->
    <rect x="0" y="100" width="160" height="28" rx="4" fill="${palette.accent2}" fill-opacity="0.4" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <rect x="0" y="100" width="16" height="28" rx="4" fill="${palette.accent2}" fill-opacity="0.7" stroke="${palette.accent}" stroke-width="1"/>
    <line x1="24" y1="108" x2="150" y2="108" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <line x1="24" y1="116" x2="120" y2="116" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <!-- Book 2 -->
    <rect x="10" y="70" width="140" height="28" rx="4" fill="${palette.accent}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="10" y="70" width="14" height="28" rx="4" fill="${palette.accent}" fill-opacity="0.6"/>
    <line x1="30" y1="78" x2="140" y2="78" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <!-- Book 3 (upright) -->
    <rect x="30" y="15" width="20" height="53" rx="4" fill="${palette.accent2}" fill-opacity="0.5" stroke="${palette.accent2}" stroke-width="1.5"/>
    <rect x="55" y="10" width="18" height="58" rx="4" fill="${palette.accent}" fill-opacity="0.4" stroke="${palette.accent}" stroke-width="1.5"/>
    <rect x="78" y="18" width="22" height="50" rx="4" fill="${palette.accent2}" fill-opacity="0.35" stroke="${palette.accent}" stroke-width="1.5"/>
    <rect x="105" y="14" width="18" height="54" rx="4" fill="${palette.accent}" fill-opacity="0.5" stroke="${palette.accent2}" stroke-width="1.5"/>
  </g>

  <!-- Quill pen -->
  <g transform="translate(260, 30)" opacity="0.8">
    <path d="M60 0 Q70 10 60 25 Q50 40 40 50 Q38 52 35 52 L40 40 Q35 45 30 52 L25 50 Q30 40 35 32 Q45 18 55 8 Q57 4 60 0z" fill="${palette.accent}" fill-opacity="0.5" stroke="${palette.accent}" stroke-width="1"/>
    <path d="M35 52 L8 120" stroke="${palette.accent2}" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
    <path d="M33 56 Q10 85 8 120" fill="${palette.accent}" fill-opacity="0.1"/>
    <!-- Ink drop -->
    <ellipse cx="8" cy="124" rx="5" ry="3" fill="${palette.accent2}" fill-opacity="0.7" filter="url(#glow_filter)"/>
  </g>

  <!-- Open book with text waves -->
  <g transform="translate(270, 105)" opacity="0.75">
    <path d="M0 0 Q40 -8 80 0 Q80 0 80 40 Q40 32 0 40 Z" fill="${palette.accent}" fill-opacity="0.1" stroke="${palette.accent}" stroke-width="1"/>
    <path d="M80 0 Q120 -8 160 0 Q160 40 80 40 Z" fill="${palette.accent2}" fill-opacity="0.1" stroke="${palette.accent}" stroke-width="1"/>
    <line x1="80" y1="0" x2="80" y2="40" stroke="${palette.accent}" stroke-width="1.5"/>
    <!-- Text shimmer lines -->
    <line x1="10" y1="12" x2="70" y2="9" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <line x1="10" y1="20" x2="60" y2="17" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <line x1="90" y1="12" x2="150" y2="9" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.4"/>
    <line x1="90" y1="20" x2="140" y2="17" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">LITERATURE</text>
  </g>
`, palette)

// ─── GENERAL KNOWLEDGE / TRIVIA ──────────────────────────────────────────────
const gkCoverSvg = ({ title, palette }) => wrap(`
  <!-- Big lightbulb -->
  <g transform="translate(88, 20)" filter="url(#shadow)">
    <radialGradient id="bulbGlow" cx="50%" cy="40%" r="50%">
      <stop offset="0" stop-color="${palette.accent}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="transparent"/>
    </radialGradient>
    <!-- Glow aura -->
    <circle cx="65" cy="65" r="55" fill="url(#bulbGlow)" opacity="0.25"/>
    <!-- Bulb body -->
    <path d="M40 75 Q38 50 45 36 Q55 18 65 18 Q75 18 85 36 Q92 50 90 75z" fill="${palette.accent}" fill-opacity="0.25" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.7"/>
    <!-- Inner shine -->
    <path d="M52 55 Q50 38 58 30" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Filament -->
    <path d="M52 76 L52 80 Q55 84 58 80 Q61 76 64 80 Q67 84 70 80 Q73 76 76 80 L76 76" fill="none" stroke="${palette.accent2}" stroke-width="2" filter="url(#glow_filter)"/>
    <!-- Base rings -->
    <rect x="48" y="76" width="34" height="7" rx="3" fill="${palette.accent2}" fill-opacity="0.5" stroke="${palette.accent}" stroke-width="1"/>
    <rect x="50" y="84" width="30" height="6" rx="3" fill="${palette.accent2}" fill-opacity="0.4" stroke="${palette.accent}" stroke-width="1"/>
    <rect x="52" y="91" width="26" height="6" rx="3" fill="${palette.accent}" fill-opacity="0.35" stroke="${palette.accent}" stroke-width="1"/>
    <!-- Screw cap -->
    <rect x="56" y="97" width="18" height="10" rx="4" fill="${palette.accent2}" fill-opacity="0.6"/>
  </g>

  <!-- Question marks floating -->
  <g font-family="ui-sans-serif,system-ui" font-weight="900" filter="url(#glow_filter)">
    <text x="240" y="55" font-size="44" fill="${palette.accent}" fill-opacity="0.7">?</text>
    <text x="320" y="85" font-size="26" fill="${palette.accent2}" fill-opacity="0.6">?</text>
    <text x="280" y="140" font-size="18" fill="${palette.accent}" fill-opacity="0.45">?</text>
    <text x="350" y="130" font-size="20" fill="${palette.accent2}" fill-opacity="0.5">?</text>
  </g>

  <!-- Knowledge sparks -->
  <g fill="${palette.accent}" opacity="0.7">
    <polygon points="250,105 253,113 261,113 255,118 257,126 250,121 243,126 245,118 239,113 247,113" filter="url(#glow_filter)"/>
    <polygon points="370,55 372,61 378,61 373,65 375,71 370,67 365,71 367,65 362,61 368,61" fill="${palette.accent2}"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">GENERAL KNOWLEDGE</text>
  </g>
`, palette)

// ─── MOVIES / FILM / CINEMA ───────────────────────────────────────────────────
const movieCoverSvg = ({ title, palette }) => wrap(`
  <!-- Film reel -->
  <g transform="translate(72, 20)">
    <circle cx="60" cy="75" r="62" fill="${palette.accent2}" fill-opacity="0.08" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
    <circle cx="60" cy="75" r="45" fill="none" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <circle cx="60" cy="75" r="15" fill="${palette.accent2}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="1.5"/>
    <circle cx="60" cy="75" r="7" fill="${palette.accent}" fill-opacity="0.6" filter="url(#glow_filter)"/>
    <!-- Sprocket holes around reel -->
    <g fill="${palette.accent}" fill-opacity="0.5">
      <rect x="55" y="12" width="10" height="8" rx="2"/>
      <rect x="55" y="130" width="10" height="8" rx="2"/>
      <rect x="12" y="70" width="8" height="10" rx="2"/>
      <rect x="100" y="70" width="8" height="10" rx="2"/>
      <rect x="27" y="28" width="8" height="10" rx="2" transform="rotate(-45 31 33)"/>
      <rect x="87" y="28" width="8" height="10" rx="2" transform="rotate(45 91 33)"/>
      <rect x="27" y="107" width="8" height="10" rx="2" transform="rotate(45 31 112)"/>
      <rect x="87" y="107" width="8" height="10" rx="2" transform="rotate(-45 91 112)"/>
    </g>
  </g>

  <!-- Clapperboard right -->
  <g transform="translate(256, 28)" filter="url(#shadow)">
    <rect x="0" y="26" width="118" height="100" rx="8" fill="rgba(0,0,0,0.6)" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
    <!-- Clapper top -->
    <rect x="0" y="10" width="118" height="22" rx="4" fill="${palette.accent2}" fill-opacity="0.7" stroke="${palette.accent}" stroke-width="1.5"/>
    <!-- Diagonal clapper strips -->
    <path d="M10 10 L22 32 L8 32z" fill="rgba(0,0,0,0.5)"/>
    <path d="M30 10 L42 32 L28 32 L18 10z" fill="rgba(0,0,0,0.4)"/>
    <path d="M52 10 L64 32 L50 32 L40 10z" fill="rgba(0,0,0,0.5)"/>
    <path d="M74 10 L86 32 L72 32 L62 10z" fill="rgba(0,0,0,0.4)"/>
    <path d="M96 10 L108 32 L94 32 L84 10z" fill="rgba(0,0,0,0.5)"/>
    <!-- Clapper hinge -->
    <circle cx="10" cy="10" r="6" fill="${palette.accent}" fill-opacity="0.8"/>
    <!-- Screen lines -->
    <line x1="14" y1="50" x2="104" y2="50" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
    <line x1="14" y1="65" x2="85" y2="65" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.3"/>
    <line x1="14" y1="80" x2="95" y2="80" stroke="${palette.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <!-- Play button -->
    <polygon points="48,95 48,118 72,106.5" fill="${palette.accent}" fill-opacity="0.6" filter="url(#glow_filter)"/>
  </g>

  <!-- Stars -->
  <g fill="${palette.accent}" filter="url(#glow_filter)">
    <polygon points="235,165 237,171 243,171 238,175 240,181 235,177 230,181 232,175 227,171 233,171"/>
    <polygon points="252,158 253.5,162 258,162 254.5,165 255.7,169.5 252,167 248.3,169.5 249.5,165 246,162 250.5,162"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">MOVIES &amp; CINEMA</text>
  </g>
`, palette)

// ─── SPORTS ──────────────────────────────────────────────────────────────────
const sportsCoverSvg = ({ title, palette }) => wrap(`
  <!-- Trophy -->
  <g transform="translate(75, 18)" filter="url(#shadow)">
    <path d="M45 0 h50 v50 Q95 80 70 90 Q45 80 45 50 Z" fill="${palette.accent}" fill-opacity="0.2" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.7"/>
    <!-- Trophy handles -->
    <path d="M45 18 Q20 18 20 38 Q20 55 45 55" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-opacity="0.7"/>
    <path d="M95 18 Q120 18 120 38 Q120 55 95 55" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-opacity="0.7"/>
    <!-- Trophy base -->
    <rect x="55" y="90" width="30" height="8" rx="2" fill="${palette.accent2}" fill-opacity="0.6" stroke="${palette.accent}" stroke-width="1"/>
    <rect x="48" y="98" width="44" height="8" rx="3" fill="${palette.accent}" fill-opacity="0.5" stroke="${palette.accent}" stroke-width="1.5"/>
    <!-- Star inside trophy -->
    <polygon points="70,20 73,30 83,30 75,37 78,47 70,40 62,47 65,37 57,30 67,30" fill="${palette.accent}" fill-opacity="0.8" filter="url(#glow_filter)"/>
  </g>

  <!-- Ball (sport) -->
  <g transform="translate(255, 50)">
    <circle cx="55" cy="55" r="50" fill="${palette.accent}" fill-opacity="0.12" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
    <!-- Soccer ball pattern -->
    <circle cx="55" cy="55" r="32" fill="${palette.accent2}" fill-opacity="0.2" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.7"/>
    <!-- Pentagon patches -->
    <path d="M55 23 L67 32 L63 47 L47 47 L43 32z" fill="${palette.accent}" fill-opacity="0.35" stroke="${palette.accent2}" stroke-width="0.8"/>
    <path d="M76 59 L88 51 L92 65 L82 76 L68 71z" fill="${palette.accent}" fill-opacity="0.3" stroke="${palette.accent2}" stroke-width="0.8"/>
    <path d="M34 59 L22 51 L18 65 L28 76 L42 71z" fill="${palette.accent}" fill-opacity="0.3" stroke="${palette.accent2}" stroke-width="0.8"/>
    <path d="M42 80 L50 87 L60 87 L68 80 L63 70 L47 70z" fill="${palette.accent2}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="0.8"/>
    <!-- Center circle -->
    <circle cx="55" cy="55" r="8" fill="${palette.accent}" fill-opacity="0.5"/>
  </g>

  <!-- Podium -->
  <g transform="translate(10, 100)" opacity="0.6">
    <rect x="0" y="30" width="30" height="60" rx="3" fill="${palette.accent2}" fill-opacity="0.4" stroke="${palette.accent}" stroke-width="1"/>
    <text x="8" y="25" font-size="14" fill="${palette.accent}" font-weight="900" font-family="ui-sans-serif">2</text>
    <rect x="35" y="10" width="30" height="80" rx="3" fill="${palette.accent}" fill-opacity="0.4" stroke="${palette.accent}" stroke-width="1.5"/>
    <text x="43" y="5" font-size="14" fill="${palette.accent}" font-weight="900" font-family="ui-sans-serif">1</text>
    <rect x="70" y="50" width="30" height="40" rx="3" fill="${palette.accent2}" fill-opacity="0.35" stroke="${palette.accent}" stroke-width="1"/>
    <text x="78" y="45" font-size="14" fill="${palette.accent}" font-weight="900" font-family="ui-sans-serif">3</text>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">SPORTS</text>
  </g>
`, palette)

// ─── MUSIC ───────────────────────────────────────────────────────────────────
const musicCoverSvg = ({ title, palette }) => wrap(`
  <!-- Musical staff -->
  <g transform="translate(55, 50)" stroke="${palette.accent}" stroke-opacity="0.4" stroke-width="1.5">
    <line x1="0" y1="0" x2="290" y2="0"/>
    <line x1="0" y1="14" x2="290" y2="14"/>
    <line x1="0" y1="28" x2="290" y2="28"/>
    <line x1="0" y1="42" x2="290" y2="42"/>
    <line x1="0" y1="56" x2="290" y2="56"/>
    <!-- Treble clef (simplified) -->
    <path d="M10 70 Q8 40 20 28 Q32 16 28 4 Q24 -12 16 -6 Q10 0 14 12 Q18 24 24 20" fill="none" stroke="${palette.accent}" stroke-width="2.5" stroke-opacity="0.8"/>
    <path d="M14 70 Q14 80 20 82 Q28 84 30 76 Q32 68 26 62 Q20 56 14 60z" fill="none" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.7"/>
  </g>

  <!-- Music notes floating -->
  <g font-family="serif" font-size="36" fill="${palette.accent}" filter="url(#glow_filter)" opacity="0.85">
    <text x="80" y="140">♪</text>
    <text x="155" y="90" font-size="28">♫</text>
    <text x="220" y="150" font-size="32">♩</text>
    <text x="300" y="110" font-size="24">♬</text>
    <text x="340" y="155" font-size="20" fill="${palette.accent2}">♪</text>
  </g>

  <!-- Headphones -->
  <g transform="translate(265, 18)" opacity="0.75">
    <path d="M16 40 Q16 5 50 5 Q84 5 84 40" fill="none" stroke="${palette.accent}" stroke-width="3" stroke-linecap="round"/>
    <rect x="5" y="38" width="22" height="36" rx="10" fill="${palette.accent}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="2"/>
    <rect x="73" y="38" width="22" height="36" rx="10" fill="${palette.accent}" fill-opacity="0.3" stroke="${palette.accent}" stroke-width="2"/>
    <!-- Speaker grille -->
    <line x1="12" y1="50" x2="20" y2="50" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="12" y1="57" x2="20" y2="57" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="12" y1="64" x2="20" y2="64" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="80" y1="50" x2="88" y2="50" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="80" y1="57" x2="88" y2="57" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
    <line x1="80" y1="64" x2="88" y2="64" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6"/>
  </g>

  <!-- Equalizer bars left -->
  <g transform="translate(30, 90)" fill="${palette.accent2}" opacity="0.7">
    <rect x="0" y="30" width="10" height="30" rx="3"/>
    <rect x="15" y="15" width="10" height="45" rx="3"/>
    <rect x="30" y="20" width="10" height="40" rx="3"/>
    <rect x="45" y="5" width="10" height="55" rx="3"/>
    <rect x="60" y="25" width="10" height="35" rx="3"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">MUSIC</text>
  </g>
`, palette)

// ─── GENERIC FALLBACK ─────────────────────────────────────────────────────────
const genericCoverSvg = ({ title, palette }) => wrap(`
  <!-- Central brain icon -->
  <g transform="translate(88, 20)" filter="url(#shadow)">
    <!-- Brain shape simplified -->
    <path d="M60 30 Q60 10 80 15 Q95 18 95 30 Q108 28 112 40 Q116 52 108 60 Q115 68 110 78 Q104 88 95 85 Q90 95 80 95 Q70 95 65 85 Q55 88 49 78 Q44 68 51 60 Q43 52 47 40 Q51 28 64 30z" fill="${palette.accent}" fill-opacity="0.2" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.7"/>
    <!-- Brain wrinkle lines -->
    <path d="M70 40 Q80 36 85 45" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.6" stroke-linecap="round"/>
    <path d="M65 55 Q72 50 80 58 Q88 65 80 70" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5" stroke-linecap="round"/>
    <path d="M72 72 Q80 68 88 75" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5" stroke-linecap="round"/>
    <path d="M85 45 Q92 50 90 58" fill="none" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4" stroke-linecap="round"/>
    <!-- Glow center -->
    <circle cx="80" cy="60" r="18" fill="${palette.glow}" filter="url(#blur1)" opacity="0.3"/>
    <!-- Neural connections -->
    <line x1="80" y1="95" x2="80" y2="135" stroke="${palette.accent}" stroke-width="1.5" stroke-dasharray="4 3" stroke-opacity="0.5"/>
  </g>

  <!-- Floating quiz elements -->
  <g fill="${palette.accent}" opacity="0.6" font-family="ui-sans-serif,system-ui" font-weight="800">
    <!-- Score bubbles -->
    <circle cx="290" cy="50" r="28" fill="${palette.accent}" fill-opacity="0.12" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.5"/>
    <text x="290" y="40" font-size="10" text-anchor="middle" fill="${palette.accent}" filter="url(#glow_filter)">SCORE</text>
    <text x="290" y="60" font-size="18" text-anchor="middle" fill="${palette.accent2}" filter="url(#glow_filter)">100</text>
    <circle cx="350" cy="110" r="20" fill="${palette.accent2}" fill-opacity="0.12" stroke="${palette.accent2}" stroke-width="1.5" stroke-opacity="0.4"/>
    <text x="350" y="106" font-size="9" text-anchor="middle" fill="${palette.accent}">TIME</text>
    <text x="350" y="120" font-size="14" text-anchor="middle" fill="${palette.accent2}">60s</text>
    <!-- Stars -->
    <polygon points="40,50 43,60 53,60 45,67 48,77 40,70 32,77 35,67 27,60 37,60" fill="${palette.accent}" filter="url(#glow_filter)" opacity="0.8"/>
    <polygon points="28,100 30,106 36,106 31,110 33,116 28,112 23,116 25,110 20,106 26,106" fill="${palette.accent2}" opacity="0.7"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">${(title || "QUIZ").toUpperCase().substring(0, 22)}</text>
  </g>
`, palette)

// ─── JavaScript / React / Programming specific ────────────────────────────────
const jsCoverSvg = ({ title, palette }) => wrap(`
  <!-- JS Logo box left -->
  <g transform="translate(65, 30)" filter="url(#shadow)">
    <rect x="0" y="0" width="90" height="90" rx="16" fill="#f7df1e" fill-opacity="0.9"/>
    <text x="10" y="76" font-size="52" font-weight="900" fill="#000000" font-family="'Arial Black',sans-serif" opacity="0.9">JS</text>
  </g>

  <!-- Code snippet right -->
  <g filter="url(#shadow)">
    <rect x="178" y="25" width="190" height="130" rx="12" fill="rgba(0,0,0,0.6)" stroke="${palette.accent}" stroke-width="1.5" stroke-opacity="0.4"/>
    <!-- Header bar -->
    <rect x="178" y="25" width="190" height="20" rx="12" fill="${palette.accent2}" fill-opacity="0.4"/>
    <rect x="178" y="35" width="190" height="10" fill="${palette.accent2}" fill-opacity="0.3"/>
    <circle cx="194" cy="35" r="5" fill="#ff5f57"/>
    <circle cx="208" cy="35" r="5" fill="#febc2e"/>
    <circle cx="222" cy="35" r="5" fill="#28c840"/>
    <!-- Code lines -->
    <text x="192" y="63" font-size="10" fill="#f7df1e" font-family="'Courier New',monospace">const quiz = () =&gt; {'{'}</text>
    <text x="192" y="79" font-size="10" fill="rgba(255,255,255,0.6)" font-family="'Courier New',monospace">  return 100; </text>
    <text x="192" y="95" font-size="10" fill="#f7df1e" font-family="'Courier New',monospace">{'}'}</text>
    <text x="192" y="111" font-size="10" fill="#4ade80" font-family="'Courier New',monospace">// Score: Perfect!</text>
    <text x="192" y="127" font-size="10" fill="${palette.accent}" font-family="'Courier New',monospace">quiz(); ▌</text>
  </g>

  <!-- Floating brackets -->
  <g font-family="'Courier New',monospace" font-size="30" font-weight="900" opacity="0.2" fill="#f7df1e">
    <text x="20" y="45">{'{'}</text>
    <text x="22" y="175">{'}'}</text>
    <text x="370" y="90">;</text>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="#f7df1e" fill-opacity="0.15"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="#f7df1e" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">JAVASCRIPT</text>
  </g>
`, palette)

// ─── React specific ───────────────────────────────────────────────────────────
const reactCoverSvg = ({ title, palette }) => wrap(`
  <!-- React atom logo -->
  <g transform="translate(75, 100)">
    <!-- Orbit ellipses -->
    <ellipse cx="60" cy="0" rx="70" ry="28" fill="none" stroke="#61dafb" stroke-width="2.5" stroke-opacity="0.8"/>
    <ellipse cx="60" cy="0" rx="70" ry="28" fill="none" stroke="#61dafb" stroke-width="2" stroke-opacity="0.7" transform="rotate(60 60 0)"/>
    <ellipse cx="60" cy="0" rx="70" ry="28" fill="none" stroke="#61dafb" stroke-width="2" stroke-opacity="0.7" transform="rotate(120 60 0)"/>
    <!-- Center dot -->
    <circle cx="60" cy="0" r="10" fill="#61dafb" filter="url(#glow_filter)"/>
    <circle cx="60" cy="0" r="5" fill="white"/>
  </g>

  <!-- Component boxes right -->
  <g transform="translate(255, 28)" opacity="0.85">
    <rect x="0" y="0" width="110" height="32" rx="8" fill="rgba(97,218,251,0.1)" stroke="#61dafb" stroke-width="1.5" stroke-opacity="0.6"/>
    <text x="10" y="21" font-size="11" fill="#61dafb" font-family="'Courier New',monospace">&lt;App /&gt;</text>
    <rect x="10" y="38" width="90" height="28" rx="6" fill="rgba(97,218,251,0.08)" stroke="#61dafb" stroke-width="1" stroke-opacity="0.5"/>
    <text x="20" y="57" font-size="10" fill="#61dafb" font-family="'Courier New',monospace">&lt;Quiz /&gt;</text>
    <rect x="20" y="72" width="70" height="24" rx="5" fill="rgba(97,218,251,0.06)" stroke="#61dafb" stroke-width="1" stroke-opacity="0.4"/>
    <text x="28" y="88" font-size="9" fill="#61dafb" font-family="'Courier New',monospace">&lt;Score /&gt;</text>
    <!-- Tree lines -->
    <line x1="10" y1="32" x2="10" y2="40" stroke="#61dafb" stroke-width="1" stroke-opacity="0.5"/>
    <line x1="20" y1="66" x2="20" y2="74" stroke="#61dafb" stroke-width="1" stroke-opacity="0.4"/>
  </g>

  <!-- useState hook text -->
  <g transform="translate(258, 128)" opacity="0.6" font-family="'Courier New',monospace" font-size="9">
    <text x="0" y="14" fill="#f7df1e">useState(false)</text>
    <text x="0" y="28" fill="#4ade80">useEffect(() =&gt; ...)</text>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="rgba(97,218,251,0.1)"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="#61dafb" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">REACT</text>
  </g>
`, palette)

// ─── Python specific ──────────────────────────────────────────────────────────
const pythonCoverSvg = ({ title, palette }) => wrap(`
  <!-- Python snake logo (simplified) -->
  <g transform="translate(65, 25)" filter="url(#shadow)">
    <path d="M46 0 Q20 0 20 26 L20 46 Q20 56 30 56 L70 56 Q80 56 80 66 L80 86 Q80 96 70 96 L30 96 Q20 96 20 86" fill="none" stroke="#4B8BBE" stroke-width="14" stroke-linecap="round"/>
    <path d="M54 96 Q80 96 80 70 L80 50 Q80 40 70 40 L30 40 Q20 40 20 30 L20 10 Q20 0 30 0 L70 0 Q80 0 80 10 L80 16" fill="none" stroke="#FFD43B" stroke-width="14" stroke-linecap="round"/>
    <!-- Eyes -->
    <circle cx="32" cy="14" r="6" fill="white"/>
    <circle cx="32" cy="14" r="3" fill="#2b5b84"/>
    <circle cx="68" cy="82" r="6" fill="white"/>
    <circle cx="68" cy="82" r="3" fill="#b5870d"/>
  </g>

  <!-- Code snippet -->
  <g filter="url(#shadow)">
    <rect x="188" y="25" width="180" height="130" rx="12" fill="rgba(0,0,0,0.6)" stroke="#4B8BBE" stroke-width="1.5" stroke-opacity="0.5"/>
    <rect x="188" y="25" width="180" height="20" rx="12" fill="rgba(75,139,190,0.3)"/>
    <rect x="188" y="35" width="180" height="10" fill="rgba(75,139,190,0.2)"/>
    <text x="202" y="60" font-size="10" fill="#FFD43B" font-family="'Courier New',monospace">def solve(quiz):</text>
    <text x="202" y="76" font-size="10" fill="rgba(255,255,255,0.55)" font-family="'Courier New',monospace">  score = 0</text>
    <text x="202" y="92" font-size="10" fill="#4ade80" font-family="'Courier New',monospace">  for q in quiz:</text>
    <text x="202" y="108" font-size="10" fill="rgba(255,255,255,0.5)" font-family="'Courier New',monospace">    score += 10</text>
    <text x="202" y="124" font-size="10" fill="#FFD43B" font-family="'Courier New',monospace">  return score</text>
    <text x="202" y="140" font-size="10" fill="#4B8BBE" font-family="'Courier New',monospace"># 🐍 Python</text>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="rgba(75,139,190,0.15)"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="#4B8BBE" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">PYTHON</text>
  </g>
`, palette)

// ─── Economics / Business ─────────────────────────────────────────────────────
const economicsCoverSvg = ({ title, palette }) => wrap(`
  <!-- Bar chart -->
  <g transform="translate(65, 35)">
    <line x1="0" y1="120" x2="160" y2="120" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.5"/>
    <line x1="0" y1="0" x2="0" y2="120" stroke="${palette.accent}" stroke-width="2" stroke-opacity="0.5"/>
    <!-- Bars -->
    <rect x="10" y="60" width="22" height="60" rx="4" fill="${palette.accent}" fill-opacity="0.5"/>
    <rect x="38" y="40" width="22" height="80" rx="4" fill="${palette.accent2}" fill-opacity="0.5"/>
    <rect x="66" y="20" width="22" height="100" rx="4" fill="${palette.accent}" fill-opacity="0.6" filter="url(#glow_filter)"/>
    <rect x="94" y="50" width="22" height="70" rx="4" fill="${palette.accent2}" fill-opacity="0.5"/>
    <rect x="122" y="30" width="22" height="90" rx="4" fill="${palette.accent}" fill-opacity="0.55"/>
    <!-- Trend line -->
    <path d="M21 85 L49 65 L77 45 L105 68 L133 50" fill="none" stroke="${palette.accent}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="1 0"/>
    <!-- Arrow tip on trend line -->
    <polygon points="130,44 140,50 130,56" fill="${palette.accent}" fill-opacity="0.9"/>
  </g>

  <!-- Currency symbols -->
  <g font-family="ui-sans-serif" font-weight="900" fill="${palette.accent}" filter="url(#glow_filter)" opacity="0.7">
    <text x="255" y="65" font-size="36">$</text>
    <text x="310" y="90" font-size="24" fill="${palette.accent2}">€</text>
    <text x="285" y="120" font-size="20">₹</text>
    <text x="340" y="130" font-size="18" fill="${palette.accent2}">¥</text>
  </g>

  <!-- Pie chart hint -->
  <g transform="translate(250, 125)" opacity="0.7">
    <path d="M40 0 A40 40 0 0 1 69 20 L40 40 Z" fill="${palette.accent}" fill-opacity="0.5"/>
    <path d="M69 20 A40 40 0 0 1 40 80 L40 40 Z" fill="${palette.accent2}" fill-opacity="0.45"/>
    <path d="M40 80 A40 40 0 1 1 40 0 L40 40 Z" fill="${palette.accent}" fill-opacity="0.3"/>
  </g>

  <!-- Bottom label -->
  <g>
    <rect x="60" y="168" width="280" height="22" rx="6" fill="${palette.accent2}" fill-opacity="0.2"/>
    <text x="200" y="183" font-size="11" font-weight="700" fill="${palette.accent}" font-family="ui-sans-serif,system-ui" text-anchor="middle" letter-spacing="2">ECONOMICS</text>
  </g>
`, palette)

// ─── ROUTING LOGIC ────────────────────────────────────────────────────────────
export const getQuizIllustrationDataUrl = ({ title, topic }) => {
  const t = normalizeText(title)
  const tp = normalizeText(topic)
  const key = `${t} ${tp}`.trim()
  const palette = paletteFor({ title, topic })

  // JavaScript / React / programming specifics (before generic tech)
  if (key.includes("react") || key.includes("reactjs") || key.includes("react js")) {
    return svgToDataUrl(reactCoverSvg({ title: title || "React", palette }))
  }
  if (key.includes("javascript") || key.includes("js ") || key === "js" || key.includes("node") || key.includes("typescript") || key.includes("angular") || key.includes("vue")) {
    return svgToDataUrl(jsCoverSvg({ title: title || "JavaScript", palette }))
  }
  if (key.includes("python") || key.includes("django") || key.includes("flask")) {
    return svgToDataUrl(pythonCoverSvg({ title: title || "Python", palette }))
  }
  if (
    key.includes("technology") || key.includes("tech") || key.includes("computer") ||
    key.includes("coding") || key.includes("programming") || key.includes("software") ||
    key.includes("database") || key.includes("algorithm") || key.includes("data structure")
  ) {
    return svgToDataUrl(techCoverSvg({ title: title || "Technology", palette }))
  }
  if (key.includes("math") || key.includes("maths") || key.includes("algebra") || key.includes("calculus") ||
      key.includes("geometry") || key.includes("equation") || key.includes("arithmetic") || key.includes("statistics")) {
    return svgToDataUrl(mathCoverSvg({ title: title || "Mathematics", palette }))
  }
  if (key.includes("general knowledge") || key.includes("gk") || key.includes("trivia") || key.includes("quiz bowl") || key.includes("knowledge")) {
    return svgToDataUrl(gkCoverSvg({ title: title || "General Knowledge", palette }))
  }
  if (key.includes("movie") || key.includes("film") || key.includes("cinema") || key.includes("actor") || key.includes("oscar") || key.includes("bollywood") || key.includes("hollywood")) {
    return svgToDataUrl(movieCoverSvg({ title: title || "Movies", palette }))
  }
  if (key.includes("history") || key.includes("ancient") || key.includes("war") || key.includes("civilization") ||
      key.includes("empire") || key.includes("revolution") || key.includes("medieval") || key.includes("world war")) {
    return svgToDataUrl(historyCoverSvg({ title: title || "History", palette }))
  }
  if (key.includes("science") || key.includes("physics") || key.includes("chemistry") || key.includes("biology") ||
      key.includes("anatomy") || key.includes("space") || key.includes("astronomy") || key.includes("ecology")) {
    return svgToDataUrl(scienceCoverSvg({ title: title || "Science", palette }))
  }
  if (key.includes("geography") || key.includes("globe") || key.includes("capital") || key.includes("country") ||
      key.includes("continent") || key.includes("map") || key.includes("nation") || key.includes("world")) {
    return svgToDataUrl(geographyCoverSvg({ title: title || "Geography", palette }))
  }
  if (key.includes("literature") || key.includes("book") || key.includes("poem") || key.includes("novel") ||
      key.includes("author") || key.includes("english") || key.includes("grammar") || key.includes("vocabulary")) {
    return svgToDataUrl(literatureCoverSvg({ title: title || "Literature", palette }))
  }
  if (key.includes("sport") || key.includes("football") || key.includes("cricket") || key.includes("basketball") ||
      key.includes("tennis") || key.includes("soccer") || key.includes("athlete") || key.includes("olympic")) {
    return svgToDataUrl(sportsCoverSvg({ title: title || "Sports", palette }))
  }
  if (key.includes("music") || key.includes("song") || key.includes("band") || key.includes("artist") ||
      key.includes("album") || key.includes("genre") || key.includes("instrument") || key.includes("melody")) {
    return svgToDataUrl(musicCoverSvg({ title: title || "Music", palette }))
  }
  if (key.includes("economics") || key.includes("business") || key.includes("finance") || key.includes("economy") ||
      key.includes("stock") || key.includes("market") || key.includes("investment") || key.includes("trade")) {
    return svgToDataUrl(economicsCoverSvg({ title: title || "Economics", palette }))
  }

  return svgToDataUrl(genericCoverSvg({ title: title || "Quiz", palette }))
}

export const getQuizCoverSrc = (quiz) => {
  if (quiz?.imageUrl) return quiz.imageUrl
  return getQuizIllustrationDataUrl({ title: quiz?.title, topic: quiz?.topic })
}
