"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Trash2, Save, AlertCircle, Share2, Sparkles, Wand2, CheckCircle, Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { isAuthenticated } from "@/lib/auth"
import { createQuiz, generateAiQuiz, getAllTopics } from "@/lib/api"
import { Header } from "@/components/header"

export default function CreateQuizPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    topic: "", // Will be set when topics are loaded
    difficulty: "Medium", // Default difficulty
    timeLimit: 600, // 10 minutes default
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ],
  })
  const [errors, setErrors] = useState({})
  const [topics, setTopics] = useState([])
  const [quizCreated, setQuizCreated] = useState(null)
  const [aiPrompt, setAiPrompt] = useState("Give 10 in GK for class 10")
  const [aiCount, setAiCount] = useState(10)
  const [aiGrade, setAiGrade] = useState(10)
  const [aiTopic, setAiTopic] = useState("")
  const [aiDifficulty, setAiDifficulty] = useState("Medium")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)

  // Check if user is authenticated and fetch topics
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to create a quiz",
      })
      router.push("/login")
      return
    }

    // Fetch topics
    const fetchTopics = async () => {
      try {
        const topicsData = await getAllTopics()
        setTopics(topicsData)
        // Set default topic if available and not already set
        if (topicsData.length > 0) {
          setQuizData(prev => {
            if (prev.topic) return prev;
            return { ...prev, topic: topicsData[0].name };
          })
        }
      } catch (error) {
        console.error("Error fetching topics:", error)
      }
    }

    fetchTopics()
  }, [router, toast])

  // Handle input change for quiz details
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setQuizData({
      ...quizData,
      [name]: value,
    })

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Handle select change
  const handleSelectChange = (name, value) => {
    setQuizData({
      ...quizData,
      [name]: value,
    })

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Handle input change for questions
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quizData.questions]

    if (field === "options") {
      const [optionIndex, optionValue] = value
      updatedQuestions[index].options[optionIndex] = optionValue
    } else if (field === "correctAnswer") {
      updatedQuestions[index].correctAnswer = Number.parseInt(value)
    } else {
      updatedQuestions[index][field] = value
    }

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })

    // Clear error for this question if it exists
    if (errors[`question_${index}`]) {
      setErrors({
        ...errors,
        [`question_${index}`]: "",
      })
    }
  }

  // Add a new question
  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    })

    // Scroll to the new question after a short delay
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      })
    }, 100)
  }

  // Remove a question
  const removeQuestion = (index) => {
    if (quizData.questions.length === 1) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Quiz must have at least one question",
      })
      return
    }

    const updatedQuestions = [...quizData.questions]
    updatedQuestions.splice(index, 1)

    setQuizData({
      ...quizData,
      questions: updatedQuestions,
    })

    // Clear error for this question if it exists
    if (errors[`question_${index}`]) {
      const newErrors = { ...errors }
      delete newErrors[`question_${index}`]
      setErrors(newErrors)
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    // Validate quiz details
    if (!quizData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!quizData.topic) {
      newErrors.topic = "Topic is required"
    }

    // Validate questions
    quizData.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}`] = "Question text is required"
      }

      // Check if all options are filled
      const emptyOptions = question.options.filter((option) => !option.trim())
      if (emptyOptions.length > 0) {
        newErrors[`question_${index}_options`] = "All options must be filled"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createQuiz(quizData)
      setQuizCreated(result.quiz)

      toast({
        title: "Success",
        description: "Quiz created successfully",
      })
    } catch (error) {
      console.error("Error creating quiz:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create quiz",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Copy share link to clipboard
  const copyShareLink = async () => {
    if (quizCreated?.shareId) {
      const shareUrl = `${window.location.origin}/quiz/shared/${quizCreated.shareId}`
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Quiz link copied to clipboard",
        })
      } catch (error) {
        console.error("Failed to copy link:", error)
      }
    }
  }

  const handleGenerateAi = async () => {
    setAiLoading(true)
    try {
      const resolvedCount = Number.isFinite(aiCount) ? aiCount : 10
      const resolvedGrade = Number.isFinite(aiGrade) ? aiGrade : 10
      const resolvedTopic =
        (typeof aiTopic === "string" && aiTopic.trim()) ||
        (typeof quizData.topic === "string" && quizData.topic.trim()) ||
        "General Knowledge"

      const result = await generateAiQuiz({
        prompt: aiPrompt,
        count: resolvedCount,
        grade: resolvedGrade,
        topic: resolvedTopic,
        difficulty: aiDifficulty,
      })
      setAiResult(result)
      toast({
        title: "Generated",
        description: `Generated ${result.questions?.length || 0} questions`,
      })
    } catch (error) {
      console.error("AI generation error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate questions",
      })
    } finally {
      setAiLoading(false)
    }
  }

  const applyAiToQuiz = (mode) => {
    if (!aiResult?.questions?.length) return
    setQuizData((prev) => {
      const normalizedQuestions = aiResult.questions.map((q) => ({
        question: q.question || "",
        options: Array.isArray(q.options) ? q.options.slice(0, 4).concat(["", "", "", ""]).slice(0, 4) : ["", "", "", ""],
        correctAnswer: Number.isInteger(q.correctAnswer) ? q.correctAnswer : 0,
      }))

      const nextQuestions = mode === "append" ? [...prev.questions, ...normalizedQuestions] : normalizedQuestions

      return {
        ...prev,
        title: prev.title?.trim() ? prev.title : aiResult.title || prev.title,
        description: prev.description?.trim() ? prev.description : aiResult.description || prev.description,
        topic: aiResult.topic || prev.topic,
        difficulty: aiResult.difficulty || prev.difficulty,
        questions: nextQuestions,
      }
    })

    toast({
      title: "Updated",
      description: mode === "append" ? "Questions added to the quiz" : "Quiz questions replaced",
    })
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <Header />

      <div className="container max-w-4xl py-8 space-y-8 relative z-10 animate-fadeIn">
        {!quizCreated ? (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-foreground">Create New Quiz</h1>
              <p className="text-muted-foreground">
                Fill in the details below to create your quiz. Add as many questions as you like or use the AI generator.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Card className="glass-card rounded-2xl overflow-hidden border-0 shadow-none">
                <CardHeader className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">AI Question Generator</CardTitle>
                      <CardDescription>Type a prompt like: &quot;Give 10 in GK for class 10&quot;</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="aiPrompt">
                      Prompt
                    </Label>
                    <Textarea
                      id="aiPrompt"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="min-h-[80px] rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Topic</Label>
                      <Select
                        value={aiTopic}
                        onValueChange={(value) => setAiTopic(value)}
                        className="rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      >
                        <option value="">Use quiz topic</option>
                        {topics.map((topic) => (
                          <option key={topic._id || topic.slug || topic.name} value={topic.name}>
                             {topic.name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Count</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={aiCount}
                        onChange={(e) => setAiCount(Number.parseInt(e.target.value || "10", 10))}
                        className="rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={aiGrade}
                        onChange={(e) => setAiGrade(Number.parseInt(e.target.value || "10", 10))}
                        className="rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={aiDifficulty}
                        onValueChange={(value) => setAiDifficulty(value)}
                        className="rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={handleGenerateAi}
                      disabled={aiLoading}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-lg shadow-violet-500/25 transition-all duration-300"
                    >
                      {aiLoading ? "Generating..." : "Generate with AI"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!aiResult?.questions?.length}
                      onClick={() => applyAiToQuiz("replace")}
                      className="rounded-xl border-violet-200 dark:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-violet-600 dark:text-violet-400"
                    >
                      Replace All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!aiResult?.questions?.length}
                      onClick={() => applyAiToQuiz("append")}
                      className="rounded-xl border-cyan-200 dark:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                    >
                      Add to Existing
                    </Button>
                  </div>

                  {aiResult?.questions?.length > 0 && (
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                        <CheckCircle className="h-4 w-4" />
                        Generated {aiResult.questions.length} questions for {aiResult.topic}
                      </div>
                      <div className="space-y-3">
                        {aiResult.questions.slice(0, 3).map((q, i) => (
                          <div key={i} className="p-4 rounded-xl border border-violet-100 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-500/5 text-sm">
                            <div className="font-medium mb-2">{i + 1}. {q.question}</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
                              {(q.options || []).slice(0, 4).map((opt, idx) => (
                                <div key={idx} className={idx === q.correctAnswer ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}>
                                  {String.fromCharCode(65 + idx)}. {opt}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {aiResult.questions.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">Sneak peek showing first 3 questions</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quiz Details */}
              <Card className="glass-card rounded-2xl overflow-hidden border-0 shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">Quiz Details</CardTitle>
                  <CardDescription>Basic information about your quiz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Quiz Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={quizData.title}
                      onChange={handleInputChange}
                      placeholder="Enter quiz title"
                      className={`rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.title ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" : ""}`}
                    />
                    {errors.title && <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">
                        Topic <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={quizData.topic}
                        onValueChange={(value) => handleSelectChange("topic", value)}
                        className={`rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 ${errors.topic ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" : ""}`}
                      >
                        <option value="">Select a topic</option>
                        {topics.map((topic) => (
                          <option key={topic._id || topic.slug || topic.name} value={topic.name}>
                             {topic.name}
                          </option>
                        ))}
                      </Select>
                      {errors.topic && <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors.topic}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={quizData.difficulty}
                        onValueChange={(value) => handleSelectChange("difficulty", value)}
                        className="rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      name="timeLimit"
                      type="number"
                      min="1"
                      max="120"
                      value={quizData.timeLimit / 60}
                      onChange={(e) => handleInputChange({ target: { name: "timeLimit", value: e.target.value * 60 } })}
                      placeholder="10"
                      className="rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    />
                    <p className="text-xs text-muted-foreground">Maximum time allowed for the quiz (1-120 minutes)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={quizData.description}
                      onChange={handleInputChange}
                      placeholder="Enter quiz description"
                      className="min-h-[100px] rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <div className="space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl md:text-2xl font-bold font-display">Questions</h2>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Add Question
                  </Button>
                </div>

                {quizData.questions.map((question, questionIndex) => (
                  <Card
                    key={questionIndex}
                    className="glass-card rounded-2xl relative overflow-hidden border-0 shadow-none border-t border-t-white/10"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-violet-500 to-cyan-500"></div>

                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(questionIndex)}
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          disabled={quizData.questions.length === 1}
                          title={`Remove question ${questionIndex + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${questionIndex}`}>
                          Question Text <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id={`question-${questionIndex}`}
                          value={question.question}
                          onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                          placeholder="What is..."
                          className={`rounded-xl bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 min-h-[80px] ${errors[`question_${questionIndex}`] ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" : ""}`}
                        />
                        {errors[`question_${questionIndex}`] && (
                          <p className="text-sm text-red-500 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" />{errors[`question_${questionIndex}`]}</p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>
                            Options <span className="text-red-500">*</span>
                          </Label>
                          {errors[`question_${questionIndex}_options`] && (
                            <p className="text-sm text-red-500">{errors[`question_${questionIndex}_options`]}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              question.correctAnswer === optionIndex 
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" 
                                : "border-border bg-secondary/30"
                            }`}>
                              <input
                                type="radio"
                                id={`correct-${questionIndex}-${optionIndex}`}
                                name={`correct-${questionIndex}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => handleQuestionChange(questionIndex, "correctAnswer", optionIndex)}
                                className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-border bg-background cursor-pointer"
                              />
                              <Label
                                htmlFor={`correct-${questionIndex}-${optionIndex}`}
                                className={`flex-shrink-0 w-16 text-sm font-medium cursor-pointer ${question.correctAnswer === optionIndex ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}
                              >
                                {question.correctAnswer === optionIndex ? "Correct" : `Opt ${optionIndex + 1}`}
                              </Label>
                              <Input
                                value={option}
                                onChange={(e) =>
                                  handleQuestionChange(questionIndex, "options", [optionIndex, e.target.value])
                                }
                                placeholder={`Enter option ${optionIndex + 1}`}
                                className={`h-9 border-0 bg-background/50 focus-visible:ring-1 focus-visible:ring-violet-500 ${
                                  option.trim() === "" && errors[`question_${questionIndex}_options`] ? "border border-red-500 ring-1 ring-red-500" : ""
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive" className="bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-900">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>Please fix the highlighted errors above before submitting your quiz.</AlertDescription>
                </Alert>
              )}

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  disabled={isLoading}
                  className="rounded-xl h-12 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl h-12 px-8 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 font-medium"
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Quiz</>
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* Success State */
          <Card className="glass-card rounded-3xl overflow-hidden border-0 shadow-none relative max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-cyan-500/5" />
            <CardHeader className="text-center pt-10 pb-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 rotate-3 animate-scale-in">
                <Save className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold font-display">Quiz Published!</CardTitle>
              <CardDescription>
                Your quiz &quot;<span className="font-medium text-foreground">{quizCreated.title}</span>&quot; is live.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="bg-secondary/50 rounded-2xl p-5 border border-border">
                <h3 className="font-medium mb-2 text-sm flex items-center gap-2"><Share2 className="h-4 w-4" /> Share Link</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    value={`${window.location.origin}/quiz/shared/${quizCreated.shareId}`}
                    readOnly
                    className="h-10 text-sm bg-background/50 border-border font-mono text-muted-foreground truncate"
                  />
                  <Button onClick={copyShareLink} variant="outline" className="h-10 px-4 rounded-xl shrink-0">
                    Copy
                  </Button>
                </div>
                
                <div className="mt-5 flex items-center justify-center bg-white p-4 rounded-xl mx-auto w-fit">
                  <QRCodeSVG value={`${window.location.origin}/quiz/shared/${quizCreated.shareId}`} size={140} />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-3">Scan to open on a mobile device</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-xl font-bold text-foreground">{quizCreated.questions?.length || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">Questions</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-xl font-bold text-foreground">{quizCreated.difficulty?.charAt(0)}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">Difficulty</div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 text-center border border-border">
                  <div className="text-xl font-bold text-foreground">{quizCreated.timeLimit / 60}m</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">Time Limit</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pb-8 relative z-10">
              <Button
                onClick={() => router.push(`/quiz/${quizCreated._id}`)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-medium shadow-lg shadow-violet-500/25"
              >
                Take Quiz Now
              </Button>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => router.push("/dashboard")}
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-11"
                  onClick={() => {
                    setQuizCreated(null)
                    setQuizData({
                      title: "",
                      description: "",
                      topic: topics.length > 0 ? topics[0].name : "",
                      difficulty: "Medium",
                      timeLimit: 600,
                      questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
                    })
                  }}
                >
                  Create Another
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
