"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, X, } from "lucide-react"
import { Drawer } from "vaul"
import { CustomField } from "./column-manager"
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  SignalIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  TagIcon,
  PaperClipIcon,
  InformationCircleIcon,
  LightBulbIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  TrashIcon,
  ChatBubbleLeftIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

interface DynamicFormSidePanelProps {
  fields: CustomField[]
  customer?: Record<string, any>
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, any>) => void
  title?: string
  isFullScreen?: boolean
  onToggleFullScreen?: () => void
}

export default function DynamicFormSidePanel({
  fields,
  customer,
  isOpen,
  onClose,
  onSave,
  title = "Add Customer",
  isFullScreen = false,
  onToggleFullScreen,
}: DynamicFormSidePanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>(
    customer ||
      fields.reduce(
        (acc, field) => {
          acc[field.name] = field.defaultValue || ""
          return acc
        },
        {} as Record<string, any>,
      ),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }

      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Please enter a valid email address"
        }
      }

      if (field.type === "phone" && formData[field.name]) {
        const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
        if (!phoneRegex.test(formData[field.name].replace(/\D/g, ""))) {
          newErrors[field.name] = "Please enter a valid phone number"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
      onClose()
    }
  }

  const renderField = (field: CustomField) => {
    const value = formData[field.name] || ""
    const hasError = !!errors[field.name]

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(newValue) => handleFieldChange(field.name, newValue)}>
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label>{value === true || value === "true" ? "Yes" : "No"}</Label>
          </div>
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
            rows={3}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
          />
        )
    }
  }

  const visibleFields = fields.filter((field) => field.visible).sort((a, b) => a.order - b.order)

  const renderContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-neutral-50 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </Button>
          {onToggleFullScreen && (
            <Button
              variant="default"
              size="sm"
              onClick={onToggleFullScreen}
              className="h-8 w-8 p-0"
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </Button>
          )}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-6">
            {/* Customer Info Section */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Basic Information</h3>
              <div className="grid gap-4">
                {visibleFields
                  .filter(field => ['name', 'email', 'phone', 'title', 'company'].includes(field.name))
                  .map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2">
                        {field.label}
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </Label>
                      {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
                      {renderField(field)}
                      {errors[field.name] && <p className="text-sm text-red-600">{errors[field.name]}</p>}
                    </div>
                  ))}
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Additional Details</h3>
              <div className="grid gap-4">
                {visibleFields
                  .filter(field => !['name', 'email', 'phone', 'title', 'company'].includes(field.name))
                  .map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.name} className="flex items-center gap-2">
                        {field.label}
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </Label>
                      {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
                      {renderField(field)}
                      {errors[field.name] && <p className="text-sm text-red-600">{errors[field.name]}</p>}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer with action buttons */}
      <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-neutral-50 p-4">
        <Button 
          type="button" 
          className="bg-transparent text-black shadow-none hover:bg-slate-100" 
          onClick={onClose}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          className="bg-transparent text-black shadow-none hover:bg-slate-100"
        >
          <Save className="mr-2 h-4 w-4" />
          {customer ? "Update Customer" : "Add Customer"}
        </Button>
      </div>
    </div>
  )

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onClose}
      direction="right"
      modal={false}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={`fixed right-0 top-0 z-50 h-full overflow-hidden bg-neutral-50 outline-none ${
            isFullScreen ? "w-full" : "w-full max-w-2xl"
          }`}
        >
          {renderContent()}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}