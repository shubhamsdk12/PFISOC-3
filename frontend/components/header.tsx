"use client"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  viewMode: "investor" | "regulator"
  setViewMode: (mode: "investor" | "regulator") => void
}

export default function Header({ viewMode, setViewMode }: HeaderProps) {
  return (
    <header className="esg-card-bg border-b border-esg-success/20 px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold esg-text-green mb-2">ESG Credibility Monitor</h1>
          <p className="text-muted-foreground text-sm">AI-powered verification of sustainability claims in real time</p>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex gap-2 bg-muted/30 rounded-lg p-1">
            <Button
              onClick={() => setViewMode("investor")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "investor"
                  ? "bg-esg-success text-black font-semibold"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              🟩 Investor View
            </Button>
            <Button
              onClick={() => setViewMode("regulator")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "regulator"
                  ? "bg-esg-success text-black font-semibold"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              🟦 Regulator View
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
