import type React from "react"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: "green" | "cyan" | "red" | "orange"
}

export function GlassCard({ children, className = "", glowColor = "green" }: GlassCardProps) {
  const glowClasses = {
    green: "neon-border-green esg-glow-green",
    cyan: "neon-border-cyan esg-glow-cyan",
    red: "esg-glow-red",
    orange: "esg-glow-orange",
  }

  return <div className={`glass-card ${glowClasses[glowColor]} ${className}`}>{children}</div>
}
