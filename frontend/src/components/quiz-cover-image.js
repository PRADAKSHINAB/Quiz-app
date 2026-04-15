"use client"

import { useEffect, useMemo, useState } from "react"
import { getQuizIllustrationDataUrl } from "@/lib/quiz-illustrations"
import { cn } from "@/lib/utils"

const isImageUrl = (url) => typeof url === "string" && url.length > 0

export function QuizCoverImage({ quiz, className }) {
  const illustration = useMemo(
    () => getQuizIllustrationDataUrl({ title: quiz?.title, topic: quiz?.topic }),
    [quiz?.title, quiz?.topic],
  )

  const remoteSrc = isImageUrl(quiz?.imageUrl) ? quiz.imageUrl : ""
  const [remoteVisible, setRemoteVisible] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (isImageUrl(remoteSrc)) {
      const img = new Image()
      img.src = remoteSrc
      img.onload = () => setRemoteVisible(true)
      img.onerror = () => setRemoteVisible(false)
    } else {
      setRemoteVisible(false)
    }
  }, [remoteSrc])

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden quiz-cover-wrapper", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* SVG Illustration */}
      <img
        src={illustration}
        alt={quiz?.title || "Quiz cover"}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out quiz-cover-img",
          remoteVisible && isLoaded ? "opacity-0 scale-110" : "opacity-100 scale-100",
          hovered && !(remoteVisible && isLoaded) ? "scale-105" : ""
        )}
        draggable={false}
      />

      {/* Remote image (if available) */}
      {remoteVisible ? (
        <img
          src={remoteSrc}
          alt={quiz?.title || "Quiz cover"}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
            hovered && isLoaded ? "scale-105" : ""
          )}
          draggable={false}
          onLoad={() => setIsLoaded(true)}
          onError={() => setRemoteVisible(false)}
        />
      ) : null}

      {/* Animated scanline overlay for tech feel */}
      <div className="absolute inset-0 quiz-cover-scanline pointer-events-none" />

      {/* Gradient overlay - bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

      {/* Hover shine effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 pointer-events-none transition-opacity duration-500",
        hovered ? "opacity-100" : "opacity-0"
      )} />

      {/* Corner glow accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-violet-500/20 to-transparent pointer-events-none" />
    </div>
  )
}
