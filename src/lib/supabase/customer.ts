// Customer interface for the application
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
  status: "active" | "inactive"
  avatar?: string // Optional avatar property for UI components
}

// Optional: Export a type for creating new customers (without auto-generated fields)
export type CreateCustomerInput = Omit<Customer, "id" | "status">

// Optional: Export a type for updating customers (all fields optional except id)
export type UpdateCustomerInput = Partial<Omit<Customer, "id">>