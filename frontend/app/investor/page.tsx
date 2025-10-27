import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function InvestorPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's watchlist
  const { data: watchlist } = await supabase.from("watchlist").select("*, companies(*)").eq("user_id", user.id)

  // Fetch all companies for comparison
  const { data: allCompanies } = await supabase.from("companies").select("*").order("tci_score", { ascending: false })

  // Calculate portfolio metrics
  const portfolioCompanies = watchlist?.map((item: any) => item.companies) || []
  const avgTciScore =
    portfolioCompanies.length > 0
      ? portfolioCompanies.reduce((sum: number, c: any) => sum + c.tci_score, 0) / portfolioCompanies.length
      : 0

  const avgRiskPremium =
    watchlist && watchlist.length > 0
      ? watchlist.reduce((sum: number, item: any) => sum + (item.risk_premium || 0), 0) / watchlist.length
      : 0

  return (
    <div className="min-h-screen bg-esg-dark-bg">
      <header className="border-b border-esg-accent/10 bg-esg-card-bg/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-esg-accent">Investor Portfolio</h1>
              <p className="text-muted-foreground">Track ESG-adjusted risk premiums</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Portfolio Metrics */}
          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
            <p className="text-muted-foreground text-sm mb-2">Portfolio Size</p>
            <p className="text-3xl font-bold text-esg-accent">{portfolioCompanies.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Companies tracked</p>
          </div>

          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
            <p className="text-muted-foreground text-sm mb-2">Avg TCI Score</p>
            <p className="text-3xl font-bold text-esg-accent">{avgTciScore.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground mt-2">Portfolio average</p>
          </div>

          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
            <p className="text-muted-foreground text-sm mb-2">Avg Risk Premium</p>
            <p className="text-3xl font-bold text-esg-accent">{avgRiskPremium.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-2">ESG-adjusted</p>
          </div>

          <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
            <p className="text-muted-foreground text-sm mb-2">Portfolio Health</p>
            <p className="text-3xl font-bold text-esg-accent">
              {avgTciScore >= 70 ? "Good" : avgTciScore >= 40 ? "Fair" : "Poor"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Overall status</p>
          </div>
        </div>

        {/* Watchlist Table */}
        <div className="esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
          <h2 className="text-xl font-bold text-esg-accent mb-4">Your Watchlist</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-esg-success/20">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Company</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Sector</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold">TCI Score</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Risk Premium</th>
                  <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {portfolioCompanies.length > 0 ? (
                  portfolioCompanies.map((company: any, idx: number) => (
                    <tr key={company.id} className="border-b border-esg-success/10 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-foreground font-semibold">
                        <Link href={`/company/${company.id}`} className="text-esg-accent hover:underline">
                          {company.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{company.sector}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-esg-accent font-semibold">{company.tci_score.toFixed(1)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-esg-warning font-semibold">
                          {watchlist?.[idx]?.risk_premium?.toFixed(2) || "0.00"}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button size="sm" variant="outline" className="text-xs bg-transparent">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No companies in your watchlist. Add companies from the dashboard.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Available Companies */}
        <div className="mt-8 esg-card-bg rounded-[10px] p-6 border border-esg-success/10">
          <h2 className="text-xl font-bold text-esg-accent mb-4">Available Companies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCompanies?.map((company: any) => {
              const isInWatchlist = portfolioCompanies.some((c: any) => c.id === company.id)
              return (
                <div
                  key={company.id}
                  className="p-4 border border-esg-accent/20 rounded-lg hover:border-esg-accent/40 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{company.name}</h3>
                      <p className="text-xs text-muted-foreground">{company.sector}</p>
                    </div>
                    <span className="text-sm font-bold text-esg-accent">{company.ticker}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-muted-foreground">TCI: {company.tci_score.toFixed(1)}</span>
                    <Button size="sm" variant={isInWatchlist ? "default" : "outline"} className="text-xs">
                      {isInWatchlist ? "✓ Added" : "+ Add"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
