"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, User, LogOut, ChevronDown, Trophy, Flame, Zap, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { isAuthenticated, getUser, logout } from "@/lib/auth"
import { useTheme } from "next-themes"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthenticated_, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsAuthenticated(isAuthenticated())
    setUser(getUser())

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu")) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [isUserMenuOpen])

  const handleLogout = () => {
    logout()
    setIsAuthenticated(false)
    setUser(null)
    router.push("/")
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/topics", label: "Topics" },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/dashboard", label: "Dashboard", authRequired: true },
    { href: "/create", label: "Create", authRequired: true },
  ]

  const filteredNavLinks = navLinks.filter((link) => !link.authRequired || (link.authRequired && isAuthenticated_))

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? "bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl shadow-lg shadow-violet-500/5 border-b border-violet-100/20 dark:border-violet-900/20"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden md:flex items-center gap-1">
            {filteredNavLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-1.5 ${
                    isActive
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                      : "text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/5"
                  }`}
                >
                  {link.icon && <link.icon className="h-3.5 w-3.5" />}
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-600 dark:bg-violet-400" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {isAuthenticated_ ? (
            <div className="relative user-menu">
              <Button
                variant="ghost"
                className="flex items-center gap-2 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-500/10 px-3"
                onClick={toggleUserMenu}
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:inline-block font-medium text-sm">{user?.username || "User"}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white dark:bg-gray-900 ring-1 ring-black/5 dark:ring-white/10 divide-y divide-gray-100 dark:divide-gray-800 animate-scale-in overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-violet-50 to-cyan-50 dark:from-violet-950/30 dark:to-cyan-950/30">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate">{user?.email || "user@example.com"}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { router.push("/dashboard"); setIsUserMenuOpen(false) }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-left hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                    >
                      <Zap className="h-4 w-4 mr-3 text-violet-500" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { router.push("/leaderboard"); setIsUserMenuOpen(false) }}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-left hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                    >
                      <Trophy className="h-4 w-4 mr-3 text-amber-500" />
                      Leaderboard
                    </button>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="rounded-xl text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-500/10"
              >
                Sign In
              </Button>
              <Button
                className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 text-sm font-medium"
                onClick={() => router.push("/signup")}
              >
                Get Started
              </Button>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-lg" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl animate-fade-in">
          <div className="container py-4 space-y-3">
            <nav className="flex flex-col space-y-1">
              {filteredNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                      : "text-gray-600 dark:text-gray-400 hover:bg-violet-50/50 dark:hover:bg-violet-500/5"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
            </nav>

            {!isAuthenticated_ && (
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  className="rounded-xl border-violet-200 dark:border-violet-800"
                  onClick={() => { router.push("/login"); setIsMenuOpen(false) }}
                >
                  Sign In
                </Button>
                <Button
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white"
                  onClick={() => { router.push("/signup"); setIsMenuOpen(false) }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
