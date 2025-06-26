"use client"

import { useState, useEffect } from "react"

export interface ColumnConfig {
  id: string
  key: string
  label: string
  visible: boolean
  order: number
  width?: number
  editable: boolean
}

// Updated column configuration for CRM/Banking context
// Updated column configuration for CRM/Banking context
const defaultColumns: ColumnConfig[] = [
  // Core contact information (always visible)
  { id: "name", key: "name", label: "Client Name", visible: true, order: 0, width: 250, editable: true },
  { id: "email", key: "email", label: "Email", visible: true, order: 1, width: 200, editable: true },
  { id: "phone", key: "phone", label: "Phone", visible: true, order: 2, width: 150, editable: true },
  
  // Professional information
  { id: "company", key: "company", label: "Company", visible: true, order: 5, width: 200, editable: true },
  { id: "title", key: "title", label: "Title", visible: true, order: 3, width: 150, editable: true },
  
  // CRM management fields
  { id: "priority", key: "priority", label: "Priority", visible: true, order: 6, editable: true, width: 200 },
  { id: "status", key: "status", label: "Status", visible: true, order: 7, editable: true, width: 200 },
  { id: "segment", key: "segment", label: "Cohort", visible: true, order: 4, editable: true, width: 200 },
  { id: "relationshipManager", key: "relationshipManager", label: "Relationship Manager", visible: true, order: 8, editable: true, width: 200 },
  
  // Financial information
  { id: "totalAssetsUnderManagement", key: "total_assets_under_management", label: "Total AUM", visible: true, order: 9, editable: true, width: 200 },
  { id: "recentDealValue", key: "recent_deal_value", label: "Recent Deal Value", visible: true, order: 10, editable: true, width: 200 },
  { id: "productInterests", key: "product_interests", label: "Product Interests", visible: true, order: 11, editable: true, width: 200 },
  
  // Visit/interaction tracking (using actual database column names)
  { id: "visits", key: "# Visits", label: "Total Interactions", visible: true, order: 12, editable: true, width: 200 },
  { id: "lastVisit", key: "Last Visit", label: "Last Interaction", visible: true, order: 13, editable: true, width: 200 },
  { id: "lastReviewDate", key: "last_review_date", label: "Last Review", visible: true, order: 14, editable: true, width: 200 },
  
  // Additional contact info
  { id: "address", key: "address", label: "Address", visible: false, order: 15, editable: true, width: 200 },
  { id: "linkedin", key: "linkedin", label: "LinkedIn", visible: true, order: 16, editable: true, width: 200 },
  
  // Service details (using actual database column names)
  { id: "pricingOption", key: "Pricing Option", label: "Service Tier", visible: false, order: 17, editable: true, width: 200 },
  { id: "staff", key: "Staff", label: "Assigned Staff", visible: false, order: 18, editable: true, width: 200 },
  { id: "expirationDate", key: "Expiration Date", label: "Contract Expiration", visible: false, order: 19, editable: true, width: 200 },
  { id: "crossRegionalVisit", key: "Cross Regional Visit", label: "Cross Regional", visible: false, order: 20, editable: true , width: 200},
  { id: "visitType", key: "Visit Type", label: "Interaction Type", visible: false, order: 21, editable: true , width: 200},
  { id: "bookingMethod", key: "Booking Method", label: "Contact Method", visible: false, order: 22, editable: true, width: 200 },
  { id: "referralType", key: "Referral Type", label: "Referral Source", visible: false, order: 23, editable: true, width: 200 },
  { id: "notes", key: "notes", label: "Notes", visible: false, order: 24, editable: true, width: 200 },
]

export function useColumnConfig() {
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load saved configuration from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("customer-table-columns")
    if (saved) {
      try {
        const parsedColumns = JSON.parse(saved)
        setColumns(parsedColumns)
      } catch (error) {
        console.error("Failed to load column configuration:", error)
      }
    }
  }, [])

  const updateColumns = (newColumns: ColumnConfig[]) => {
    setColumns(newColumns)
    setHasUnsavedChanges(true)
  }

  const reorderColumns = (startIndex: number, endIndex: number) => {
    const visibleColumns = columns.filter((col) => col.visible).sort((a, b) => a.order - b.order)
    const result = Array.from(visibleColumns)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)

    // Update order for all columns
    const updatedColumns = columns.map((col) => {
      if (!col.visible) return col
      const newIndex = result.findIndex((c) => c.id === col.id)
      return { ...col, order: newIndex }
    })

    updateColumns(updatedColumns)
  }

  const toggleColumnVisibility = (columnId: string) => {
    const updatedColumns = columns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col))
    updateColumns(updatedColumns)
  }

  const saveConfiguration = () => {
    localStorage.setItem("customer-table-columns", JSON.stringify(columns))
    setHasUnsavedChanges(false)
  }

  const resetConfiguration = () => {
    setColumns(defaultColumns)
    localStorage.removeItem("customer-table-columns")
    setHasUnsavedChanges(false)
  }

  const visibleColumns = columns.filter((col) => col.visible).sort((a, b) => a.order - b.order)

  return {
    columns,
    visibleColumns,
    hasUnsavedChanges,
    updateColumns,
    reorderColumns,
    toggleColumnVisibility,
    saveConfiguration,
    resetConfiguration,
  }
}