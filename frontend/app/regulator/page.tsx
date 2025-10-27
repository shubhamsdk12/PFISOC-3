import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default async function RegulatorPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch compliance logs
  const { data: complianceLogs } = await supabase
    .from("compliance_log")
    .select("*, companies(name, ticker)")
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch all companies for heatmap
  const { data: companies } = await supabase.from("companies").select("*")

  // Prepare heatmap data
  const heatmapData =
    companies?.map((company: any) => ({
      name: company.ticker,
      environment: company.environment_score,
      social: company.social_score,
      governance: company.governance_score,
      tci: company.tci_score,
    })) || []

  // Count issues by severity
  const severityCounts = {
    high: complianceLogs?.filter((log: any) => log.severity === "High").length || 0,
    medium: complianceLogs?.filter((log: any) => log.severity === "Medium").length || 0,
    low: complianceLogs?.filter((log: any) => log.severity === "Low").length || 0,
  }

  return (
    <div className="min-h-screen bg-esg-dark-bg">
      <header className="border-b border-esg-accent/10 bg-esg-card-bg/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-esg-accent">Regulatory Oversight</h1>
              <p className="text-muted-foreground">Compliance monitoring and enforcement</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Severity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-error/20">
            <p className="text-muted-foreground text-sm mb-2">High Severity</p>
            <p className="text-3xl font-bold text-esg-error">{severityCounts.high}</p>
            <p className="text-xs text-muted-foreground mt-2">Issues requiring immediate action</p>
          </div>

          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-warning/20">
            <p className="text-muted-foreground text-sm mb-2">Medium Severity</p>
            <p className="text-3xl font-bold text-esg-warning">{severityCounts.medium}</p>
            <p className="text-xs text-muted-foreground mt-2">Issues to monitor</p>
          </div>

          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/20">
            <p className="text-muted-foreground text-sm mb-2">Low Severity</p>
            <p className="text-3xl font-bold text-esg-success">{severityCounts.low}</p>
            <p className="text-xs text-muted-foreground mt-2">Minor issues</p>
          </div>
        </div>

        {/* ESG Heatmap */}
        <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10 mb-8">
          <h2 className="text-xl font-bold text-esg-accent mb-4">ESG Performance Heatmap</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={heatmapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--esg-success)" strokeOpacity={0.1} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--esg-card-bg)",
                  border: "1px solid var(--esg-success)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="environment" fill="var(--esg-success)" />
              <Bar dataKey="social" fill="var(--esg-warning)" />
              <Bar dataKey="governance" fill="var(--esg-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Log */}
        <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
          <h2 className="text-xl font-bold text-esg-accent mb-4">Compliance Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-esg-success/20">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Company</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Event Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Description</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Severity</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {complianceLogs && complianceLogs.length > 0 ? (
                  complianceLogs.map((log: any) => (
                    <tr key={log.id} className="border-b border-esg-success/10 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-foreground font-semibold">{log.companies?.ticker}</td>
                      <td className="py-3 px-4 text-muted-foreground">{log.event_type}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{log.description}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor:
                              log.severity === "High"
                                ? "var(--esg-error)"
                                : log.severity === "Medium"
                                  ? "var(--esg-warning)"
                                  : "var(--esg-success)",
                            color: "black",
                          }}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(log.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No compliance logs available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
