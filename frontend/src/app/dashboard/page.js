"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { PlusCircle, BookOpen, Clock, Search, Trash2, Edit, TrendingUp, Target, Trophy, Star, Flame, Zap, Award, ChevronRight, Share2, HelpCircle } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { isAuthenticated } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Header } from "@/components/header"
import { getUserQuizzes, getAllTopics, deleteQuiz, getUserStats, getUserProgress, getAchievements } from "@/lib/api"


// ─── Component Additions for Premium Effects ──────────────────────────────
function TiltCard({ children, className = "", intensity = 10 }) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -intensity
    const rotY = ((x - cx) / cx) * intensity
    el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`
    el.style.transition = "transform 0.1s ease"
    
    // dynamic highlight
    const glowX = (x / rect.width) * 100
    const glowY = (y / rect.height) * 100
    el.style.setProperty("--glow-x", `${glowX}%`)
    el.style.setProperty("--glow-y", `${glowY}%`)
  }, [intensity])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)"
    el.style.transition = "transform 0.5s cubic-bezier(0.4,0,0.2,1)"
  }, [])

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${Math.random() * 15 + 10}s`,
    color: ["rgba(124,58,237,0.5)", "rgba(6,182,212,0.5)", "rgba(168,85,247,0.5)"][Math.floor(Math.random() * 3)],
  }))
  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle-dot"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  )
}

function CyberGrid() {
  return <div className="cyber-grid" aria-hidden="true" />
}

function MouseSpotlight() {
  const spotRef = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (spotRef.current) {
        spotRef.current.style.left = `${e.clientX}px`
        spotRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [])

  return <div ref={spotRef} className="mouse-spotlight" aria-hidden="true" />
}

// ─── Animated Counter ────────────────────────────────
function AnimatedCounter({ value, isPercentage }) {
  const [display, setDisplay] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (hasAnimated) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setDisplay(value)
        setHasAnimated(true)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span ref={ref} className="animate-numberPop inline-block">
      {display}{isPercentage ? "%" : ""}
    </span>
  )
}


// ─── Achievement badge colours by index ────────────────────────────────────
const BADGE_GRADIENTS = [
  ["#7c3aed", "#a855f7"],   // violet
  ["#d97706", "#fbbf24"],   // amber
  ["#059669", "#34d399"],   // emerald
  ["#2563eb", "#60a5fa"],   // blue
  ["#db2777", "#f472b6"],   // pink
  ["#dc2626", "#f87171"],   // red
  ["#0891b2", "#38bdf8"],   // cyan
  ["#7c3aed", "#06b6d4"],   // violet-cyan
]

