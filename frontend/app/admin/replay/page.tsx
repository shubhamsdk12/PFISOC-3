"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReplayEvent {
  timestamp: string
  company: string
  ticker: string
  eventType: string
  tciScoreBefore: number
  tciScoreAfter: number
  description: string
}

const mockEvents: ReplayEvent[] = [
  {
    timestamp: "2024-01-15T10:30:00Z",
    company: "Tesla Inc.",
    ticker: "TSLA",
    eventType: "Score Update",
    tciScoreBefore: 76.2,
    tciScoreAfter: 78.5,
    description: "Carbon neutral commitment verified by third party",
  },
  {
    timestamp: "2024-01-14T14:45:00Z",
    company: "Apple Inc.",
    ticker: "AAPL",
    eventType: "Claim Contradiction",
    tciScoreBefore: 73.1,
    tciScoreAfter: 72.3,
    description: "Supply chain labor practices questioned",
  },
  {
    timestamp: "2024-01-13T09:15:00Z",
    company: "Microsoft Corporation",
    ticker: "MSFT",
    eventType: "Score Update",
    tciScoreBefore: 74.8,
    tciScoreAfter: 75.1,
    description: "Renewable energy target increased",
  },
  {
    timestamp: "2024-01-12T16:20:00Z",
    company: "Unilever PLC",
    ticker: "UL",
    eventType: "Compliance Alert",
    tciScoreBefore: 68.7,
    tciScoreAfter: 68.7,
    description: "Regulatory filing deadline approaching",
  },
  {
    timestamp: "2024-01-11T11:00:00Z",
    company: "Nestlé S.A.",
    ticker: "NSRGY",
    eventType: "Score Update",
    tciScoreBefore: 64.9,
    tciScoreAfter: 65.4,
    description: "Water conservation initiative launched",
  },
]

export default function ReplayPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEventIndex, setCurrentEventIndex] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<ReplayEvent | null>(null)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentEventIndex(0)
  }

  const handleNext = () => {
    if (currentEventIndex < mockEvents.length - 1) {
      setCurrentEventIndex(currentEventIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentEventIndex > 0) {
      setCurrentEventIndex(currentEventIndex - 1)
    }
  }

  const currentEvent = mockEvents[currentEventIndex]

  return (
    <div className="min-h-screen bg-esg-dark-bg">
      <header className="border-b border-esg-accent/10 bg-esg-card-bg/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-esg-accent">Admin Replay Mode</h1>
              <p className="text-muted-foreground">Playback historical ESG events and score changes</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Replay Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Event Display */}
            <Card className="bg-esg-card-bg border-esg-accent/20">
              <CardHeader>
                <CardTitle className="text-esg-accent">Current Event</CardTitle>
                <CardDescription>
                  Event {currentEventIndex + 1} of {mockEvents.length}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentEvent && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="text-lg font-semibold text-foreground">{currentEvent.company}</p>
                        <p className="text-xs text-muted-foreground">{currentEvent.ticker}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Event Type</p>
                        <p className="text-lg font-semibold text-esg-accent">{currentEvent.eventType}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="text-foreground">{currentEvent.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-esg-error/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">TCI Score Before</p>
                        <p className="text-2xl font-bold text-esg-error">{currentEvent.tciScoreBefore.toFixed(1)}</p>
                      </div>
                      <div className="p-3 border border-esg-success/20 rounded-lg">
                        <p className="text-xs text-muted-foreground">TCI Score After</p>
                        <p className="text-2xl font-bold text-esg-success">{currentEvent.tciScoreAfter.toFixed(1)}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-esg-accent/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">Change</p>
                      <p
                        className={`text-lg font-semibold ${currentEvent.tciScoreAfter > currentEvent.tciScoreBefore ? "text-esg-success" : "text-esg-error"}`}
                      >
                        {currentEvent.tciScoreAfter > currentEvent.tciScoreBefore ? "+" : ""}
                        {(currentEvent.tciScoreAfter - currentEvent.tciScoreBefore).toFixed(1)}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">{new Date(currentEvent.timestamp).toLocaleString()}</p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card className="bg-esg-card-bg border-esg-accent/20">
              <CardHeader>
                <CardTitle className="text-esg-accent">Playback Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                    ⏮ Reset
                  </Button>
                  <Button onClick={handlePrevious} variant="outline" className="flex-1 bg-transparent">
                    ⏪ Previous
                  </Button>
                  <Button
                    onClick={handlePlayPause}
                    className="flex-1 bg-esg-accent hover:bg-esg-accent/90 text-black font-semibold"
                  >
                    {isPlaying ? "⏸ Pause" : "▶ Play"}
                  </Button>
                  <Button onClick={handleNext} variant="outline" className="flex-1 bg-transparent">
                    ⏩ Next
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Playback Speed</label>
                  <div className="flex gap-2">
                    {[0.5, 1, 1.5, 2].map((s) => (
                      <Button
                        key={s}
                        onClick={() => setSpeed(s)}
                        variant={speed === s ? "default" : "outline"}
                        size="sm"
                        className={speed === s ? "bg-esg-accent text-black" : ""}
                      >
                        {s}x
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {currentEventIndex + 1} / {mockEvents.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2">
                    <div
                      className="bg-esg-accent h-2 rounded-full transition-all"
                      style={{ width: `${((currentEventIndex + 1) / mockEvents.length) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Timeline */}
          <div className="space-y-4">
            <Card className="bg-esg-card-bg border-esg-accent/20">
              <CardHeader>
                <CardTitle className="text-esg-accent">Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mockEvents.map((event, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentEventIndex(index)
                        setSelectedEvent(event)
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        index === currentEventIndex
                          ? "bg-esg-accent/20 border border-esg-accent"
                          : "border border-esg-accent/10 hover:border-esg-accent/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{event.ticker}</p>
                          <p className="text-xs text-muted-foreground truncate">{event.eventType}</p>
                        </div>
                        <span
                          className={`text-xs font-semibold whitespace-nowrap ${
                            event.tciScoreAfter > event.tciScoreBefore ? "text-esg-success" : "text-esg-error"
                          }`}
                        >
                          {event.tciScoreAfter > event.tciScoreBefore ? "+" : ""}
                          {(event.tciScoreAfter - event.tciScoreBefore).toFixed(1)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
