"use client"

interface SparklineProps {
  data: number[]
  height?: number
  color?: string
}

export function Sparkline({ data, height = 20, color = "var(--esg-success)" }: SparklineProps) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  })

  const pathData = `M ${points.join(" L ")}`

  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} className="overflow-visible">
      <path d={pathData} stroke={color} strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" />
      <circle
        cx={points[points.length - 1]?.split(",")[0]}
        cy={points[points.length - 1]?.split(",")[1]}
        r="1.5"
        fill={color}
      />
    </svg>
  )
}
