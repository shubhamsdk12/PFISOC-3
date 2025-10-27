"use client"

import { PolarAngleAxis, PolarGrid, Radar, RadarChart as RechartsRadarChart, ResponsiveContainer } from "recharts"

interface RadarChartProps {
  company: {
    environment: number
    social: number
    governance: number
  }
}

export default function RadarChart({ company }: RadarChartProps) {
  const data = [
    { category: "Environment", value: company.environment },
    { category: "Social", value: company.social },
    { category: "Governance", value: company.governance },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="var(--esg-success)" strokeOpacity={0.2} />
        <PolarAngleAxis dataKey="category" stroke="var(--muted-foreground)" />
        <Radar name="Score" dataKey="value" stroke="var(--esg-success)" fill="var(--esg-success)" fillOpacity={0.3} />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}
