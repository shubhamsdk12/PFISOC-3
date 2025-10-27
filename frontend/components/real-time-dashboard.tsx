"use client"

import { useRealtimeCompanies } from "@/hooks/use-realtime-companies"
import { PulseIndicator } from "./pulse-indicator"
import Link from "next/link"

export function RealTimeDashboard() {
  const { companies, isLoading, error } = useRealtimeCompanies()

  if (error) {
    return (
      <div className="p-4 bg-esg-error/10 border border-esg-error/20 rounded-lg">
        <p className="text-sm text-esg-error">Error loading real-time data: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-esg-accent">Live Companies</h2>
        <PulseIndicator isActive={!isLoading} label="Real-time sync active" />
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block">
            <div className="w-8 h-8 border-4 border-esg-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground mt-2">Loading real-time data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link key={company.id} href={`/company/${company.id}`}>
              <div className="p-4 border border-esg-accent/20 rounded-lg hover:border-esg-accent/40 transition-all hover:bg-esg-card-bg/50 cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{company.name}</h3>
                    <p className="text-xs text-muted-foreground">{company.sector}</p>
                  </div>
                  <span className="text-sm font-bold text-esg-accent">{company.ticker}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm text-muted-foreground">TCI: {company.tci_score.toFixed(1)}</span>
                  <span className="text-xs text-esg-accent">Confidence: {company.confidence_level.toFixed(0)}%</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
