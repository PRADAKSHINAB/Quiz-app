"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { signup, isAuthenticated } from "@/lib/auth"
import { Logo } from "@/components/logo"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Password validation
  const passwordHasMinLength = formData.password.length >= 8
  const passwordHasNumber = /\d/.test(formData.password)
  const passwordHasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""

  const isPasswordValid = passwordHasMinLength && passwordHasNumber && passwordHasSpecial
  const isFormValid = formData.username && formData.email && isPasswordValid && passwordsMatch

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create account",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-background">
      {/* Background */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-10 relative z-10">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] animate-fadeIn">
          <div className="flex flex-col space-y-3 text-center">
            <div className="mx-auto">
              <Logo size="large" />
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Join us to start creating and sharing quizzes</p>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="rounded-xl h-11 bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="rounded-xl h-11 bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="rounded-xl h-11 bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="space-y-1.5 mt-3 text-xs">
                    <div className={`flex items-center gap-1.5 ${passwordHasMinLength ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {passwordHasMinLength ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current opacity-50" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordHasNumber ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {passwordHasNumber ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current opacity-50" />
                      )}
                      <span>Contains a number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordHasSpecial ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {passwordHasSpecial ? (
                        <Check size={14} className="text-emerald-500" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-current opacity-50" />
                      )}
                      <span>Contains a special character</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`rounded-xl h-11 bg-secondary/50 border-border focus:ring-2 focus:ring-violet-500/30 transition-all ${
                      formData.confirmPassword && !passwordsMatch ? "border-red-500 focus:border-red-500 focus:ring-red-500/30" : "focus:border-violet-500"
                    }`}
                  />
                  {formData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-500" /> Passwords do not match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 font-medium mt-6"
                  disabled={isLoading || !isFormValid}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-5 relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full rounded-xl h-11 hover:bg-secondary transition-all" disabled>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full rounded-xl h-11 hover:bg-secondary transition-all" disabled>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                      fill="currentColor"
                    />
                  </svg>
                  GitHub
                </Button>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-center">
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </div>
        </div>
      </div>
    </div>
  )
}
