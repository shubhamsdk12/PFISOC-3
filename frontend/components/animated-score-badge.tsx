"use client"

import { useEffect, useState } from "react"

interface AnimatedScoreBadgeProps {
  score: number
  label: string
}

export function AnimatedScoreBadge({ score, label }: AnimatedScoreBadgeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    let animationFrame: number
    let currentScore = 0

    const animate = () => {
      if (currentScore < score) {
        currentScore += (score - currentScore) * 0.1
        setDisplayScore(Math.round(currentScore * 10) / 10)
        animationFrame = requestAnimationFrame(animate)
      } else {
        setDisplayScore(score)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [score])

  const getColor = (s: number) => {
    if (s >= 70) return "text-esg-success"
    if (s >= 40) return "text-esg-warning"
    return "text-esg-error"
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-2xl font-bold ${getColor(displayScore)}`}>{displayScore.toFixed(1)}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
