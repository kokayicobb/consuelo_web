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

// Default column configuration based on your Customer interface
const defaultColumns: ColumnConfig[] = [
  { id: "name", key: "name", label: "Client Name", visible: true, order: 0, editable: true },
  { id: "email", key: "email", label: "Email", visible: true, order: 1, editable: true },
  { id: "phone", key: "phone", label: "Phone", visible: true, order: 2, editable: true },
  { id: "pricingOption", key: "pricingOption", label: "Pricing Option", visible: true, order: 3, editable: true },
  { id: "visits", key: "visits", label: "Total Visits", visible: true, order: 4, editable: true },
  { id: "lastVisit", key: "lastVisit", label: "Last Visit", visible: true, order: 5, editable: true },
  { id: "staff", key: "staff", label: "Staff", visible: true, order: 6, editable: true },
  { id: "status", key: "status", label: "Status", visible: true, order: 7, editable: true },
  { id: "expirationDate", key: "expirationDate", label: "Expiration Date", visible: false, order: 8, editable: true },
  {
    id: "crossRegionalVisit",
    key: "crossRegionalVisit",
    label: "Cross Regional Visit",
    visible: false,
    order: 9,
    editable: true,
  },
  { id: "visitType", key: "visitType", label: "Visit Type", visible: false, order: 10, editable: true },
  { id: "bookingMethod", key: "bookingMethod", label: "Booking Method", visible: false, order: 11, editable: true },
  { id: "referralType", key: "referralType", label: "Referral Type", visible: false, order: 12, editable: true },
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
