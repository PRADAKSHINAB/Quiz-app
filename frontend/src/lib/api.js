// API utilities
import { getToken } from "./auth"

// API base URL — override NEXT_PUBLIC_API_URL in .env.local for production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Public app URL — used to build shareable quiz links
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
)

/**
 * Build a public share URL for a quiz
 */
export function buildShareUrl(shareId) {
  return `${APP_URL}/quiz/shared/${shareId}`
}

/**
 * Make an authenticated API request
 */
async function authFetch(endpoint, options = {}) {
  const token = getToken()
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || "API request failed")
  }

  return response.json()
}

// ===== TOPICS =====

export async function getAllTopics() {
  const defaultTopics = [
    { id: "1", name: "Mathematics", slug: "mathematics", icon: "📊", description: "Math related quizzes", quizCount: 0 },
    { id: "2", name: "Science", slug: "science", icon: "🔬", description: "Science related quizzes", quizCount: 0 },
    { id: "3", name: "History", slug: "history", icon: "📜", description: "History related quizzes", quizCount: 0 },
    { id: "4", name: "Geography", slug: "geography", icon: "🌍", description: "Geography related quizzes", quizCount: 0 },
    { id: "5", name: "Literature", slug: "literature", icon: "📚", description: "Literature related quizzes", quizCount: 0 },
    { id: "6", name: "Technology", slug: "technology", icon: "💻", description: "Technology related quizzes", quizCount: 0 },
    { id: "7", name: "Sports", slug: "sports", icon: "⚽", description: "Sports related quizzes", quizCount: 0 },
    { id: "8", name: "Music", slug: "music", icon: "🎵", description: "Music related quizzes", quizCount: 0 },
    { id: "9", name: "Movies", slug: "movies", icon: "🎬", description: "Movies related quizzes", quizCount: 0 },
    { id: "10", name: "General Knowledge", slug: "general-knowledge", icon: "🧠", description: "General knowledge quizzes", quizCount: 0 },
  ]

  try {
    const data = await authFetch("/topics")
    return data.length > 0 ? data : defaultTopics
  } catch (error) {
    console.warn("Failed to fetch topics, using defaults:", error)
    return defaultTopics
  }
}

export async function getTopicBySlug(slug) {
  return authFetch(`/topics/${slug}`)
}

export async function getQuizzesByTopic(topic) {
  try {
    return await authFetch(`/topics/${encodeURIComponent(topic)}/quizzes`)
  } catch (error) {
    const all = await getAllQuizzes()
    return all.filter((q) => q.topic === topic || q.topic.toLowerCase() === topic.toLowerCase())
  }
}

// ===== QUIZZES =====

export async function getAllQuizzes() {
  return authFetch("/quizzes")
}

export async function getFeaturedQuizzes(limit = 3) {
  try {
    return await authFetch(`/quizzes/featured?limit=${limit}`)
  } catch (error) {
    return []
  }
}

export async function getQuizById(id) {
  return authFetch(`/quizzes/${id}`)
}

export async function getUserQuizzes() {
  return authFetch("/user/quizzes")
}

export async function createQuiz(quizData) {
  return authFetch("/quizzes", {
    method: "POST",
    body: JSON.stringify(quizData),
  })
}

export async function updateQuiz(id, quizData) {
  return authFetch(`/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(quizData),
  })
}

export async function deleteQuiz(id) {
  return authFetch(`/quizzes/${id}`, {
    method: "DELETE",
  })
}

export async function getQuizByShareId(shareId) {
  return authFetch(`/quizzes/shared/${shareId}`)
}

// ===== PROGRESS & STATS =====

export async function submitProgress(progressData) {
  return authFetch("/progress", {
    method: "POST",
    body: JSON.stringify(progressData),
  })
}

export async function getUserProgress() {
  return authFetch("/progress")
}

export async function getUserStats() {
  return authFetch("/stats")
}

// ===== LEADERBOARD =====

export async function getLeaderboard(period = "all", limit = 50) {
  try {
    return await authFetch(`/leaderboard?period=${period}&limit=${limit}`)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

// ===== ACHIEVEMENTS =====

export async function getAchievements() {
  return authFetch("/achievements")
}

// ===== AI GENERATION =====

export async function generateAiQuiz(payload) {
  return authFetch("/ai/generate", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  })
}
