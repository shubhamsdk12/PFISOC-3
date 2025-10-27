"use client"

import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [mode, setMode] = useState<"investor" | "regulator">("investor")
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="glass-card-dark border-b border-esg-accent/20 bg-gradient-to-r from-esg-card-bg/80 via-esg-dark-bg/80 to-esg-card-bg/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold esg-text-green">ESG Credibility Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time sustainability claim verification</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 rounded-xl bg-esg-card-bg/50 p-1 border border-esg-accent/20">
            <button
              onClick={() => setMode("investor")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                mode === "investor"
                  ? "bg-gradient-to-r from-esg-accent to-esg-accent text-black font-semibold shadow-lg shadow-emerald-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Investor View
            </button>
            <button
              onClick={() => setMode("regulator")}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                mode === "regulator"
                  ? "bg-gradient-to-r from-esg-secondary to-esg-secondary text-black font-semibold shadow-lg shadow-cyan-500/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Regulator View
            </button>
          </div>

          <div className="flex items-center gap-3 border-l border-esg-accent/20 pl-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{mode} Mode</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
