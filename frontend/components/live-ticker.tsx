"use client"

import { useEffect, useState } from "react"

interface TickerEvent {
  id: string
  company: string
  event: string
  timestamp: string
}

export function LiveTicker() {
  const [events, setEvents] = useState<TickerEvent[]>([
    { id: "1", company: "TechCorp", event: "ESG Score +2.4%", timestamp: "2 min ago" },
    { id: "2", company: "GreenEnergy", event: "New Sustainability Report", timestamp: "5 min ago" },
    { id: "3", company: "SocialImpact", event: "Fairness Score Updated", timestamp: "8 min ago" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => [
        ...prev.slice(1),
        {
          id: Date.now().toString(),
          company: `Company ${Math.floor(Math.random() * 100)}`,
          event: `Score Update +${(Math.random() * 5).toFixed(1)}%`,
          timestamp: "now",
        },
      ])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-esg-dark-bg via-esg-card-bg to-esg-dark-bg border-b border-esg-accent/20 z-50">
      <div className="overflow-hidden">
        <div className="flex animate-scroll gap-8 px-4 py-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 whitespace-nowrap">
              <span className="text-esg-accent font-semibold">⚡</span>
              <span className="text-sm text-foreground">{event.company}</span>
              <span className="text-xs text-muted-foreground">{event.event}</span>
              <span className="text-xs text-esg-accent">{event.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
