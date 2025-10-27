"use client"

import { useState } from "react"
import ProgressBar from "./progress-bar"

interface Company {
  id: string
  name: string
  ticker: string
  sector: string
  tci_score: number
  environment_score: number
  social_score: number
  governance_score: number
  fairness_score: number
  confidence_level: number
  last_updated: string
}

interface CompanyCardProps {
  company: Company
  isHovered: boolean
  onHover: () => void
  onLeave: () => void
}

function getScoreBadge(score: number) {
  if (score >= 70) return { emoji: "🟢", label: "Trustworthy", color: "var(--esg-success)" }
  if (score >= 40) return { emoji: "🟠", label: "Moderate Risk", color: "var(--esg-warning)" }
  return { emoji: "🔴", label: "Critical", color: "var(--esg-error)" }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default function CompanyCard({ company, isHovered, onHover, onLeave }: CompanyCardProps) {
  const badge = getScoreBadge(company.tci_score)
  const [showClaims, setShowClaims] = useState(false)

  return (
    <div
      onMouseEnter={() => {
        onHover()
        setShowClaims(true)
      }}
      onMouseLeave={() => {
        onLeave()
        setShowClaims(false)
      }}
      className={`glass-card rounded-2xl p-6 cursor-pointer transition-all duration-300 neon-border-green ${
        isHovered ? "esg-glow-green transform scale-105 shadow-2xl shadow-emerald-500/30" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-lg bg-esg-accent/10 flex items-center justify-center text-lg font-bold text-esg-accent">
            {company.ticker.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground truncate">{company.name}</h3>
            <p className="text-xs text-muted-foreground">{company.sector}</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-esg-accent ml-2">{company.ticker}</span>
      </div>

      {/* Score Section */}
      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">TCI Score</span>
          <span className="text-xs text-muted-foreground">Confidence: {company.confidence_level.toFixed(1)}%</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-esg-accent">{company.tci_score.toFixed(1)}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Updated {formatDate(company.last_updated)}</p>
      </div>

      {/* Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl">{badge.emoji}</span>
        <span className="text-sm font-semibold" style={{ color: badge.color }}>
          {badge.label}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3 mb-4">
        <ProgressBar label="Environment" value={company.environment_score} />
        <ProgressBar label="Social" value={company.social_score} />
        <ProgressBar label="Governance" value={company.governance_score} />
      </div>

      {/* Fairness Score */}
      <div className="mb-4 p-2 bg-esg-accent/5 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Fairness Score</span>
          <span className="text-sm font-semibold text-esg-accent">{company.fairness_score.toFixed(1)}</span>
        </div>
      </div>

      {/* Hover Claims Section */}
      {showClaims && (
        <div className="mt-4 pt-4 border-t border-esg-success/20 space-y-2 animate-in fade-in duration-200">
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-esg-success mb-1">✅ Supporting Claims</p>
            <p className="text-muted-foreground">Strong ESG commitment</p>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-semibold text-esg-error mb-1">❌ Contradicting Claims</p>
            <p className="text-muted-foreground">Some inconsistencies found</p>
          </div>
        </div>
      )}

      <button className="w-full mt-4 py-2 bg-esg-success/10 hover:bg-esg-success/20 text-esg-success rounded-lg text-sm font-semibold transition-colors">
        View Details →
      </button>
    </div>
  )
}
