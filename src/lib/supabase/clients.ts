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
  created_at?: string | null
  updated_at?: string | null
  title?: string | null
  company?: string | null
  address?: string | null
  linkedin?: string | null
  priority?: string | null
  status?: string | null
  segment?: string | null
  relationship_manager?: string | null
  notes?: string | null
  total_assets_under_management?: number | null
  recent_deal_value?: number | null
  product_interests?: string[] | null
  last_review_date?: string | null
  
  // --- ADDED THESE FIELDS ---
  current_cadence_name?: string | null
  last_contact_date?: string | null
  next_contact_date?: string | null
  total_messages_count?: number | null
}


// Transform database row to our Customer interface
export function transformDatabaseClient(dbClient: DatabaseClient): Customer {
  // Use the status from the database if it exists, otherwise fall back to expiration date logic
  const getStatus = () => {
    if (dbClient.status) {
      return dbClient.status
    }
    const today = new Date()
    const expirationDate = dbClient["Expiration Date"] ? new Date(dbClient["Expiration Date"]) : null
    return !expirationDate || expirationDate > today ? "active" : "inactive"
  }

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
    status: getStatus(), // Use the new logic
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dbClient["Client"] || "Unknown")}&background=random`,
    title: dbClient.title,
    company: dbClient.company,
    address: dbClient.address,
    linkedin: dbClient.linkedin,
    priority: dbClient.priority,
    segment: dbClient.segment,
    relationship_manager: dbClient.relationship_manager,
    notes: dbClient.notes,
    total_assets_under_management: dbClient.total_assets_under_management,
    recent_deal_value: dbClient.recent_deal_value,
    product_interests: dbClient.product_interests,
    last_review_date: dbClient.last_review_date,

    // --- MAPPED THE NEW FIELDS HERE ---
    current_cadence_name: dbClient.current_cadence_name || null,
    last_contact_date: dbClient.last_contact_date || null,
    next_contact_date: dbClient.next_contact_date || null,
    total_messages_count: dbClient.total_messages_count || 0,
  }
}

// Fetch all clients from Supabase
export async function fetchClients() {
  try {
    const { data, error } = await supabase
      .from("clients")
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
export async function updateClient(clientId: string, updates: Partial<DatabaseClient>, supabaseClient: any) {
  try {
    const { data, error } = await supabaseClient
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
// Update your createClient function:
export async function createClient(clientData: Omit<DatabaseClient, "Client ID">, supabaseClient: any) {
  try {
    // Remove the columns parameter - just use insert with select
    const { data, error } = await supabaseClient
      .from("clients")
      .insert([clientData])
      .select() // This is all you need
      .single()

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
export async function deleteClient(clientId: string, supabaseClient: any) {
  try {
    const { error } = await supabaseClient.from("clients").delete().eq("Client ID", clientId)

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
export async function searchClients(searchTerm: string, supabaseClient: any) {
  try {
    const { data, error } = await supabaseClient
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
    "Client ID", "Name", "Email", "Phone", "Status",
    "Current Cadence", "Last Contact", "Next Contact", "Messages Sent", "Expiration Date",
    "Last Visit", "Total Visits", "Pricing Option", "Staff", "Visit Type",
    "Booking Method", "Referral Type",
  ];

  const csvContent = [
    headers.join(","),
    ...clients.map((client) =>
      [
        client.id,
        `"${client.name}"`,
        client.email || "",
        client.phone || "",
        client.status,
        client.current_cadence_name || "",
        client.last_contact_date || "",
        client.next_contact_date || "",
        client.total_messages_count || 0,
        client.expirationDate || "",
        client.lastVisit || "",
        client.visits,
        client.pricingOption || "",
        client.staff || "",
        client.visitType || "",
        client.bookingMethod || "",
        client.referralType || "",
      ].join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `clients-export-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}