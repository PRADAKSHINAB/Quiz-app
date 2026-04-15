"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Brain, Star, Trophy,
  Share2, Copy, Check, Zap, ArrowRight, User, QrCode, X
} from "lucide-react"
import { getQuizByShareId, submitProgress } from "@/lib/api"
import { isAuthenticated, getUserProfile } from "@/lib/auth"
import { Header } from "@/components/header"
import { MusicPlayer } from "@/components/music-player"
import { sounds } from "@/lib/sounds"

// ─── QR Code (CSS-drawn fallback ─ no external lib needed) ────────────────
function SimpleQR({ url }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl">
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=5b21b6&qzone=1`}
        alt="QR Code"
        className="w-40 h-40 rounded-xl"
        onError={(e) => { e.target.style.display = "none" }}
      />
      <p className="text-[10px] text-gray-500 text-center">Scan to take this quiz</p>
    </div>
  )
}

// ─── Share Panel ──────────────────────────────────────────────────────────
function SharePanel({ quiz, onClose }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/quiz/shared/${quiz.shareId}`
    : `/quiz/shared/${quiz.shareId}`

  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl) } catch (_) {}
    setCopied(true)
    sounds.click()
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="glass-card rounded-3xl p-6 w-full max-w-sm relative animate-scale-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-bold font-display">Share This Quiz</h3>
          <p className="text-sm text-muted-foreground mt-1">Anyone can take this quiz — no login needed!</p>
        </div>

        {showQR ? (
          <div className="flex justify-center mb-4">
            <SimpleQR url={shareUrl} />
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-secondary/70 rounded-xl p-3 mb-4 border border-border/50">
            <p className="text-xs text-muted-foreground flex-1 truncate font-mono">{shareUrl}</p>
            <button onClick={copy} className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${copied ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "hover:bg-violet-100 dark:hover:bg-violet-500/10 text-violet-600"}`}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "Copy", icon: <Copy className="h-4 w-4 text-violet-600 dark:text-violet-400" />, bg: "bg-violet-100 dark:bg-violet-500/20", action: copy },
            { label: "QR Code", icon: <QrCode className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />, bg: "bg-cyan-100 dark:bg-cyan-500/20", action: () => setShowQR(!showQR) },
            { label: "WhatsApp", icon: <span className="text-base leading-none">💬</span>, bg: "bg-emerald-100 dark:bg-emerald-500/20", action: () => window.open(`https://wa.me/?text=${encodeURIComponent(`🧠 Quiz Challenge: ${quiz.title}\n${shareUrl}`)}`, "_blank") },
            { label: "Twitter", icon: <span className="text-base leading-none">𝕏</span>, bg: "bg-sky-100 dark:bg-sky-500/20", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🧠 Take this quiz: ${quiz.title}`)}&url=${encodeURIComponent(shareUrl)}`, "_blank") },
          ].map(({ label, icon, bg, action }) => (
            <button key={label} onClick={action} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-secondary transition-all">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
              <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
            </button>
          ))}
        </div>

        {navigator?.share && (
          <button onClick={() => navigator.share({ title: quiz.title, text: `Take this quiz: ${quiz.title}`, url: shareUrl }).catch(()=>{})}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
            Share via App
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Confetti burst ───────────────────────────────────────────────────────
function ConfettiBurst({ active }) {
  if (!active) return null
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: ["#7c3aed","#06b6d4","#f59e0b","#10b981","#ec4899","#f97316"][i % 6],
    x: (Math.random() - 0.5) * 280,
    y: -(Math.random() * 200 + 80),
    rot: Math.random() * 720 - 360,
    size: Math.random() * 8 + 5,
  }))
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <div key={p.id} className="absolute left-1/2 top-1/2 rounded-sm animate-confetti-piece"
          style={{ width: p.size, height: p.size, background: p.color, "--tx": `${p.x}px`, "--ty": `${p.y}px`, "--rot": `${p.rot}deg` }} />
      ))}
    </div>
  )
}

