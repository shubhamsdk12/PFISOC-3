import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { CompanyGrid } from "@/components/company-grid"
import { Navigation } from "@/components/navigation"
import { ParticleNetwork } from "@/components/particle-network"
import { LiveTicker } from "@/components/live-ticker"

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch companies from Supabase
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("tci_score", { ascending: false })

  if (error) {
    console.error("Error fetching companies:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-esg-dark-bg via-[#1c2541] to-esg-dark-bg">
      <ParticleNetwork />
      <LiveTicker />
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <Navigation />
        </div>
        <CompanyGrid companies={companies || []} />
      </main>
    </div>
  )
}
