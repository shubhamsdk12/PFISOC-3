interface ProgressBarProps {
  label: string
  value: number
}

export default function ProgressBar({ label, value }: ProgressBarProps) {
  /* Using semantic token CSS variables instead of hardcoded hex colors */
  const getColor = (val: number) => {
    if (val >= 70) return "var(--esg-success)"
    if (val >= 40) return "var(--esg-warning)"
    return "var(--esg-error)"
  }

  const color = getColor(value)

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {value}%
        </span>
      </div>
      <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </div>
  )
}
