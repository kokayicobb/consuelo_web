// src/hooks/use-clients.ts
"use client"

import { useState, useEffect } from "react"
import { useSession } from "@clerk/nextjs"
import { Customer } from "@/lib/supabase/customer"
import { createClerkSupabaseClient } from "@/lib/supabase/client"
import { transformDatabaseClient, DatabaseClient } from "@/lib/supabase/clients"

export function useClients() {
  const { session, isLoaded } = useSession()
  const [clients, setClients] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = async () => {
    // Wait for Clerk to load
    if (!isLoaded) return
    
    // If no session, user is not authenticated
    if (!session) {
      setError("Please sign in to view clients")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Get the token and create authenticated Supabase client
      const token = await session.getToken()
      const supabase = createClerkSupabaseClient(token)
      
      // Fetch clients using the authenticated client
      const { data, error: supabaseError } = await supabase
        .from("clients")
        .select("*")
        .order("Last Visit", { ascending: false, nullsFirst: false })

      if (supabaseError) {
        throw supabaseError
      }

      const transformedData = data?.map(transformDatabaseClient) || []
      setClients(transformedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients")
      console.error("Error loading clients:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [isLoaded, session]) // Re-run when session changes

  const refreshClients = () => {
    loadClients()
  }

  return {
    clients,
    loading,
    error,
    refreshClients,
  }
}