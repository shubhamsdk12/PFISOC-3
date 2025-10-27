"use client"

export function NeonLoader() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-esg-accent border-r-esg-secondary animate-spin"></div>
        <div
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-esg-accent opacity-50 animate-spin"
          style={{ animationDirection: "reverse" }}
        ></div>
      </div>
    </div>
  )
}