// ─── Main shared quiz page ────────────────────────────────────────────────
export default function SharedQuizPage({ params }) {
  const router = useRouter()
  const { shareId } = params
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState("intro") // intro | playing | done
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [user, setUser] = useState(null)
  const [results, setResults] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showShare, setShowShare] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAuthenticated()) {
          try {
            const userData = await getUserProfile()
            setUser(userData)
          } catch (e) {
            console.error("Failed to load user profile:", e)
            import("@/lib/auth").then(m => m.logout())
          }
        }
        const quizData = await getQuizByShareId(shareId)
        setQuiz(quizData)
        setTimeLeft(quizData.timeLimit || 600)
      } catch (error) {
        console.error("SharedQuiz fetch error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [shareId])

  // Timer while playing
  useEffect(() => {
    if (phase !== "playing" || !quiz) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timer); setPhase("done"); return 0 }
        if (prev <= 10) sounds.tick()
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, quiz])

  const startQuiz = () => {
    sounds.click()
    setStartTime(Date.now())
    setPhase("playing")
  }

  const handleAnswerSelect = (idx) => {
    if (isAnswered) return
    setSelectedAnswer(idx)
    setIsAnswered(true)
    const isCorrect = idx === quiz.questions[currentQuestion].correctAnswer
    if (isCorrect) { setScore(s => s + 1); setAnswerFeedback("correct"); sounds.correct() }
    else { setAnswerFeedback("wrong"); sounds.wrong() }
    setAnswers(prev => [...prev, { questionIndex: currentQuestion, selectedAnswer: idx, isCorrect }])
    setTimeout(() => setAnswerFeedback(null), 600)
  }

  const handleNext = () => {
    sounds.next()
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(q => q + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setPhase("done")
      submitResults()
    }
  }

  const submitResults = useCallback(async () => {
    if (!user || !quiz || hasSubmittedRef.current) return
    hasSubmittedRef.current = true
    try {
      const timeTaken = Math.floor((Date.now() - (startTime || Date.now())) / 1000)
      const data = await submitProgress({ quizId: quiz._id, score, totalQuestions: quiz.questions.length, timeTaken, answers })
      setResults(data)
      if (data?.leveledUp) sounds.levelUp(); else sounds.complete()
    } catch (e) { sounds.complete() }
    setTimeout(() => { setConfetti(true); setTimeout(() => setConfetti(false), 2000) }, 400)
  }, [user, quiz, score, startTime, answers])

  const formatTime = (s) => `${Math.floor(s/60)}:${(s%60)<10?"0":""}${s%60}`

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-violet-500/40 animate-ping" style={{animationDelay:"0.3s"}} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-8 w-8 text-violet-500 animate-pulse" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="glass-card rounded-3xl p-8 text-center max-w-md relative z-10">
          <Brain className="h-16 w-16 text-violet-200 dark:text-violet-800 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 font-display">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-8">This shared quiz link is invalid or has expired.</p>
          <Link href="/topics">
            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold shadow-lg shadow-violet-500/20">
              Browse All Quizzes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── Intro screen ───────────────────────────────────────────────────────
  if (phase === "intro") {
    const diffColor = quiz.difficulty?.toLowerCase() === "easy"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : quiz.difficulty?.toLowerCase() === "medium"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
      : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"

    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center p-4">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="glass-card rounded-3xl p-8 max-w-lg w-full relative z-10 animate-slideUp text-center">
          {/* Header badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-6">
            <Share2 className="h-3 w-3" /> Shared Quiz
          </div>

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30 animate-bounce-soft">
            <Brain className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-display mb-2 leading-tight">{quiz.title}</h1>
          {quiz.description && <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{quiz.description}</p>}

          {/* Meta badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffColor}`}>{quiz.difficulty}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">{quiz.topic}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
              ⏱ {Math.floor((quiz.timeLimit || 600)/60)} min
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground">
              📝 {quiz.questions?.length} questions
            </span>
          </div>

          {/* Creator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              {(quiz.createdBy?.username || "A").charAt(0).toUpperCase()}
            </div>
            <p className="text-sm text-muted-foreground">by <span className="font-medium text-foreground">{quiz.createdBy?.username || "Anonymous"}</span></p>
          </div>

          <Button onClick={startQuiz} className="w-full h-13 py-3.5 text-base font-semibold rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
            Start Quiz 🚀
          </Button>

          <div className="flex gap-2 mt-3">
            <button onClick={() => setShowShare(true)} className="flex-1 py-2.5 rounded-xl border border-border hover:bg-secondary flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all">
              <Share2 className="h-4 w-4" /> Share
            </button>
            <Link href="/topics" className="flex-1 py-2.5 rounded-xl border border-border hover:bg-secondary flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all">
              Browse All
            </Link>
          </div>

          {!user && (
            <p className="text-xs text-muted-foreground mt-4">
              <Link href="/signup" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Sign up free</Link> to track your progress & earn XP!
            </p>
          )}
        </div>
        {showShare && <SharePanel quiz={quiz} onClose={() => setShowShare(false)} />}
        <MusicPlayer />
      </div>
    )
  }

  // ─── Results screen ─────────────────────────────────────────────────────
  if (phase === "done") {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0
    const circumference = 2 * Math.PI * 54
    const offset = circumference - (percentage / 100) * circumference
    const message = percentage >= 90 ? "Outstanding! 🎉" : percentage >= 70 ? "Great Job! 🌟" : percentage >= 50 ? "Good Effort! 💪" : "Keep Trying! 🔄"

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <ConfettiBurst active={confetti} />
        <div className="orb orb-1" /><div className="orb orb-3" />
        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center relative z-10 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-amber-500/30 animate-bounce-soft">
            <Trophy className="h-8 w-8 text-white" />
          </div>

          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="score-ring w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-border/30" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGrad2)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} />
              <defs>
                <linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" /><stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-display">{percentage}%</span>
              <span className="text-xs text-muted-foreground">Score</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold font-display mb-1">{message}</h2>
          <p className="text-sm text-muted-foreground mb-5">{quiz.title}</p>

          <div className="flex justify-center gap-2 mb-5">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className={`h-7 w-7 transition-all duration-500 ${i < stars ? "text-amber-500 fill-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "text-gray-300 dark:text-gray-700"}`} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3 border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{score}</p>
              <p className="text-[10px] text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 border border-red-100 dark:border-red-500/20">
              <XCircle className="h-4 w-4 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{quiz.questions.length - score}</p>
              <p className="text-[10px] text-muted-foreground">Wrong</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 p-3 border border-violet-100 dark:border-violet-500/20">
              <Zap className="h-4 w-4 text-violet-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{results?.xpEarned || (user ? "—" : "0")}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
          </div>

          {results?.leveledUp && (
            <div className="rounded-xl bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-500/10 dark:to-cyan-500/10 p-4 mb-4 border border-violet-200 dark:border-violet-700 animate-pulse-soft">
              <p className="font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">⭐ Level Up! → Level {results.newLevel}</p>
            </div>
          )}

          {/* CTA for guests */}
          {!user && (
            <div className="rounded-2xl bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-500/10 dark:to-cyan-500/10 p-4 mb-4 border border-violet-200/50 dark:border-violet-700/30">
              <p className="text-sm font-semibold mb-1">Track your progress!</p>
              <p className="text-xs text-muted-foreground mb-3">Create a free account to earn XP, unlock achievements & climb the leaderboard.</p>
              <Link href="/signup">
                <Button className="w-full h-9 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-semibold">
                  Sign Up Free
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-2.5">
            <button onClick={() => setShowShare(true)} className="w-full py-2.5 rounded-xl border border-violet-200 dark:border-violet-800 text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all">
              <Share2 className="h-4 w-4 text-violet-600 dark:text-violet-400" /> Share This Quiz
            </button>
            <div className="grid grid-cols-2 gap-2">
              {user ? (
                <Button variant="outline" className="rounded-xl border-violet-200 dark:border-violet-800" onClick={() => router.push("/dashboard")}>Dashboard</Button>
              ) : (
                <Button variant="outline" className="rounded-xl border-violet-200 dark:border-violet-800" onClick={() => router.push("/login")}>Sign In</Button>
              )}
              <Button variant="outline" className="rounded-xl border-violet-200 dark:border-violet-800" onClick={() => router.push("/topics")}>More Quizzes</Button>
            </div>
          </div>
        </div>
        {showShare && <SharePanel quiz={quiz} onClose={() => setShowShare(false)} />}
        <MusicPlayer />
      </div>
    )
  }

  // ─── Quiz playing screen ─────────────────────────────────────────────────
  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const isLowTime = timeLeft <= 30
  const isVeryLowTime = timeLeft <= 10

  return (
    <div className={`min-h-screen bg-background relative transition-all duration-300 ${
      answerFeedback === "correct" ? "bg-emerald-50/30 dark:bg-emerald-950/20" :
      answerFeedback === "wrong"   ? "bg-red-50/30 dark:bg-red-950/20" : ""
    }`}>
      <div className="orb orb-1 opacity-20" /><div className="orb orb-2 opacity-10" />

      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button variant="ghost" size="sm" className="rounded-lg text-sm gap-1" onClick={() => setPhase("intro")}>
              <ArrowLeft className="h-4 w-4" /> Exit
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-muted-foreground font-medium truncate max-w-[200px]">{quiz.title}</div>
              <button onClick={() => setShowShare(true)} className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold tabular-nums transition-all duration-300 ${
                isVeryLowTime ? "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse scale-105 ring-2 ring-red-400/30" :
                isLowTime     ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse-soft" :
                "bg-secondary"
              }`}>
                <Clock className={`h-4 w-4 ${isVeryLowTime ? "text-red-500" : isLowTime ? "text-amber-500" : ""}`} />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden -mb-px">
            <div className="h-full progress-gradient transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <main className="container max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold px-3 py-1 rounded-full">
            {currentQuestion + 1} / {quiz.questions.length}
          </span>
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{score}</span>
          </div>
        </div>

        {/* Guest banner */}
        {!user && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 flex items-center gap-3">
            <User className="h-4 w-4 text-violet-500 flex-shrink-0" />
            <p className="text-xs text-violet-700 dark:text-violet-300">
              Playing as guest — <Link href="/signup" className="font-semibold underline hover:no-underline">Sign up</Link> to save progress & earn XP
            </p>
          </div>
        )}

        {/* Question card */}
        <div className={`glass-card rounded-3xl p-6 md:p-8 mb-6 transition-all duration-500 shadow-xl ${
          answerFeedback === "correct" ? "ring-2 ring-emerald-400 shadow-emerald-500/20" :
          answerFeedback === "wrong"   ? "ring-2 ring-red-400 shadow-red-500/20" :
          "shadow-violet-500/5"
        }`}>
          <h2 className="text-xl md:text-2xl font-bold font-display leading-snug">{currentQ.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const isCorrect = idx === currentQ.correctAnswer
            const showCorrect = isAnswered && isCorrect
            const showWrong = isAnswered && isSelected && !isCorrect
            return (
              <button key={idx}
                className={`quiz-option w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                  showCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 scale-[1.01]" :
                  showWrong   ? "border-red-400 bg-red-50 dark:bg-red-500/10 shadow-lg shadow-red-500/20 shake" :
                  isSelected  ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10" :
                  "border-border hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-500/5"
                }`}
                onClick={() => handleAnswerSelect(idx)}
                disabled={isAnswered}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 flex-shrink-0 ${
                    showCorrect ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" :
                    showWrong   ? "bg-red-500 text-white shadow-lg shadow-red-500/30" :
                    isSelected  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/30" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {showCorrect ? <CheckCircle className="h-4 w-4" /> :
                     showWrong   ? <XCircle className="h-4 w-4" /> :
                     String.fromCharCode(65 + idx)}
                  </div>
                  <span className="font-medium text-sm flex-1 leading-snug">{option}</span>
                  {showCorrect && <span className="text-emerald-500 font-bold text-xs ml-auto">✓ Correct</span>}
                  {showWrong   && <span className="text-red-500 font-bold text-xs ml-auto">✗ Wrong</span>}
                </div>
              </button>
            )
          })}
        </div>

        <Button
          className={`w-full py-3.5 h-13 rounded-2xl text-base font-semibold transition-all duration-500 ${
            isAnswered
              ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/45 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
          }`}
          onClick={handleNext}
          disabled={!isAnswered}
        >
          {currentQuestion < quiz.questions.length - 1
            ? <><>Next Question</> <ArrowRight className="ml-2 h-5 w-5" /></>
            : <><>Finish Quiz</> <Trophy className="ml-2 h-5 w-5" /></>}
        </Button>
      </main>

      {showShare && <SharePanel quiz={quiz} onClose={() => setShowShare(false)} />}
      <MusicPlayer />
    </div>
  )
}
