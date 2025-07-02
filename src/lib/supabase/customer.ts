// src/lib/supabase/customer.ts
export interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  lastVisit: string | null
  visits: number
  pricingOption: string | null
  expirationDate: string | null
  staff: string | null
  crossRegionalVisit: string | null
  visitType: string | null
  bookingMethod: string | null
  referralType: string | null
  ai_talking_tips?: string[]
  avatar?: string // Optional avatar property for UI components
  // New fields for detailed view
  title?: string
  company?: string
  address?: string
  linkedin?: string
  priority?: string
  status?: string
  segment?: string
  relationship_manager?: string
  notes?: string
  total_assets_under_management?: number
  recent_deal_value?: number
  product_interests?: string[]
  last_review_date?: string | null
}

// Optional: Export a type for creating new customers (without auto-generated fields)
export type CreateCustomerInput = Omit<Customer, "id" | "status">

// Optional: Export a type for updating customers (all fields optional except id)
export type UpdateCustomerInput = Partial<Omit<Customer, "id">>