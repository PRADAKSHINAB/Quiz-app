"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, FileText, Trophy, ArrowRight, Clock, Star, Zap, Target, Flame, Users, Sparkles, ChevronRight, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getAllTopics, getFeaturedQuizzes, getLeaderboard } from "@/lib/api"
import { isAuthenticated } from "@/lib/auth"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuizCoverImage } from "@/components/quiz-cover-image"

const TOPIC_ICONS = {
  Mathematics: "📊", Science: "🔬", History: "📜", Geography: "🌍",
  Literature: "📚", Technology: "💻", Sports: "⚽", Music: "🎵",
  Movies: "🎬", "General Knowledge": "🧠", JavaScript: "🟨",
  React: "⚛️", Python: "🐍", Economics: "💹",
}

const TOPIC_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
  "from-pink-500 to-rose-600",
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-cyan-600",
  "from-fuchsia-500 to-pink-600",
]

function DifficultyBadge({ difficulty }) {
  const map = {
    Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 badge-easy",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 badge-medium",
    Hard: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 badge-hard",
  }
  return (
    <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${map[difficulty] || map.Easy}`}>
      {difficulty}
    </Badge>
  )
}

/* ── Tilt Card Component ──────────────────────────────── */
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

/* ── Magnetic Button Component ──────────────────────── */
function MagneticButton({ children, className = "", strength = 0.35 }) {
  const ref = useRef(null)

  const handleMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * strength
    const y = (e.clientY - rect.top - rect.height / 2) * strength
    el.style.transform = `translate(${x}px, ${y}px)`
    el.style.transition = "transform 0.15s ease"
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = "translate(0, 0)"
    el.style.transition = "transform 0.5s cubic-bezier(0.4,0,0.2,1)"
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

/* ── Floating Particles ─────────────────────────────── */
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 15}s`,
    duration: `${Math.random() * 15 + 10}s`,
    color: ["rgba(124,58,237,0.5)", "rgba(6,182,212,0.5)", "rgba(168,85,247,0.5)", "rgba(251,191,36,0.4)"][Math.floor(Math.random() * 4)],
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

/* ── Cyber Grid Background ─────────────────────────── */
function CyberGrid() {
  return (
    <div className="cyber-grid" aria-hidden="true" />
  )
}

/* ── Mouse Spotlight ───────────────────────────────── */
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

  return (
    <div
      ref={spotRef}
      className="mouse-spotlight"
      aria-hidden="true"
    />
  )
}

/* ── Animated Counter ──────────────────────────────── */
function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState("0")
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDisplay(value)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref} className="animate-numberPop">{display}</span>
}

