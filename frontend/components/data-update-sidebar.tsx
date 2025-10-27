"use client"

const updates = [
  { time: "2 hours ago", company: "GreenTech Solutions", status: "Updated" },
  { time: "4 hours ago", company: "EcoEnergy Corp", status: "Alert" },
  { time: "1 hour ago", company: "SustainableWorks Inc", status: "Updated" },
  { time: "30 mins ago", company: "ClimateFirst Ltd", status: "Updated" },
  { time: "3 hours ago", company: "GreenWave Industries", status: "Alert" },
]

export default function DataUpdateSidebar() {
  return (
    <aside className="w-64 esg-card-bg border-l border-esg-success/20 p-6 max-h-screen overflow-y-auto">
      <h3 className="text-lg font-bold esg-text-green mb-4">📋 Data Updates</h3>

      <div className="space-y-3">
        {updates.map((update, idx) => (
          <div
            key={idx}
            className="p-3 bg-muted/30 rounded-lg border border-esg-success/10 hover:border-esg-success/30 transition-colors"
          >
            <p className="text-xs text-muted-foreground mb-1">{update.time}</p>
            <p className="text-sm font-semibold text-foreground mb-1">{update.company}</p>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                /* Using semantic token variables for status colors */
                update.status === "Alert" ? "bg-esg-error/20 text-esg-error" : "bg-esg-success/20 text-esg-success"
              }`}
            >
              {update.status}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 bg-esg-success/10 hover:bg-esg-success/20 text-esg-success rounded-lg text-sm font-semibold transition-colors">
        View Full Log
      </button>
    </aside>
  )
}
