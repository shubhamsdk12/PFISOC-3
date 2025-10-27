import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import RadarChart from "@/components/radar-chart"
import ClaimVerificationTable from "@/components/claim-verification-table"
import FairnessMeter from "@/components/fairness-meter"
import Link from "next/link"

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch company data
  const { data: company, error: companyError } = await supabase.from("companies").select("*").eq("id", id).single()

  if (companyError || !company) {
    redirect("/dashboard")
  }

  // Fetch claims for this company
  const { data: claims } = await supabase
    .from("claims")
    .select("*")
    .eq("company_id", id)
    .order("created_at", { ascending: false })

  const supportingClaims = claims?.filter((c) => c.status === "Supporting") || []
  const contradictingClaims = claims?.filter((c) => c.status === "Contradicting") || []

  return (
    <div className="min-h-screen bg-esg-dark-bg">
      <header className="border-b border-esg-accent/10 bg-esg-card-bg/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-esg-accent hover:text-esg-accent/80 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-esg-accent">{company.name}</h1>
              <p className="text-muted-foreground">{company.sector}</p>
            </div>
            <Button className="bg-esg-accent hover:bg-esg-accent/90 text-black font-semibold">
              📥 Download Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Radar Chart */}
              <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10 esg-glow-green">
                <h3 className="text-lg font-bold text-esg-accent mb-4">ESG Performance Radar</h3>
                <RadarChart
                  company={{
                    environment: company.environment_score,
                    social: company.social_score,
                    governance: company.governance_score,
                  }}
                />
              </div>

              {/* Claims Table */}
              <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
                <h3 className="text-lg font-bold text-esg-accent mb-4">Claim Verification</h3>
                <ClaimVerificationTable claims={claims || []} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Score Card */}
              <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10 esg-glow-green">
                <p className="text-muted-foreground text-sm mb-2">TCI Score</p>
                <p className="text-4xl font-bold text-esg-accent mb-4">{company.tci_score.toFixed(1)}</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Environment</span>
                    <span className="text-esg-accent font-semibold">{company.environment_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Social</span>
                    <span className="text-esg-accent font-semibold">{company.social_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Governance</span>
                    <span className="text-esg-accent font-semibold">{company.governance_score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-esg-accent/10">
                    <span className="text-muted-foreground">Fairness</span>
                    <span className="text-esg-accent font-semibold">{company.fairness_score.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Confidence Level */}
              <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
                <p className="text-muted-foreground text-sm mb-2">Confidence Level</p>
                <p className="text-3xl font-bold text-esg-accent mb-2">{company.confidence_level.toFixed(1)}%</p>
                <div className="w-full bg-muted/30 rounded-full h-2">
                  <div
                    className="bg-esg-accent h-2 rounded-full transition-all"
                    style={{ width: `${company.confidence_level}%` }}
                  />
                </div>
              </div>

              {/* Fairness Meter */}
              <FairnessMeter fairnessScore={company.fairness_score} />

              {/* Claims Summary */}
              <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
                <h4 className="font-bold text-esg-accent mb-3">Claims Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">✅ Supporting</span>
                    <span className="text-esg-success font-semibold">{supportingClaims.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">❌ Contradicting</span>
                    <span className="text-esg-error font-semibold">{contradictingClaims.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Claims</span>
                    <span className="text-foreground font-semibold">{claims?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
