"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Flame, Star, ChevronUp, ChevronDown, Minus, Crown, Zap, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { getLeaderboard } from "@/lib/api"
import { getUser, isAuthenticated } from "@/lib/auth"

const RANK_STYLES = {
  1: { bg: "bg-gradient-to-r from-amber-400 to-yellow-500", text: "text-amber-900", icon: Crown, shadow: "shadow-amber-500/30" },
  2: { bg: "bg-gradient-to-r from-gray-300 to-gray-400", text: "text-gray-700", icon: Medal, shadow: "shadow-gray-400/30" },
  3: { bg: "bg-gradient-to-r from-orange-400 to-amber-500", text: "text-orange-900", icon: Medal, shadow: "shadow-orange-500/30" },
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("all")
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentUser(getUser())
    }
    fetchLeaderboard("all")
  }, [])

  const fetchLeaderboard = async (p) => {
    setLoading(true)
    setPeriod(p)
    try {
      const data = await getLeaderboard(p, 50)
      setLeaderboard(data)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentUserRank = currentUser ? leaderboard.findIndex(l => l.username === currentUser.username) + 1 : 0

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Header />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-4 shadow-lg shadow-amber-500/25">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you stack up against other learners</p>
        </div>

        {/* Period Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: "weekly", label: "This Week" },
            { key: "monthly", label: "This Month" },
            { key: "all", label: "All Time" },
          ].map(({ key, label }) => (
            <Button
              key={key}
              variant={period === key ? "default" : "outline"}
              onClick={() => fetchLeaderboard(key)}
              className={`rounded-xl text-sm ${
                period === key
                  ? "bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : "border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-500/10"
              }`}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Current User Rank */}
        {currentUserRank > 0 && (
          <div className="max-w-2xl mx-auto mb-6 animate-fadeIn">
            <div className="glass-card rounded-2xl p-4 border-2 border-violet-300 dark:border-violet-600">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
                  #{currentUserRank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Your Rank</p>
                  <p className="text-xs text-muted-foreground">Keep playing to climb higher!</p>
                </div>
                <div className="streak-flame">
                  <Flame className="h-4 w-4" />
                  {leaderboard[currentUserRank - 1]?.currentStreak || 0} day streak
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {!loading && leaderboard.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8 stagger-children">
            <div className="grid grid-cols-3 gap-3 items-end">
              {/* 2nd Place */}
              <div className="text-center">
                {leaderboard.length >= 2 ? (
                  <div className="glass-card rounded-2xl p-4 pb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-gray-400/20">
                      <span className="text-xl font-bold text-white">2</span>
                    </div>
                    <p className="font-semibold text-sm truncate">{leaderboard[1]?.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">Level {leaderboard[1]?.level}</p>
                    <p className="font-bold text-lg text-violet-600 dark:text-violet-400 mt-2">{leaderboard[1]?.totalScore}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                ) : (
                  <div className="h-24 opacity-20 flex items-center justify-center">
                    <Minus className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* 1st Place */}
              <div className="text-center -mt-4">
                <div className="glass-card rounded-2xl p-5 pb-7 border-2 border-amber-300 dark:border-amber-600 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Crown className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/30 animate-pulseGlow">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <p className="font-bold text-sm truncate">{leaderboard[0]?.username}</p>
                  <p className="text-xs text-muted-foreground mt-1">Level {leaderboard[0]?.level}</p>
                  <p className="font-bold text-2xl gradient-text mt-2">{leaderboard[0]?.totalScore}</p>
                  <p className="text-[10px] text-muted-foreground">points</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                {leaderboard.length >= 3 ? (
                  <div className="glass-card rounded-2xl p-4 pb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20">
                      <span className="text-xl font-bold text-white">3</span>
                    </div>
                    <p className="font-semibold text-sm truncate">{leaderboard[2]?.username}</p>
                    <p className="text-xs text-muted-foreground mt-1">Level {leaderboard[2]?.level}</p>
                    <p className="font-bold text-lg text-violet-600 dark:text-violet-400 mt-2">{leaderboard[2]?.totalScore}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                ) : (
                  <div className="h-24 opacity-20 flex items-center justify-center">
                    <Minus className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Rankings */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/50">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-center">Quizzes</div>
              <div className="col-span-2 text-right">Score</div>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">Loading rankings...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-medium mb-1">No rankings yet</p>
                <p className="text-sm text-muted-foreground">Be the first to take a quiz and appear here!</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {leaderboard.slice(3).map((entry) => {
                  const isCurrentUser = currentUser && entry.username === currentUser.username
                  return (
                    <div
                      key={entry._id || entry.rank}
                      className={`grid grid-cols-12 gap-2 px-5 py-3.5 items-center leaderboard-row ${
                        isCurrentUser ? "bg-violet-50 dark:bg-violet-500/10 border-l-2 border-violet-500" : ""
                      }`}
                    >
                      <div className="col-span-1">
                        <span className="font-bold text-sm text-muted-foreground">{entry.rank}</span>
                      </div>
                      <div className="col-span-5 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {entry.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{entry.username}</p>
                          {entry.currentStreak > 0 && (
                            <div className="flex items-center gap-0.5 text-orange-500">
                              <Flame className="h-3 w-3" />
                              <span className="text-[10px] font-medium">{entry.currentStreak}d</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">{entry.level}</Badge>
                      </div>
                      <div className="col-span-2 text-center text-sm text-muted-foreground">{entry.quizzesTaken}</div>
                      <div className="col-span-2 text-right font-bold text-sm text-violet-600 dark:text-violet-400">{entry.totalScore}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
