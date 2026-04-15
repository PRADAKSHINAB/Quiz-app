"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl border-t border-violet-100/20 dark:border-violet-900/20 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Empowering learners through AI-driven adaptive quizzes. Master any subject with our interactive platform.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <Link href="#" className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Product</h4>
            <ul className="space-y-4">
              <li><Link href="/topics" className="text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Topics</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Leaderboard</Link></li>
              <li><Link href="/create" className="text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Create Quiz</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Company</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Stay updated with our latest quizzes and features.</p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-white dark:bg-gray-900 border border-violet-100 dark:border-violet-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full"
              />
              <button className="bg-violet-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-violet-700 transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-violet-100/10 dark:border-violet-900/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} QuizMaster. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors flex items-center gap-1">
              <Mail className="h-3 w-3" /> hello@quizmaster.com
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
