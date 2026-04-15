"use client"

import Link from "next/link"
import { Brain } from "lucide-react"

export function Logo({ size = "default" }) {
  const sizes = {
    small: { container: "w-7 h-7", icon: "h-3.5 w-3.5", text: "text-base" },
    default: { container: "w-8 h-8", icon: "h-4 w-4", text: "text-lg" },
    large: { container: "w-12 h-12", icon: "h-6 w-6", text: "text-2xl" },
  }

  const s = sizes[size] || sizes.default

  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className={`${s.container} rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105`}>
        <Brain className={`${s.icon} text-white`} />
      </div>
      <span className={`${s.text} font-bold font-display tracking-tight`}>
        Quiz<span className="gradient-text">Master</span>
      </span>
    </Link>
  )
}
