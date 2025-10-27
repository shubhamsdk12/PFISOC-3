"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import RadarChart from "./radar-chart"
import ClaimVerificationTable from "./claim-verification-table"
import ExplainabilityPopup from "./explainability-popup"
import FairnessMeter from "./fairness-meter"

interface AnalyticsViewProps {
  companyId: string
  onBack: () => void
}

const mockCompanyData = {
  "1": {
    name: "GreenTech Solutions",
    logo: "🌱",
    score: 78,
    environment: 82,
    social: 75,
    governance: 77,
  },
  "2": {
    name: "EcoEnergy Corp",
    logo: "⚡",
    score: 45,
    environment: 52,
    social: 38,
    governance: 45,
  },
  "3": {
    name: "SustainableWorks Inc",
    logo: "🏭",
    score: 32,
    environment: 28,
    social: 35,
    governance: 33,
  },
  "4": {
    name: "ClimateFirst Ltd",
    logo: "🌍",
    score: 88,
    environment: 92,
    social: 85,
    governance: 87,
  },
  "5": {
    name: "GreenWave Industries",
    logo: "🌊",
    score: 61,
    environment: 65,
    social: 58,
    governance: 60,
  },
  "6": {
    name: "Carbon Neutral Co",
    logo: "♻️",
    score: 72,
    environment: 78,
    social: 70,
    governance: 68,
  },
}

export default function AnalyticsView({ companyId, onBack }: AnalyticsViewProps) {
  const company = mockCompanyData[companyId as keyof typeof mockCompanyData]
  const [showExplainability, setShowExplainability] = useState(false)

  if (!company) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} className="bg-esg-success/10 hover:bg-esg-success/20 text-esg-success rounded-lg">
            ← Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold esg-text-green">{company.name}</h2>
            <p className="text-muted-foreground">Detailed ESG Analysis</p>
          </div>
        </div>
        <Button className="bg-esg-success text-black hover:bg-esg-success/90 font-semibold rounded-lg">
          📥 Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Radar Chart */}
          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10 esg-glow-green">
            <h3 className="text-lg font-bold esg-text-green mb-4">ESG Performance Radar</h3>
            <RadarChart company={company} />
          </div>

          {/* Claims Table */}
          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold esg-text-green">Claim Verification</h3>
              <Button
                onClick={() => setShowExplainability(!showExplainability)}
                className="bg-esg-success/10 hover:bg-esg-success/20 text-esg-success text-sm rounded-lg"
              >
                🧠 Explainability
              </Button>
            </div>
            <ClaimVerificationTable />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score Card */}
          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10 esg-glow-green">
            <p className="text-muted-foreground text-sm mb-2">Overall Score</p>
            <p className="text-4xl font-bold esg-text-green mb-4">{company.score}/100</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="esg-text-green">{company.environment}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Social</span>
                <span className="esg-text-green">{company.social}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Governance</span>
                <span className="esg-text-green">{company.governance}%</span>
              </div>
            </div>
          </div>

          {/* Fairness Meter */}
          <FairnessMeter />

          {/* Recommendation */}
          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
            <h4 className="font-bold esg-text-green mb-3">💡 Recommendation</h4>
            <p className="text-sm text-foreground">
              Increase third-party verification of emission claims next quarter to strengthen credibility.
            </p>
          </div>
        </div>
      </div>

      {/* Explainability Popup */}
      {showExplainability && <ExplainabilityPopup onClose={() => setShowExplainability(false)} />}
    </div>
  )
}
