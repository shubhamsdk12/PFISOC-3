"use client"

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface FairnessMeterProps {
  fairnessScore?: number
}

export default function FairnessMeter({ fairnessScore = 72 }: FairnessMeterProps) {
  const biasScore = 100 - fairnessScore
  const data = [
    { name: "Fair", value: fairnessScore },
    { name: "Biased", value: biasScore },
  ]

  const COLORS = ["var(--esg-success)", "var(--esg-error)"]

  return (
    <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
      <h4 className="font-bold text-esg-accent mb-4">⚖️ Fairness Meter</h4>
      <ResponsiveContainer width="100%" height={150}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fair Assessment</span>
          <span className="text-esg-success">{fairnessScore.toFixed(1)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Potential Bias</span>
          <span className="text-esg-error">{biasScore.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
