"use client"

import { fetchClients } from "@/lib/supabase/clients"
import { Customer } from "@/lib/supabase/customer"
import { useState, useEffect } from "react"


export function useClients() {
  const [clients, setClients] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchClients()
      setClients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients")
      console.error("Error loading clients:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

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
