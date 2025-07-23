// src/hooks/use-clients.ts
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "@clerk/nextjs"
import { Customer } from "@/lib/supabase/customer"
import { createClerkSupabaseClient } from "@/lib/supabase/client"
import { transformDatabaseClient, DatabaseClient } from "@/lib/supabase/clients"

export function useClients() {
  const { session, isLoaded } = useSession()
  const [clients, setClients] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasLoadedRef = useRef(false) // Track if we've loaded data already
  const lastFetchRef = useRef(0) // Track last fetch time

  const loadClients = useCallback(async (force = false) => {
    // Wait for Clerk to load
    if (!isLoaded) return
    
    // If no session, user is not authenticated
    if (!session) {
      setError("Please sign in to view clients")
      setLoading(false)
      return
    }

    // Only prevent refetches if we have data AND it's not forced AND it's recent
    const now = Date.now()
    if (!force && hasLoadedRef.current && clients.length > 0 && (now - lastFetchRef.current) < 30000) {
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
      hasLoadedRef.current = true
      lastFetchRef.current = now
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients")
      console.error("Error loading clients:", err)
    } finally {
      setLoading(false)
    }
  }, [isLoaded, session, clients.length]) // Fixed dependencies

  useEffect(() => {
    // Always try to load on mount if we have session
    if (isLoaded && session?.user?.id) {
      loadClients()
    }
  }, [isLoaded, session?.user?.id, loadClients]) // Added loadClients back to dependencies

  const refreshClients = useCallback(() => {
    loadClients(true) // Force refresh
  }, [loadClients])

  return {
    clients,
    loading,
    error,
    refreshClients,
  }
}