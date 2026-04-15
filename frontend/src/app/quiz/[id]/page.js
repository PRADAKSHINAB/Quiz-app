"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Brain, Star, Trophy,
  Zap, Flame, ArrowRight, RotateCcw, Share2, Copy, Check,
  Music, Music2, Volume2, VolumeX
} from "lucide-react"
import { getQuizById, submitProgress } from "@/lib/api"
import { isAuthenticated, getUserProfile } from "@/lib/auth"
import { Header } from "@/components/header"
import { MusicPlayer } from "@/components/music-player"
import { sounds } from "@/lib/sounds"

// ─── Confetti burst component ──────────────────────────────────────────────
function ConfettiBurst({ active }) {
  if (!active) return null
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: ["#7c3aed","#06b6d4","#f59e0b","#10b981","#ec4899","#f97316"][i % 6],
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 80),
    rot: Math.random() * 720 - 360,
    size: Math.random() * 8 + 6,
  }))
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-sm animate-confetti-piece"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            "--tx": `${p.x}px`,
            "--ty": `${p.y}px`,
            "--rot": `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Share modal ──────────────────────────────────────────────────────────
function ShareModal({ quiz, onClose }) {
  const [copied, setCopied] = useState(false)

  // Build the public share URL (works outside localhost by using the window origin)
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/quiz/shared/${quiz.shareId}`
    : `/quiz/shared/${quiz.shareId}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      sounds.click()
      setTimeout(() => setCopied(false), 2500)
    } catch (_) {}
  }

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: quiz.title,
        text: `Take this quiz: ${quiz.title}`,
        url: shareUrl,
      }).catch(() => {})
    } else {
      copy()
    }
  }

  const whatsapp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`🧠 Quiz Challenge: ${quiz.title}\n${shareUrl}`)}`, "_blank")
  const twitter  = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🧠 Take this quiz: ${quiz.title}`)}&url=${encodeURIComponent(shareUrl)}`, "_blank")

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="glass-card rounded-3xl p-6 w-full max-w-sm relative z-10 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-lg font-bold font-display">Share This Quiz</h3>
          <p className="text-sm text-muted-foreground mt-1">Anyone with the link can take it — no login needed!</p>
        </div>

        {/* URL box */}
        <div className="flex items-center gap-2 bg-secondary/70 rounded-xl p-3 mb-4 border border-border/50">
          <p className="text-xs text-muted-foreground flex-1 truncate font-mono">{shareUrl}</p>
          <button onClick={copy} className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${copied ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "hover:bg-violet-100 dark:hover:bg-violet-500/10 text-violet-600"}`}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Share options */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button onClick={copy} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-secondary transition-all">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <Copy className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Copy</span>
          </button>
          <button onClick={whatsapp} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-secondary transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <span className="text-base">💬</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">WhatsApp</span>
          </button>
          <button onClick={twitter} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-secondary transition-all">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
              <span className="text-base">𝕏</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">Twitter</span>
          </button>
        </div>

        <button onClick={shareNative} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
          Share via App
        </button>
        <button onClick={onClose} className="w-full py-2 mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────
export default function QuizPage({ params }) {
  const router = useRouter()
  const { id } = params
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [user, setUser] = useState(null)
  const [results, setResults] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const [answers, setAnswers] = useState([])
  const [showReview, setShowReview] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState(null) // "correct" | "wrong"
  const hasSubmittedRef = useRef(false)
  const prevTimeRef = useRef(0)

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
        const quizData = await getQuizById(id)
        setQuiz(quizData)
        setTimeLeft(quizData.timeLimit || 600)
        setStartTime(Date.now())
      } catch (error) {
        console.error("Error fetching quiz:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Timer with tick sound at last 10s
  useEffect(() => {
    if (!quiz || quizCompleted) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setQuizCompleted(true)
          return 0
        }
        if (prev <= 10 && prev !== prevTimeRef.current) {
          sounds.tick()
          prevTimeRef.current = prev
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [quiz, quizCompleted])

  const handleAnswerSelect = (answerIndex) => {
    if (isAnswered) return
    setSelectedAnswer(answerIndex)
    setIsAnswered(true)

    const isCorrect = answerIndex === quiz.questions[currentQuestion].correctAnswer

    if (isCorrect) {
      setScore((s) => s + 1)
      setAnswerFeedback("correct")
      sounds.correct()
    } else {
      setAnswerFeedback("wrong")
      sounds.wrong()
    }

    setAnswers((prev) => [...prev, { questionIndex: currentQuestion, selectedAnswer: answerIndex, isCorrect }])

    setTimeout(() => setAnswerFeedback(null), 600)
  }

  const handleNextQuestion = () => {
    sounds.next()
    if (currentQuestion < quiz?.questions.length - 1) {
      setCurrentQuestion((q) => q + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
      submitQuizResults()
    }
  }

  const submitQuizResults = useCallback(async () => {
    if (!user || !quiz || hasSubmittedRef.current) return
    hasSubmittedRef.current = true
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const data = await submitProgress({ quizId: id, score, totalQuestions: quiz.questions.length, timeTaken, answers })
      setResults(data)
      if (data?.leveledUp) { sounds.levelUp() } else { sounds.complete() }
      setTimeout(() => { setConfetti(true); setTimeout(() => setConfetti(false), 2000) }, 300)
    } catch (error) {
      console.error("Error submitting:", error)
      sounds.complete()
      setTimeout(() => { setConfetti(true); setTimeout(() => setConfetti(false), 2000) }, 300)
    }
  }, [id, quiz, score, startTime, user, answers])

  useEffect(() => {
    if (!quizCompleted || timeLeft !== 0) return
    submitQuizResults()
  }, [quizCompleted, timeLeft, submitQuizResults])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-violet-500/40 animate-ping" style={{ animationDelay: "0.3s" }} />
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
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="glass-card rounded-3xl p-8 text-center max-w-md relative z-10">
          <Brain className="h-16 w-16 text-violet-200 dark:text-violet-800 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3 font-display">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">This quiz doesn&apos;t exist or has been removed.</p>
          <Link href="/topics">
            <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold shadow-lg shadow-violet-500/20">
              Browse All Quizzes
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── Results screen ────────────────────────────────────────────────────
  if (quizCompleted) {
    const percentage = Math.round((score / quiz.questions.length) * 100)
    const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0
    const circumference = 2 * Math.PI * 54
    const offset = circumference - (percentage / 100) * circumference
    const message = percentage >= 90 ? "Outstanding! 🎉" : percentage >= 70 ? "Great Job! 🌟" : percentage >= 50 ? "Good Effort! 💪" : "Keep Trying! 🔄"

    if (showReview) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container max-w-3xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold font-display">Answer Review</h2>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowReview(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />Back to Results
              </Button>
            </div>
            <div className="space-y-4 stagger-children">
              {quiz.questions.map((q, idx) => {
                const userAnswer = answers.find((a) => a.questionIndex === idx)
                const isCorrect = userAnswer?.isCorrect
                return (
                  <div key={idx} className={`glass-card rounded-2xl p-5 border-l-4 transition-all hover:scale-[1.01] ${isCorrect ? "border-l-emerald-500" : "border-l-red-500"}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isCorrect ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-red-100 dark:bg-red-500/20"}`}>
                        {isCorrect ? <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />}
                      </div>
                      <p className="font-medium text-sm">{q.question}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                          optIdx === q.correctAnswer ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300 font-medium" :
                          userAnswer?.selectedAnswer === optIdx && !isCorrect ? "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-600 text-red-700 dark:text-red-300" :
                          "border-border/50 text-muted-foreground"
                        }`}>
                          {String.fromCharCode(65 + optIdx)}. {opt}
                          {optIdx === q.correctAnswer && <span className="ml-1 text-xs">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        <ConfettiBurst active={confetti} />
        <div className="orb orb-1" /><div className="orb orb-3" />

        <div className="glass-card rounded-3xl p-8 max-w-md w-full text-center relative z-10 animate-scale-in">
          {/* Trophy icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-amber-500/30 animate-bounce-soft">
            <Trophy className="h-8 w-8 text-white" />
          </div>

          {/* Score Ring */}
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="score-ring w-full h-full" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-border/30" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset} />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
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

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-5">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className={`h-7 w-7 transition-all duration-500 ${i < stars ? "text-amber-500 fill-amber-500 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "text-gray-300 dark:text-gray-700"}`}
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>

          {/* Stats Grid */}
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
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{results?.xpEarned || 0}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
          </div>

          {/* Level Up */}
          {results?.leveledUp && (
            <div className="rounded-xl bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-500/10 dark:to-cyan-500/10 p-4 mb-4 border border-violet-200 dark:border-violet-700 animate-pulse-soft">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <p className="font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  Level Up! → Level {results.newLevel}
                </p>
              </div>
            </div>
          )}

          {/* Achievements */}
          {results?.newAchievements?.length > 0 && (
            <div className="space-y-2 mb-5">
              {results.newAchievements.map((ach) => (
                <div key={ach.id} className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3 border border-amber-200 dark:border-amber-700 flex items-center gap-3">
                  <span className="text-2xl">{ach.icon}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm">{ach.name}</p>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                  </div>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2.5">
            <Button onClick={() => setShowReview(true)} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white h-11 font-semibold shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all">
              Review Answers
            </Button>
            {quiz.shareId && (
              <Button variant="outline" onClick={() => setShowShareModal(true)} className="w-full rounded-xl border-violet-200 dark:border-violet-800 h-11 gap-2 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all">
                <Share2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                Share This Quiz
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl border-violet-200 dark:border-violet-800" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="outline" className="rounded-xl border-violet-200 dark:border-violet-800" onClick={() => router.push("/topics")}>
                More Quizzes
              </Button>
            </div>
          </div>
        </div>

        {showShareModal && <ShareModal quiz={quiz} onClose={() => setShowShareModal(false)} />}
        <MusicPlayer />
      </div>
    )
  }

  // ─── Quiz-taking screen ────────────────────────────────────────────────
  const currentQuestionData = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const isLowTime = timeLeft <= 30
  const isVeryLowTime = timeLeft <= 10

  return (
    <div className={`min-h-screen bg-background relative transition-all duration-300 ${
      answerFeedback === "correct" ? "bg-emerald-50/30 dark:bg-emerald-950/20" :
      answerFeedback === "wrong"   ? "bg-red-50/30 dark:bg-red-950/20" : ""
    }`}>
      {/* Ambient background orbs */}
      <div className="orb orb-1 opacity-20" />
      <div className="orb orb-2 opacity-10" />

      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Button variant="ghost" size="sm" className="rounded-lg text-sm gap-1" onClick={() => router.push("/topics")}>
              <ArrowLeft className="h-4 w-4" /> Exit
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-muted-foreground font-medium truncate max-w-[200px]">{quiz.title}</div>
              {quiz.shareId && (
                <button onClick={() => setShowShareModal(true)} className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 transition-colors" title="Share quiz">
                  <Share2 className="h-4 w-4" />
                </button>
              )}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold tabular-nums transition-all duration-300 ${
                isVeryLowTime ? "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse scale-105 ring-2 ring-red-400/30" :
                isLowTime    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse-soft" :
                "bg-secondary"
              }`}>
                <Clock className={`h-4 w-4 ${isVeryLowTime ? "text-red-500" : isLowTime ? "text-amber-500" : ""}`} />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-secondary -mb-px rounded-full overflow-hidden">
            <div className="h-full progress-gradient transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <main className="container max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
        {/* Question counter & score */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-bold px-3 py-1 rounded-full">
              {currentQuestion + 1} / {quiz.questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{score}</span>
          </div>
        </div>

        {/* Question card */}
        <div className={`glass-card rounded-3xl p-6 md:p-8 mb-6 transition-all duration-500 ${
          answerFeedback === "correct" ? "ring-2 ring-emerald-400 shadow-emerald-500/20 shadow-xl" :
          answerFeedback === "wrong"   ? "ring-2 ring-red-400 shadow-red-500/20 shadow-xl" :
          "shadow-xl shadow-violet-500/5"
        }`}>
          <h2 className="text-xl md:text-2xl font-bold font-display leading-snug">{currentQuestionData.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQuestionData.options.map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = index === currentQuestionData.correctAnswer
            const showCorrect = isAnswered && isCorrect
            const showWrong = isAnswered && isSelected && !isCorrect

            return (
              <button
                key={index}
                id={`answer-${index}`}
                className={`quiz-option w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                  showCorrect ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/20 scale-[1.01]" :
                  showWrong   ? "border-red-400 bg-red-50 dark:bg-red-500/10 shadow-lg shadow-red-500/20 shake" :
                  isSelected  ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10" :
                  "border-border hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-500/5"
                }`}
                onClick={() => handleAnswerSelect(index)}
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
                     String.fromCharCode(65 + index)}
                  </div>
                  <span className="font-medium text-sm flex-1 leading-snug">{option}</span>
                  {showCorrect && <span className="text-emerald-500 font-bold text-xs ml-auto">✓ Correct</span>}
                  {showWrong && <span className="text-red-500 font-bold text-xs ml-auto">✗ Wrong</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Next Button */}
        <Button
          id="next-question-btn"
          className={`w-full h-13 py-3.5 rounded-2xl text-base font-semibold transition-all duration-500 ${
            isAnswered
              ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/45 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-secondary text-muted-foreground cursor-not-allowed opacity-60"
          }`}
          onClick={handleNextQuestion}
          disabled={!isAnswered}
        >
          {currentQuestion < quiz.questions.length - 1 ? (
            <>Next Question <ArrowRight className="ml-2 h-5 w-5" /></>
          ) : (
            <>Finish Quiz <Trophy className="ml-2 h-5 w-5" /></>
          )}
        </Button>
      </main>

      {showShareModal && <ShareModal quiz={quiz} onClose={() => setShowShareModal(false)} />}
      {/* Floating music player */}
      <MusicPlayer />
    </div>
  )
}
