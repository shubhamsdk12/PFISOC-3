"use client"

interface PulseIndicatorProps {
  isActive: boolean
  label: string
}

export function PulseIndicator({ isActive, label }: PulseIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {isActive && (
        <div className="relative w-3 h-3">
          <div className="absolute inset-0 bg-esg-accent rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-esg-accent rounded-full opacity-75 animate-ping" />
        </div>
      )}
      <span className={`text-sm ${isActive ? "text-esg-accent font-semibold" : "text-muted-foreground"}`}>{label}</span>
    </div>
  )
}
