"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Edit2 } from "lucide-react"
import type { Customer } from "@/lib/supabase/customer"

interface InlineEditCellProps {
  customer: Customer
  field: string
  value: any
  onSave: (customerId: string, field: string, value: any) => Promise<void>
  type?: "text" | "email" | "phone" | "number" | "date" | "select"
  options?: string[]
}

export default function InlineEditCell({
  customer,
  field,
  value,
  onSave,
  type = "text",
  options = [],
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // When value prop changes from the outside (e.g., data refresh), update the cell
    setEditValue(value ?? "");
  }, [value]);


  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      await onSave(customer.id, field, editValue)
      setIsEditing(false)
    } catch (error) {
      console.error("Failed to save:", error)
      // Reset to original value on error
      setEditValue(value ?? "")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value ?? "")
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const renderDisplayValue = () => {
    if (field === "pricingOption") {
      const colorMap: Record<string, string> = {
        Premium: "bg-purple-100 text-purple-800 border-purple-200",
        Standard: "bg-blue-100 text-blue-800 border-blue-200",
        Basic: "bg-green-100 text-green-800 border-green-200",
        Trial: "bg-yellow-100 text-yellow-800 border-yellow-200",
      }
      return (
        <Badge variant="outline" className={colorMap[value] || "bg-gray-100 text-gray-800 border-gray-200"}>
          {value || "Not Set"}
        </Badge>
      )
    }

    if (field === "status") {
      return (
        <div className={`flex items-center gap-2 ${value === "active" ? "text-green-700" : "text-gray-500"}`}>
          <div className={`h-2 w-2 rounded-full ${value === "active" ? "bg-green-500" : "bg-gray-400"}`} />
          <span className="text-sm font-medium capitalize">{value}</span>
        </div>
      )
    }

    if (field === "lastVisit" || field === "expirationDate") {
      if (!value) return "Never"
      try {
        return new Date(value).toLocaleDateString()
      } catch {
        return value
      }
    }

    return value || "—"
  }

  const renderEditInput = () => {
    if (type === "select") {
      return (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8"
        disabled={isSaving}
      />
    )
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1">{renderEditInput()}</div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-6 w-6 p-0 bg-transparent text-green-600 hover:text-green-700 hover:bg-green-50 shadow-none"
          > 
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-6 w-6 p-0 bg-transparent text-red-600 hover:text-red-700 hover:bg-red-50 shadow-none"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group flex items-center gap-2"
      // REMOVED the onClick from this parent div.
      // Now, clicks on this area will correctly bubble up to the TableRow.
    >
      <div className="flex-1">{renderDisplayValue()}</div>
      <Edit2
        className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // This is VITAL. It prevents the row's onClick from firing.
          setIsEditing(true);   // This now triggers the edit mode as intended.
        }}
      />
    </div>
  )
}