function AchievementBadge({ ach, unlocked, idx }) {
  const [g1, g2] = BADGE_GRADIENTS[idx % BADGE_GRADIENTS.length]

  return (
    <div
      className={`flex flex-col items-center gap-2 group cursor-default select-none transition-all duration-300 ${
        unlocked ? "hover:-translate-y-2" : "opacity-50"
      }`}
      title={ach.description}
    >
      {/* Badge shape container */}
      <div className="relative flex items-center justify-center" style={{ width: 88, height: 96 }}>

        {/* Outer glow ring — unlocked only */}
        {unlocked && (
          <div
            className="absolute inset-0 rounded-full animate-pulse-soft"
            style={{
              background: `radial-gradient(circle, ${g1}40 0%, transparent 70%)`,
              transform: "scale(1.35)",
            }}
          />
        )}

        {/* Shield SVG shape */}
        <svg
          viewBox="0 0 88 96"
          width="88"
          height="96"
          className={`absolute inset-0 drop-shadow-xl transition-all duration-300 ${
            unlocked ? "group-hover:drop-shadow-2xl" : "grayscale"
          }`}
        >
          <defs>
            <linearGradient id={`badgeGrad-${idx}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={unlocked ? g1 : "#6b7280"} />
              <stop offset="100%" stopColor={unlocked ? g2 : "#4b5563"} />
            </linearGradient>
            <linearGradient id={`shineGrad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id={`badgeShadow-${idx}`}>
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={unlocked ? g1 : "#374151"} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Shield body */}
          <path
            d="M44 4 L80 16 L80 48 Q80 76 44 92 Q8 76 8 48 L8 16 Z"
            fill={`url(#badgeGrad-${idx})`}
            filter={`url(#badgeShadow-${idx})`}
          />

          {/* Inner shield highlight */}
          <path
            d="M44 10 L74 20 L74 48 Q74 72 44 86 Q14 72 14 48 L14 20 Z"
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />

          {/* Top shine overlay */}
          <path
            d="M44 10 L74 20 L74 38 Q59 34 44 30 Q29 34 14 38 L14 20 Z"
            fill={`url(#shineGrad-${idx})`}
          />

          {/* Lock icon for locked state */}
          {!unlocked && (
            <g transform="translate(30, 34)">
              <rect x="4" y="12" width="20" height="16" rx="3" fill="rgba(255,255,255,0.35)" />
              <path d="M8 12 L8 8 Q14 2 20 8 L20 12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="14" cy="20" r="3" fill="rgba(255,255,255,0.5)" />
            </g>
          )}
        </svg>

        {/* Emoji icon — only for unlocked */}
        {unlocked && (
          <span
            className="relative z-10 text-3xl leading-none mt-2 transition-transform duration-300 group-hover:scale-110"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
          >
            {ach.icon}
          </span>
        )}
      </div>

      {/* Ribbon label bar */}
      <div
        className={`relative px-3 py-1 rounded-full text-center transition-all duration-300 ${
          unlocked
            ? "text-white shadow-lg"
            : "text-gray-400 bg-gray-800/60"
        }`}
        style={unlocked ? { background: `linear-gradient(135deg, ${g1}, ${g2})`, boxShadow: `0 4px 12px ${g1}60` } : {}}
      >
        <p className="text-[11px] font-bold tracking-wide whitespace-nowrap leading-tight">{ach.name}</p>
      </div>

      {/* Description */}
      <p className="text-[10px] text-muted-foreground text-center leading-tight max-w-[90px]">
        {ach.description}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [topics, setTopics] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [isDeleting, setIsDeleting] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [progressRecords, setProgressRecords] = useState([])
  const [achievements, setAchievements] = useState([])
  const containerRef = useRef(null)
  const heroOrbRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      toast({ variant: "destructive", title: "Authentication required", description: "Please log in to view your dashboard" })
      router.push("/login")
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [quizzesData, topicsData, statsData, progressData] = await Promise.all([
          getUserQuizzes(),
          getAllTopics(),
          getUserStats(),
          getUserProgress(),
        ])
        setQuizzes(quizzesData)
        setTopics(topicsData)
        setUserStats(statsData)
        setProgressRecords(Array.isArray(progressData) ? progressData : [])

        // Fetch achievements (non-blocking)
        getAchievements().then(data => setAchievements(data)).catch(() => {})
      } catch (error) {
        console.error("Error:", error)
        toast({ variant: "destructive", title: "Error", description: error.message || "Failed to fetch data" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [router, toast])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || !heroOrbRef.current) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    heroOrbRef.current.style.left = `${x * 100}%`
    heroOrbRef.current.style.top = `${y * 100}%`
  }, [])

  const topicChartData = Object.entries(
    progressRecords.reduce((acc, r) => {
      const topic = r?.quizId?.topic || r?.topic
      if (topic) acc[topic] = (acc[topic] || 0) + 1
      return acc
    }, {})
  ).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 8)

  // Compute weak topics for Adaptive Learning Engine Recommendation
  const topicPerformance = progressRecords.reduce((acc, r) => {
    const topic = r?.quizId?.topic || r?.topic
    if (topic && Number.isFinite(r?.percentage)) {
      if (!acc[topic]) acc[topic] = { totalScore: 0, count: 0 }
      acc[topic].totalScore += r.percentage
      acc[topic].count += 1
    }
    return acc
  }, {})

  const weakTopics = Object.entries(topicPerformance)
    .map(([topic, stats]) => ({
      topic,
      avgScore: stats.totalScore / stats.count,
    }))
    .filter(t => t.avgScore < 70) // Below 70% is considered weak
    .sort((a, b) => a.avgScore - b.avgScore) // Sort lowest first
    .slice(0, 3)

  const scoreOverTimeData = [...progressRecords]
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
    .slice(-12)
    .map((r) => ({
      date: new Date(r.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Number.isFinite(r.percentage) ? r.percentage : 0,
    }))

  const filteredQuizzes = quizzes.filter(
    (q) => q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteQuiz = async (id) => {
    if (confirm("Delete this quiz? This cannot be undone.")) {
      setIsDeleting(true)
      try {
        await deleteQuiz(id)
        setQuizzes(quizzes.filter((q) => q._id !== id))
        toast({ title: "Deleted", description: "Quiz deleted successfully" })
      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete quiz" })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const xpProgress = userStats ? ((userStats.experiencePoints % 100) / 100) * 100 : 0
  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden page-fade-in"
      ref={containerRef}
    >
      <div className="orb orb-1 opacity-50" />
      <div className="orb orb-2 opacity-50" style={{ animationDelay: "-5s" }} />

      <Header />

      <div className="container py-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-fadeIn">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight inline-block relative section-heading">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">Your learning command center</p>
          </div>
          <Button onClick={() => router.push("/create")} className="rounded-xl h-12 px-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 btn-ripple flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> 
            <span className="font-semibold">Create Quiz</span>
          </Button>
        </div>

        {/* Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 stagger-children">
            {/* Streak */}
            <TiltCard className="glass-card rounded-2xl p-4 col-span-1 border border-orange-500/10" intensity={8}>
              <div className="tilt-card-shine" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Flame className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">Streak</span>
              </div>
              <p className="text-3xl font-bold font-display animate-fire mt-1">
                <AnimatedCounter value={userStats.currentStreak || 0} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">days · Best: {userStats.longestStreak || 0}</p>
            </TiltCard>

            {/* Level & XP */}
            <TiltCard className="glass-card rounded-2xl p-4 col-span-1 border border-violet-500/10 relative overflow-hidden" intensity={8}>
              <div className="tilt-card-shine" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 blur-xl rounded-full -mr-10 -mt-10" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">Level</span>
              </div>
              <p className="text-3xl font-bold font-display mt-1 relative z-10">
                <AnimatedCounter value={userStats.level} />
              </p>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden relative z-10">
                <div className="h-full progress-gradient rounded-full" style={{ width: `${xpProgress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium relative z-10">{userStats.experiencePoints} XP</p>
            </TiltCard>

            {/* Quizzes Taken */}
            <TiltCard className="glass-card rounded-2xl p-4 border border-cyan-500/10" intensity={8}>
              <div className="tilt-card-shine" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">Quizzes</span>
              </div>
              <p className="text-3xl font-bold font-display text-cyan-600 dark:text-cyan-400 mt-1">
                <AnimatedCounter value={userStats.totalQuizzesTaken} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">completed</p>
            </TiltCard>

            {/* Average Score */}
            <TiltCard className="glass-card rounded-2xl p-4 border border-emerald-500/10" intensity={8}>
              <div className="tilt-card-shine" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">Avg Score</span>
              </div>
              <p className="text-3xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-1">
                <AnimatedCounter value={userStats.averageScore} isPercentage={true} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">accuracy</p>
            </TiltCard>

            {/* Best Score */}
            <TiltCard className="glass-card rounded-2xl p-4 border border-amber-500/10" intensity={8}>
              <div className="tilt-card-shine" />
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-muted-foreground font-semibold">Best</span>
              </div>
              <p className="text-3xl font-bold font-display text-amber-500 dark:text-amber-400 mt-1">
                <AnimatedCounter value={userStats.bestScore} isPercentage={true} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">highest score</p>
            </TiltCard>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 rounded-xl p-1 animate-fadeIn delay-150">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-violet-600 data-[state=active]:dark:text-violet-400 text-sm font-medium transition-all" onClick={() => setActiveTab("overview")}>Overview</TabsTrigger>
            <TabsTrigger value="my-quizzes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-violet-600 data-[state=active]:dark:text-violet-400 text-sm font-medium transition-all" onClick={() => setActiveTab("my-quizzes")}>My Quizzes</TabsTrigger>
            <TabsTrigger value="achievements" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-violet-600 data-[state=active]:dark:text-violet-400 text-sm font-medium transition-all" onClick={() => setActiveTab("achievements")}>
              <Award className="h-4 w-4 mr-1.5" /> Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 stagger-children">
                {/* Score Trend */}
                <TiltCard className="glass-card rounded-2xl p-6 shadow-xl" intensity={4}>
                  <div className="tilt-card-shine" />
                  <div className="flex items-center gap-2 mb-1 relative z-10">
                    <TrendingUp className="h-5 w-5 text-violet-500" />
                    <h3 className="font-bold text-lg font-display">Score Trend</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 relative z-10">Your last 12 quiz attempts</p>
                  <div className="h-64 relative z-10">
                    {scoreOverTimeData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scoreOverTimeData} margin={{ left: -15, right: 8, top: 8, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--foreground))", opacity: 0.7, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", opacity: 0.7, fontWeight: 500 }} tickLine={false} axisLine={false} />
                          <Tooltip 
                            formatter={(v) => [`${v}%`, "Score"]} 
                            contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))", background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }} 
                            itemStyle={{ color: "#fff" }}
                          />
                          <Line type="monotone" dataKey="score" stroke="url(#colorScore)" strokeWidth={4} dot={{ r: 5, fill: "hsl(var(--background))", stroke: "#7c3aed", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }} />
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#7c3aed" stopOpacity={1}/>
                            </linearGradient>
                          </defs>
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-xl">Complete more quizzes to see tracking trends</div>
                    )}
                  </div>
                </TiltCard>

                {/* Topics Breakdown */}
                <TiltCard className="glass-card rounded-2xl p-6 shadow-xl" intensity={4}>
                  <div className="tilt-card-shine" />
                  <div className="flex items-center gap-2 mb-1 relative z-10">
                    <PieChart className="h-5 w-5 text-cyan-500" />
                    <h3 className="font-bold text-lg font-display">Topics Breakdown</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 relative z-10">Quizzes by topic completion</p>
                  <div className="h-64 relative z-10">
                    {topicChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicChartData} margin={{ left: 10, right: 10, top: 8, bottom: 35 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                          <XAxis 
                            dataKey="topic" 
                            tick={{ fontSize: 13, fill: "hsl(var(--foreground))", opacity: 0.8, fontWeight: 600, fontFamily: "inherit" }} 
                            interval={0} 
                            angle={-45} 
                            textAnchor="end" 
                            height={80} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={15} 
                          />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--foreground))", opacity: 0.7, fontWeight: 500 }} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: 16, border: "1px solid hsl(var(--border))", background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }} 
                            itemStyle={{ color: "#fff" }}
                            cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }}
                          />
                          <Bar dataKey="count" name="Quizzes" radius={[6, 6, 0, 0]}>
                             {topicChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`url(#colorTarget${index % 3})`} />
                            ))}
                          </Bar>
                          <defs>
                            <linearGradient id="colorTarget0" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#7c3aed" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorTarget1" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            </linearGradient>
                            <linearGradient id="colorTarget2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ec4899" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-xl">No progress data yet</div>
                    )}
                  </div>
                </TiltCard>
              </div>
            )}

            {/* Adaptive Learning: Recommended Topics */}
            {!isLoading && weakTopics.length > 0 && (
              <TiltCard intensity={3} className="glass-card rounded-2xl p-6 border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-transparent relative overflow-hidden group shadow-xl">
                <div className="tilt-card-shine" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-xl flex items-center gap-2 font-display">
                        <Zap className="h-5 w-5 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" /> 
                        Recommended For You
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 text-violet-100/70">Focus on these topics to improve your overall mastery</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weakTopics.map((item, idx) => (
                      <div key={idx} className="bg-background/60 backdrop-blur-md rounded-xl p-4 border border-violet-500/20 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300">
                        <div className="flex items-start justify-between mb-2">
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center shadow-inner border border-red-500/20">
                            <Target className="h-5 w-5 text-red-400" />
                          </div>
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Needs Review</Badge>
                        </div>
                        <div className="min-w-0 mt-2">
                          <p className="font-bold text-base truncate">{item.topic}</p>
                          <div className="flex items-center gap-2 mt-2">
                             <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: `${Math.round(item.avgScore)}%` }} />
                             </div>
                            <p className="text-xs font-semibold text-muted-foreground">
                              {Math.round(item.avgScore)}% avg
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            )}

            {/* Recent Activity */}
            {progressRecords.length > 0 && (
              <div className="glass-card rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-lg font-display">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                  {progressRecords.slice(0, 5).map((record, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-border/50 hover:bg-secondary/30 transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                        record.percentage >= 80 ? "bg-gradient-to-br from-emerald-400/20 to-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                        record.percentage >= 50 ? "bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-500 border border-amber-500/20" :
                        "bg-gradient-to-br from-red-400/20 to-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {record.percentage}%
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base truncate group-hover:text-primary transition-colors">{record.quizId?.title || "Quiz"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{record.quizId?.topic} · {new Date(record.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                      </div>
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-medium">{record.score}/{record.totalQuestions}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5" >Correct</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* My Quizzes Tab */}
          <TabsContent value="my-quizzes" className="space-y-6">
             <div className="relative mb-6 max-w-md animate-fadeIn">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your created quizzes..."
                className="pl-11 h-12 rounded-xl bg-background/50 border-border/50 backdrop-blur-sm focus-visible:ring-violet-500 transition-all shadow-sm focus:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <div key={i} className="glass-card rounded-2xl animate-pulse h-56" />)}
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                {filteredQuizzes.map((quiz) => (
                  <TiltCard key={quiz._id} className="glass-card rounded-2xl overflow-hidden group quiz-card-premium" intensity={6}>
                    <div className="tilt-card-shine" />
                    
                    {/* Glowing status bar */}
                    <div className="h-1.5 bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500 bg-[length:200%_auto] animate-gradientMove" />
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg truncate flex-1 mr-3 group-hover:text-violet-500 transition-colors">{quiz.title}</h3>
                        <Badge variant="outline" className={`text-xs ml-auto border ${
                           quiz.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                           quiz.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                           'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{quiz.topic}</span>
                        <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5" />{quiz.questions.length} Qs</span>
                      </div>
                      
                      {quiz.description && <p className="text-sm text-foreground/80 line-clamp-2 mb-6 h-10">{quiz.description}</p>}
                      
                      <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                        <Button variant="ghost" size="sm" className="rounded-lg text-sm font-semibold hover:bg-violet-500/10 hover:text-violet-500 -ml-2" onClick={() => router.push(`/quiz/${quiz._id}`)}>
                          Play Quiz <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                        <div className="flex gap-1 bg-secondary/50 rounded-lg p-1 backdrop-blur-sm relative z-20">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md text-violet-500 hover:text-white hover:bg-violet-500 transition-colors" 
                            onClick={(e) => {
                              e.stopPropagation();
                              const shareUrl = `${window.location.origin}/quiz/shared/${quiz.shareId}`
                              navigator.clipboard.writeText(shareUrl)
                              toast({ title: "Link Copied", description: "Share link copied to clipboard" })
                            }}
                            title="Share"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md hover:text-white transition-colors hover:bg-blue-500" 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/quiz/${quiz._id}/edit`)
                            }}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-md text-red-500 hover:text-white hover:bg-red-500 transition-colors" 
                            onClick={(e) => {
                               e.stopPropagation();
                               handleDeleteQuiz(quiz._id)
                            }} 
                            disabled={isDeleting}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                ))}
              </div>
            ) : (
              <TiltCard className="glass-card rounded-3xl p-16 text-center max-w-2xl mx-auto border-dashed border-2" intensity={2}>
                <div className="tilt-card-shine" />
                <div className="w-20 h-20 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                   <BookOpen className="h-10 w-10 text-violet-500" />
                </div>
                <h3 className="font-bold text-2xl mb-3 font-display">{searchQuery ? "No matches found" : "No quizzes yet"}</h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">{searchQuery ? "Try a different search term" : "You haven't created any quizzes. Create your first interactive learning challenge now!"}</p>
                <Button onClick={() => router.push("/create")} className="rounded-xl h-14 px-8 bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-xl hover:shadow-violet-500/40 transition-all hover:scale-105 active:scale-95 text-lg font-semibold">
                  <PlusCircle className="h-5 w-5 mr-2" /> Start Creating
                </Button>
              </TiltCard>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-8 animate-fadeIn">

             {/* Header progress card */}
             <TiltCard className="relative glass-card rounded-3xl p-8 overflow-hidden shadow-xl border border-amber-500/20" intensity={5}>
              <div className="tilt-card-shine" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-amber-500/10 pointer-events-none" />
              <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                     <Award className="h-8 w-8 text-white animate-bounce-soft" />
                   </div>
                   <div>
                    <h3 className="font-bold text-2xl font-display mb-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                      Mastery Path
                    </h3>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                       <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-full bg-violet-500/10 text-violet-500 font-bold border border-violet-500/20">{unlockedAchievements.length}</span>
                       <span className="font-medium text-foreground">of</span>
                       <span className="inline-flex h-6 px-2.5 items-center justify-center rounded-full bg-secondary font-bold border border-border">{achievements.length}</span>
                       <span>Unlocked</span>
                    </p>
                   </div>
                </div>
                
                <div className="flex flex-col items-end gap-3 flex-1 max-w-md w-full">
                  <div className="flex justify-between w-full">
                     <span className="text-sm font-semibold">Progress</span>
                     <span className="text-sm font-bold text-amber-500">
                      {achievements.length ? Math.round((unlockedAchievements.length / achievements.length) * 100) : 0}%
                     </span>
                  </div>
                  <div className="h-4 w-full bg-secondary rounded-full overflow-hidden border border-border/50 shadow-inner p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{ 
                        width: `${achievements.length ? (unlockedAchievements.length / achievements.length) * 100 : 0}%`,
                        background: `linear-gradient(90deg, #f59e0b, #ec4899)`
                      }}
                    >
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[shimmer_2s_linear_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>

            {/* Unlocked badges */}
            {unlockedAchievements.length > 0 && (
              <div className="animate-slideUp delay-100">
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-2">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <Star className="h-4 w-4 text-emerald-500 fill-emerald-500" />
                   </div>
                  <h4 className="text-lg font-bold font-display">Unlocked Achievements</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 stagger-children">
                  {unlockedAchievements.map((ach, idx) => (
                    <TiltCard key={ach.id} intensity={15} className="flex justify-center p-2 rounded-2xl hover:bg-white/5 transition-colors">
                       <AchievementBadge ach={ach} unlocked={true} idx={idx} />
                    </TiltCard>
                  ))}
                </div>
              </div>
            )}

            {/* Locked badges */}
            {lockedAchievements.length > 0 && (
              <div className="animate-slideUp delay-200 mt-12 opacity-80">
                <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-2">
                   <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border">
                     <span className="h-4 w-4 text-muted-foreground">🔒</span>
                   </div>
                  <h4 className="text-lg font-bold font-display text-muted-foreground">Still to Unlock</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {lockedAchievements.map((ach, idx) => (
                    <div key={ach.id} className="flex justify-center p-2">
                      <AchievementBadge ach={ach} unlocked={false} idx={idx + unlockedAchievements.length} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {achievements.length === 0 && (
               <TiltCard className="glass-card rounded-3xl p-16 text-center max-w-xl mx-auto border border-dashed text-muted-foreground" intensity={2}>
                 <div className="tilt-card-shine" />
                <Award className="h-16 w-16 opacity-30 mx-auto mb-6 saturate-0" />
                <h3 className="font-bold text-2xl mb-2 font-display text-foreground">No achievements available</h3>
                <p className="text-base">System is still setting up your achievement track.</p>
              </TiltCard>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
