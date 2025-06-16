import { supabase } from "./client"
import { Customer } from "./customer"

// Database types matching your schema
export interface DatabaseClient {
  "Client ID": string
  Client: string | null
  email: string | null
  phone: string | null
  "Last Visit": string | null
  "# Visits": number | null
  "Pricing Option": string | null
  "Expiration Date": string | null
  Staff: string | null
  "Cross Regional Visit": string | null
  "Visit Type": string | null
  "Booking Method": string | null
  "Referral Type": string | null
}

// Transform database row to our Customer interface
export function transformDatabaseClient(dbClient: DatabaseClient): Customer {
  const today = new Date()
  const expirationDate = dbClient["Expiration Date"] ? new Date(dbClient["Expiration Date"]) : null
  const isActive = !expirationDate || expirationDate > today

  return {
    id: dbClient["Client ID"],
    name: dbClient["Client"] || "Unknown Client",
    email: dbClient.email,
    phone: dbClient.phone,
    lastVisit: dbClient["Last Visit"],
    visits: dbClient["# Visits"] || 0,
    pricingOption: dbClient["Pricing Option"],
    expirationDate: dbClient["Expiration Date"],
    staff: dbClient["Staff"],
    crossRegionalVisit: dbClient["Cross Regional Visit"],
    visitType: dbClient["Visit Type"],
    bookingMethod: dbClient["Booking Method"],
    referralType: dbClient["Referral Type"],
    status: isActive ? "active" : "inactive",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dbClient["Client"] || "Unknown")}&background=random`, // Generate avatar from name
  }
}

// Fetch all clients from Supabase
export async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from("clients") // Changed from "otf-clients" to "clients"
      .select("*")
      .order("Last Visit", { ascending: false, nullsFirst: false })

    if (error) {
      console.error("Error fetching clients:", error)
      throw error
    }

    return data?.map(transformDatabaseClient) || []
  } catch (error) {
    console.error("Failed to fetch clients:", error)
    throw error
  }
}

// Fetch a single client by ID
export async function fetchClientById(clientId: string) {
  try {
    const { data, error } = await supabase.from("clients").select("*").eq("Client ID", clientId).single()

    if (error) {
      console.error("Error fetching client:", error)
      throw error
    }

    return data ? transformDatabaseClient(data) : null
  } catch (error) {
    console.error("Failed to fetch client:", error)
    throw error
  }
}

// Update a client
export async function updateClient(clientId: string, updates: Partial<DatabaseClient>) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .update(updates)
      .eq("Client ID", clientId)
      .select()
      .single()

    if (error) {
      console.error("Error updating client:", error)
      throw error
    }

    return data ? transformDatabaseClient(data) : null
  } catch (error) {
    console.error("Failed to update client:", error)
    throw error
  }
}

// Create a new client
export async function createClient(clientData: Omit<DatabaseClient, "Client ID">) {
  try {
    const { data, error } = await supabase.from("clients").insert([clientData]).select().single()

    if (error) {
      console.error("Error creating client:", error)
      throw error
    }

    return data ? transformDatabaseClient(data) : null
  } catch (error) {
    console.error("Failed to create client:", error)
    throw error
  }
}

// Delete a client
export async function deleteClient(clientId: string) {
  try {
    const { error } = await supabase.from("clients").delete().eq("Client ID", clientId)

    if (error) {
      console.error("Error deleting client:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Failed to delete client:", error)
    throw error
  }
}

// Search clients
export async function searchClients(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .or(`Client.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order("Last Visit", { ascending: false, nullsFirst: false })

    if (error) {
      console.error("Error searching clients:", error)
      throw error
    }

    return data?.map(transformDatabaseClient) || []
  } catch (error) {
    console.error("Failed to search clients:", error)
    throw error
  }
}

// Export clients data as CSV
export function exportClientsToCSV(clients: Customer[]) {
  const headers = [
    "Client ID",
    "Name",
    "Email",
    "Phone",
    "Last Visit",
    "Total Visits",
    "Pricing Option",
    "Expiration Date",
    "Staff",
    "Status",
    "Visit Type",
    "Booking Method",
    "Referral Type",
  ]

  const csvContent = [
    headers.join(","),
    ...clients.map((client) =>
      [
        client.id,
        `"${client.name}"`,
        client.email || "",
        client.phone || "",
        client.lastVisit || "",
        client.visits,
        client.pricingOption || "",
        client.expirationDate || "",
        client.staff || "",
        client.status,
        client.visitType || "",
        client.bookingMethod || "",
        client.referralType || "",
      ].join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `clients-export-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}