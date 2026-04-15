"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Star } from "lucide-react"
import { getTopicBySlug, getQuizzesByTopic } from "@/lib/api"
import { Header } from "@/components/header"
import { QuizCoverImage } from "@/components/quiz-cover-image"

export default function TopicPage({ params }) {
  const router = useRouter()
  const { slug } = params
  const [topic, setTopic] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicData = await getTopicBySlug(slug)
        setTopic(topicData)

        if (topicData && topicData.name) {
          const quizzesData = await getQuizzesByTopic(topicData.name)
          setQuizzes(quizzesData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <Header />
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <Header />
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Topic Not Found</h2>
            <p className="text-muted-foreground mb-6">The topic you are looking for does not exist.</p>
            <Link href="/topics">
              <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white rounded-xl">
                Browse Topics
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-2 rounded-xl"
            onClick={() => router.push("/topics")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Topics
          </Button>
          <h2 className="text-3xl font-bold font-display">{topic.name}</h2>
        </div>

        <div className="glass-card rounded-3xl p-6 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
            <div className="w-full md:w-2/3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-medium mb-4">
                Explore Topic
              </div>
              <h3 className="text-2xl font-bold mb-3 font-display">About this Topic</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{topic.description}</p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-none">
                  {topic.difficulty}
                </Badge>
                <Badge variant="secondary" className="rounded-lg px-3 py-1 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-none">
                  {topic.quizCount} quizzes
                </Badge>
              </div>
            </div>
            <div className="w-full md:w-1/3 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-violet-500/20">
              <h4 className="font-bold text-lg mb-2">Start Mastering</h4>
              <p className="text-violet-100 text-sm mb-6 opacity-90">Challenge yourself with quizzes in this topic and track your learning journey.</p>
              <Link href="/create">
                <Button className="w-full bg-white text-violet-600 hover:bg-violet-50 rounded-xl font-semibold shadow-lg">
                  Create New Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold font-display mb-8">Available Quizzes</h3>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
            {quizzes.map((quiz) => (
              <Link href={`/quiz/${quiz.id || quiz._id}`} key={quiz.id || quiz._id} className="block group">
                <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="relative h-48 w-full">
                    <QuizCoverImage quiz={quiz} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border-none ${
                          quiz.difficulty?.toLowerCase() === "easy"
                            ? "bg-emerald-500 text-white"
                            : quiz.difficulty?.toLowerCase() === "medium"
                              ? "bg-amber-500 text-white"
                              : "bg-rose-500 text-white"
                        }`}
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-lg font-bold mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">{quiz.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">{quiz.description}</p>
                    <div className="flex justify-between items-center text-xs font-medium text-muted-foreground pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-violet-500" />
                        <span>{Math.floor((quiz.timeLimit || 600) / 60)} min</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-foreground font-bold">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl">
            <div className="w-16 h-16 bg-violet-50 dark:bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-violet-200 dark:text-violet-800" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-display">No quizzes available yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Be the first to create a quiz for this topic and share it with the community!</p>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white rounded-xl px-8 h-12 shadow-lg shadow-violet-500/20">
                Create First Quiz
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