/* ── Main Page ─────────────────────────────────────── */
export default function Home() {
  const [topics, setTopics] = useState([])
  const [featuredQuizzes, setFeaturedQuizzes] = useState([])
  const [topLeaders, setTopLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    // Failsafe: force loading to false after 5 seconds if backend hangs
    const timeout = setTimeout(() => setLoading(false), 5000)

    const fetchData = async () => {
      try {
        const [topicsData, quizzesData] = await Promise.all([
          getAllTopics(),
          getFeaturedQuizzes(6),
        ])
        setTopics(topicsData.slice(0, 8))
        setFeaturedQuizzes(quizzesData)
        setIsLoggedIn(isAuthenticated())
        getLeaderboard("weekly", 5).then(data => setTopLeaders(data)).catch(() => { })
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
        clearTimeout(timeout)
      }
    }
    fetchData()
    return () => clearTimeout(timeout)
  }, [])

  const stats = [
    { icon: Users, label: "Active Learners", value: "10K+", color: "text-violet-500", glowColor: "rgba(124,58,237,0.4)" },
    { icon: BookOpen, label: "Quizzes Available", value: "500+", color: "text-cyan-500", glowColor: "rgba(6,182,212,0.4)" },
    { icon: Trophy, label: "Achievements", value: "15+", color: "text-amber-500", glowColor: "rgba(245,158,11,0.4)" },
    { icon: Flame, label: "Daily Streaks", value: "∞", color: "text-orange-500", glowColor: "rgba(249,115,22,0.4)" },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden page-fade-in">
      {/* Mouse spotlight */}
      <MouseSpotlight />

      {/* Cyber grid */}
      <CyberGrid />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Background Orbs — enhanced */}
      <div className="orb orb-1 orb-hero" />
      <div className="orb orb-2 orb-hero" style={{ animationDelay: "-3s" }} />
      <div className="orb orb-3 orb-hero" style={{ animationDelay: "-7s" }} />
      {/* Extra accent orbs */}
      <div className="orb orb-accent-1" />
      <div className="orb orb-accent-2" />

      <Header />

      <main className="relative z-10">

        {/* ── Hero Section ───────────────────────────────────── */}
        <section
          className="container mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 hero-section"
        >
          <div className="max-w-4xl mx-auto text-center animate-fadeIn">

            {/* Floating badge */}
            <MagneticButton className="inline-block" strength={0.2}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8 animate-badge-bob hero-badge-glow">
                <Sparkles className="h-3.5 w-3.5 sparkle" />
                AI-Powered Adaptive Learning
              </div>
            </MagneticButton>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display tracking-tight mb-6 leading-[1.1]">
              Master Any Subject{" "}
              <span className="gradient-text-animated hero-text-glow">with Smart Quizzes</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Create, share, and conquer quizzes with adaptive learning that evolves with you.
              Track streaks, earn achievements, and climb the global leaderboard.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <MagneticButton>
                <Link href={isLoggedIn ? "/create" : "/signup"}>
                  <Button className="h-12 px-8 text-base rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5 btn-ripple hero-cta-btn">
                    {isLoggedIn ? "Create Quiz" : "Start Learning Free"}
                    <ArrowRight className="ml-2 h-4 w-4 cta-arrow" />
                  </Button>
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/topics">
                  <Button variant="outline" className="h-12 px-8 text-base rounded-xl border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all duration-300 hover:-translate-y-0.5 hero-outline-btn">
                    Explore Topics
                  </Button>
                </Link>
              </MagneticButton>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 stagger-children">
              {stats.map((stat) => (
                <TiltCard key={stat.label} className="glass-card rounded-2xl p-4 text-center cursor-default" intensity={8}>
                  <div className="tilt-card-shine" />
                  <stat.icon
                    className={`h-6 w-6 mx-auto mb-2 ${stat.color} transition-transform duration-300 topic-icon-animated`}
                    style={{ filter: `drop-shadow(0 0 8px ${stat.glowColor})` }}
                  />
                  <div className="text-2xl font-bold font-display">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Popular Topics ──────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display section-heading">Popular Topics</h2>
              <p className="text-muted-foreground mt-1">Choose your area of interest</p>
            </div>
            <Link href="/topics" className="flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group view-all-link">
              View all topics
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 animate-pulse h-36" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
              {topics.map((topic, idx) => (
                <Link href={`/topics/${topic.slug}`} key={topic._id || topic.slug || topic.name} className="block group">
                  <TiltCard className="glass-card rounded-2xl p-5 h-full relative overflow-hidden topic-card" intensity={12}>
                    <div className="tilt-card-shine" />
                    {/* Corner gradient accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-[48px] bg-gradient-to-br ${TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]} opacity-10 group-hover:opacity-30 transition-opacity duration-400`} />

                    {/* Animated corner glow */}
                    <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500`} />

                    {/* Icon */}
                    <div className="text-3xl mb-3 topic-icon-animated select-none">
                      {TOPIC_ICONS[topic.name] || "📋"}
                    </div>

                    <h3 className="font-semibold text-sm mb-1 quiz-title-hover group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{topic.quizCount || 0} quizzes</p>

                    {/* Hover bottom bar */}
                    <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]} transition-all duration-500 rounded-b-2xl`} />
                  </TiltCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Featured Quizzes ─────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold font-display section-heading">Featured Quizzes</h2>
              <p className="text-muted-foreground mt-1">Handpicked challenges for you</p>
            </div>
            <Link href="/topics" className="flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 group transition-colors view-all-link">
              Browse all
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl animate-pulse h-80" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {featuredQuizzes.map((quiz) => (
                <Link href={`/quiz/${quiz._id || quiz.id}`} key={quiz._id || quiz.id} className="block group">
                  <TiltCard className="glass-card rounded-2xl overflow-hidden h-full flex flex-col quiz-card-premium" intensity={6}>
                    <div className="tilt-card-shine" />

                    {/* Cover image */}
                    <div className="relative h-44 w-full overflow-hidden">
                      <QuizCoverImage quiz={quiz} />

                      {/* Difficulty badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <DifficultyBadge difficulty={quiz.difficulty} />
                      </div>

                      {/* Topic chip overlay bottom-left */}
                      <div className="absolute bottom-3 left-3 z-10">
                        <span className="topic-chip">
                          {TOPIC_ICONS[quiz.topic] || "📋"} {quiz.topic}
                        </span>
                      </div>

                      {/* Image overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-violet-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Card body */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold mb-2 quiz-title-hover group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {quiz.description}
                      </p>

                      {/* Footer meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
                        <div className="flex items-center gap-1.5 meta-icon-hover">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{Math.floor(quiz.timeLimit / 60)} min</span>
                        </div>
                        <div className="flex items-center gap-1.5 meta-icon-hover">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span>{quiz.questions?.length || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium group-hover:gap-2 transition-all">
                          Play <ArrowRight className="h-3.5 w-3.5 cta-arrow" />
                        </div>
                      </div>
                    </div>

                    {/* Bottom glow bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </TiltCard>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── Features + Leaderboard ──────────────────────────── */}
        <section className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Features */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl md:text-3xl font-bold font-display mb-8 section-heading">Why QuizMaster?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                {[
                  { icon: Brain, title: "Adaptive Learning", desc: "AI tracks your weak areas and reinforces them with spaced repetition.", gradient: "from-violet-500 to-purple-600", glow: "rgba(124,58,237,0.25)" },
                  { icon: Flame, title: "Daily Streaks", desc: "Build momentum with daily challenges and earn streak bonuses.", gradient: "from-orange-500 to-red-500", glow: "rgba(249,115,22,0.25)" },
                  { icon: Trophy, title: "Achievements", desc: "Unlock 15+ achievements as you hit milestones in your learning.", gradient: "from-amber-500 to-yellow-500", glow: "rgba(245,158,11,0.25)" },
                  { icon: Target, title: "Leaderboard", desc: "Compete with learners worldwide and climb the weekly rankings.", gradient: "from-cyan-500 to-blue-500", glow: "rgba(6,182,212,0.25)" },
                  { icon: Zap, title: "AI Quiz Generator", desc: "Generate custom quizzes on any topic instantly with AI.", gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.25)" },
                  { icon: Award, title: "Performance Analytics", desc: "Detailed insights into your progress across all topics.", gradient: "from-pink-500 to-rose-500", glow: "rgba(236,72,153,0.25)" },
                ].map((feature) => (
                  <TiltCard
                    key={feature.title}
                    className="glass-card rounded-2xl p-5 group feature-card"
                    intensity={10}
                  >
                    <div className="tilt-card-shine" />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300 feature-icon`}
                      style={{ boxShadow: `0 4px 16px ${feature.glow}` }}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1.5 quiz-title-hover">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>

                    {/* hover border glow */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 20px ${feature.glow}` }}
                    />
                  </TiltCard>
                ))}
              </div>
            </div>

            {/* Mini Leaderboard */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold font-display section-heading">Top Learners</h2>
                <Link href="/leaderboard" className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors view-all-link">
                  View all
                </Link>
              </div>
              <TiltCard className="glass-card rounded-2xl p-5" intensity={4}>
                <div className="tilt-card-shine" />
                {topLeaders.length > 0 ? (
                  <div className="space-y-2">
                    {topLeaders.map((leader, idx) => (
                      <div key={leader._id || idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/5 transition-all duration-200 leaderboard-row leaderboard-row-enhanced">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${idx === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white rank-gold" :
                            idx === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white rank-silver" :
                              idx === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white rank-bronze" :
                                "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}>
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{leader.username}</p>
                          <p className="text-xs text-muted-foreground">Level {leader.level} · {leader.quizzesTaken} quizzes</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-violet-600 dark:text-violet-400">{leader.totalScore}</p>
                          <p className="text-xs text-muted-foreground">pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Trophy className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3 animate-bounce-soft" />
                    <p className="text-sm text-muted-foreground">Complete quizzes to appear on the leaderboard!</p>
                  </div>
                )}
              </TiltCard>
            </div>
          </div>
        </section>

        {/* ── How it Works ─────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-24 border-t border-violet-100/10 dark:border-violet-900/10">
          <div className="text-center mb-16 animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 section-heading">How it Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Master any subject in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {[
              {
                step: "01",
                title: "Choose a Topic",
                desc: "Explore our vast library of topics or create your own custom quiz.",
                icon: BookOpen,
                color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                glow: "rgba(124,58,237,0.15)",
                gradient: "from-violet-500 to-purple-600",
              },
              {
                step: "02",
                title: "Take the Quiz",
                desc: "Answer adaptive questions that adjust to your knowledge level in real-time.",
                icon: Zap,
                color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
                glow: "rgba(6,182,212,0.15)",
                gradient: "from-cyan-500 to-blue-600",
              },
              {
                step: "03",
                title: "Track Progress",
                desc: "Analyze your performance, earn achievements, and climb the leaderboard.",
                icon: Trophy,
                color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                glow: "rgba(245,158,11,0.15)",
                gradient: "from-amber-500 to-orange-600",
              }
            ].map((item, i) => (
              <TiltCard
                key={i}
                className="relative p-8 rounded-3xl glass-card text-center group how-it-works-card"
                intensity={8}
                style={{ boxShadow: `0 8px 32px ${item.glow}` }}
              >
                <div className="tilt-card-shine" />
                {/* Step number badge */}
                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center font-bold text-white shadow-xl group-hover:scale-110 transition-transform text-sm`}>
                  {item.step}
                </div>

                {/* Connector line (except last) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-violet-300 to-transparent dark:from-violet-700 z-10" />
                )}

                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>

                {/* Bottom glow */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-3xl`} />
              </TiltCard>
            ))}
          </div>
        </section>

        {/* ── CTA Section ──────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-32">
          <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 p-12 md:p-20 text-center text-white shadow-2xl shadow-violet-500/40 cta-block">
            {/* Decorative animated rings */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
              <div className="absolute top-8 left-8 w-40 h-40 rounded-full border-4 border-white cta-deco-ring" />
              <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full border-8 border-white" style={{ animation: "ctaCircleSpin 30s linear infinite reverse" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-white" style={{ animation: "ctaCircleSpin 40s linear infinite" }} />
            </div>

            {/* Floating sparkles */}
            <div className="absolute top-6 right-24 pointer-events-none">
              <Sparkles className="h-6 w-6 text-yellow-300 sparkle" />
            </div>
            <div className="absolute bottom-10 left-20 pointer-events-none">
              <Sparkles className="h-4 w-4 text-white sparkle" style={{ animationDelay: "0.6s" }} />
            </div>
            <div className="absolute top-1/2 right-10 pointer-events-none">
              <Sparkles className="h-5 w-5 text-pink-300 sparkle" style={{ animationDelay: "1.2s" }} />
            </div>

            {/* Animated glow orb inside CTA */}
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-soft pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: "1s" }} />

            <h2 className="text-3xl md:text-5xl font-bold font-display mb-6 relative z-10 neon-text">
              Ready to start your learning journey?
            </h2>
            <p className="text-violet-100 max-w-2xl mx-auto mb-10 text-lg relative z-10">
              Join thousands of learners and start mastering new subjects today with our interactive quizzes.
            </p>
            <MagneticButton className="inline-block relative z-10">
              <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                <Button className="h-14 px-10 text-lg rounded-2xl bg-white text-violet-600 hover:bg-violet-50 shadow-xl transition-all hover:scale-105 active:scale-95 btn-ripple font-bold cta-final-btn">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5 cta-arrow" />
                </Button>
              </Link>
            </MagneticButton>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
