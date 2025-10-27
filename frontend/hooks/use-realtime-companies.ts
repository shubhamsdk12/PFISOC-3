"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Company {
  id: string
  name: string
  ticker: string
  sector: string
  tci_score: number
  environment_score: number
  social_score: number
  governance_score: number
  fairness_score: number
  confidence_level: number
  last_updated: string
}

export function useRealtimeCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const fetchAndSubscribe = async () => {
      try {
        // Fetch initial data
        const { data, error: fetchError } = await supabase
          .from("companies")
          .select("*")
          .order("tci_score", { ascending: false })

        if (fetchError) throw fetchError
        setCompanies(data || [])
        setIsLoading(false)

        // Subscribe to real-time updates
        channel = supabase
          .channel("companies-changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "companies",
            },
            (payload) => {
              if (payload.eventType === "UPDATE") {
                setCompanies((prev) =>
                  prev
                    .map((c) => (c.id === payload.new.id ? payload.new : c))
                    .sort((a, b) => b.tci_score - a.tci_score),
                )
              } else if (payload.eventType === "INSERT") {
                setCompanies((prev) => [...prev, payload.new].sort((a, b) => b.tci_score - a.tci_score))
              } else if (payload.eventType === "DELETE") {
                setCompanies((prev) => prev.filter((c) => c.id !== payload.old.id))
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
  }, [])

  return { companies, isLoading, error }
}
