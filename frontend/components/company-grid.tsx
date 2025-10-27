"use client"

import { useState } from "react"
import Link from "next/link"
import CompanyCard from "./company-card"

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

interface CompanyGridProps {
  companies: Company[]
}

export function CompanyGrid({ companies }: CompanyGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No companies available. Check back soon.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-esg-accent mb-2">ESG Companies</h2>
        <p className="text-muted-foreground">Track sustainability claims and credibility scores in real-time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Link key={company.id} href={`/company/${company.id}`}>
            <CompanyCard
              company={company}
              isHovered={hoveredId === company.id}
              onHover={() => setHoveredId(company.id)}
              onLeave={() => setHoveredId(null)}
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
