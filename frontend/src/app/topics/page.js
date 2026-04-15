"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Brain, Search, Clock, Star, BookOpen, ArrowLeft, Filter, Sparkles, ArrowRight, ChevronRight } from "lucide-react"
import { getAllTopics, getAllQuizzes } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuizCoverImage } from "@/components/quiz-cover-image"
import { VoiceInput } from "@/components/voice-input"

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
  "from-lime-500 to-green-600",
  "from-red-500 to-rose-600",
]

const TOPIC_GLOW = [
  "rgba(124,58,237,0.18)",
  "rgba(6,182,212,0.18)",
  "rgba(245,158,11,0.18)",
  "rgba(16,185,129,0.18)",
  "rgba(236,72,153,0.18)",
  "rgba(99,102,241,0.18)",
  "rgba(14,165,233,0.18)",
  "rgba(217,70,239,0.18)",
]

function DifficultyBadge({ difficulty }) {
  const map = {
    Easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 badge-easy",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 badge-medium",
    Hard:   "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 badge-hard",
  }
  return (
    <Badge className={`text-xs font-semibold px-2.5 py-0.5 ${map[difficulty] || map.Easy}`}>
      {difficulty}
    </Badge>
  )
}

export default function Topics() {
  const router = useRouter()
  const [topics, setTopics] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topicsData, quizzesData] = await Promise.all([getAllTopics(), getAllQuizzes()])
        setTopics(topicsData)
        setQuizzes(quizzesData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredTopics = topics.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    if (activeFilter === "all") return matchesSearch
    return matchesSearch && q.difficulty?.toLowerCase() === activeFilter
  })

  return (
    <div className="min-h-screen bg-background relative overflow-hidden page-fade-in">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">

        {/* ── Page Header ──────────────────────────────── */}
        <div className="mb-10 animate-fadeIn">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors group"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
              Back
            </Button>
          </div>

          <div className="flex items-start gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight">
                Explore Topics &amp;{" "}
                <span className="gradient-text-animated">Quizzes</span>
              </h1>
              <p className="text-muted-foreground mt-1">Find your next challenge from our growing library</p>
            </div>
          </div>
        </div>

        {/* ── Search Bar ───────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-violet-500" />
            <Input
              type="text"
              placeholder="Search topics or quizzes..."
              className="pl-11 h-12 rounded-xl bg-secondary/50 border-border text-sm transition-all duration-300 focus:bg-background input-glow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>
          <div className="md:w-64">
            <VoiceInput onTranscript={(text) => setSearchTerm(text)} placeholder="Search by voice..." />
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────── */}
        <Tabs defaultValue="topics" className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="bg-secondary/50 rounded-xl p-1">
              <TabsTrigger value="topics" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-5">
                Topics
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-5">
                All Quizzes
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-1.5 border border-border">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="bg-transparent text-sm focus:outline-none cursor-pointer"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* ── Topics Tab ─────────────────────────────── */}
          <TabsContent value="topics">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl animate-pulse h-44" />
                ))}
              </div>
            ) : filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                {filteredTopics.map((topic, idx) => (
                  <Link
                    href={`/topics/${topic.slug}`}
                    key={topic._id || topic.slug || topic.name}
                    className="block group"
                  >
                    <div
                      className="glass-card rounded-2xl p-6 h-full relative overflow-hidden"
                      style={{ "--hover-glow": TOPIC_GLOW[idx % TOPIC_GLOW.length] }}
                    >
                      {/* Corner gradient burst */}
                      <div className={`absolute top-0 right-0 w-28 h-28 rounded-bl-[56px] bg-gradient-to-br ${TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]} opacity-10 group-hover:opacity-25 transition-opacity duration-400`} />

                      <div className="flex items-center gap-4 mb-4">
                        {/* Gradient icon container */}
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TOPIC_GRADIENTS[idx % TOPIC_GRADIENTS.length]} flex items-center justify-center shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 topic-icon-animated`}>
                          <span className="text-xl select-none">{TOPIC_ICONS[topic.name] || "📋"}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold quiz-title-hover group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {topic.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {topic.quizCount || 0} quiz{topic.quizCount !== 1 ? "zes" : ""}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {topic.description || `Explore quizzes about ${topic.name}`}
                      </p>

                      {/* Arrow indicator */}
                      <div className="flex items-center gap-1 mt-4 text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                        Explore quizzes <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-16 text-center animate-fadeIn">
                <Search className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-lg">No topics found</h3>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            )}
          </TabsContent>

          {/* ── All Quizzes Tab ────────────────────────── */}
          <TabsContent value="quizzes">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-card rounded-2xl animate-pulse h-72" />
                ))}
              </div>
            ) : filteredQuizzes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                {filteredQuizzes.map((quiz) => (
                  <Link href={`/quiz/${quiz._id}`} key={quiz._id} className="block group">
                    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">

                      {/* Cover image */}
                      <div className="relative h-44 w-full overflow-hidden">
                        <QuizCoverImage quiz={quiz} />

                        {/* Difficulty badge */}
                        <div className="absolute top-3 right-3 z-10">
                          <DifficultyBadge difficulty={quiz.difficulty} />
                        </div>

                        {/* Topic chip */}
                        <div className="absolute bottom-3 left-3 z-10">
                          <span className="topic-chip">
                            {TOPIC_ICONS[quiz.topic] || "📋"} {quiz.topic}
                          </span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-semibold text-sm mb-1.5 quiz-title-hover group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1 leading-relaxed">
                          {quiz.description}
                        </p>

                        {/* Footer meta */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3 mt-auto">
                          <div className="flex items-center gap-1.5 meta-icon-hover">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{Math.floor(quiz.timeLimit / 60)} min</span>
                          </div>
                          <div className="flex items-center gap-1.5 meta-icon-hover">
                            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                            <span>{quiz.questions?.length || 0} questions</span>
                          </div>
                          <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium group-hover:gap-2 transition-all duration-200">
                            Play <ArrowRight className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-16 text-center animate-fadeIn">
                <BookOpen className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-lg">No quizzes found</h3>
                <p className="text-sm text-muted-foreground">Try a different search term or filter</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
