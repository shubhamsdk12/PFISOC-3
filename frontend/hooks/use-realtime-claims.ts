"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Claim {
  id: string
  company_id: string
  claim_text: string
  pillar: string
  status: "Supporting" | "Contradicting" | "Neutral"
  evidence?: string
  confidence: number
  created_at: string
}

export function useRealtimeClaims(companyId: string) {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const fetchAndSubscribe = async () => {
      try {
        // Fetch initial data
        const { data, error: fetchError } = await supabase
          .from("claims")
          .select("*")
          .eq("company_id", companyId)
          .order("created_at", { ascending: false })

        if (fetchError) throw fetchError
        setClaims(data || [])
        setIsLoading(false)

        // Subscribe to real-time updates
        channel = supabase
          .channel(`claims-${companyId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "claims",
              filter: `company_id=eq.${companyId}`,
            },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setClaims((prev) => [payload.new, ...prev])
              } else if (payload.eventType === "UPDATE") {
                setClaims((prev) => prev.map((c) => (c.id === payload.new.id ? payload.new : c)))
              } else if (payload.eventType === "DELETE") {
                setClaims((prev) => prev.filter((c) => c.id !== payload.old.id))
              }
            },
          )
          .subscribe()
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setIsLoading(false)
      }
    }

    fetchAndSubscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [companyId])

  return { claims, isLoading, error }
}
