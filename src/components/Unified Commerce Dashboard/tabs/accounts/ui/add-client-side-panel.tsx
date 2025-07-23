"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
// Define the cadence options
const CADENCE_OPTIONS = [
  "LeadEngagement",
  "NewClientOnboarding",
  "RenewalPush",
  "StandardNurture",
  "ReEngagement",
]

// Define other common options
const PRIORITY_OPTIONS = ["Low", "Medium", "High"]
const STATUS_OPTIONS = ["Active", "Inactive", "Pending", "Suspended"]

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
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form data when customer changes or when creating new
// In DynamicFormSidePanel, update the useEffect:
useEffect(() => {
  if (customer) {
    setFormData(customer)
  } else {
    const initialData = fields.reduce((acc, field) => {
      if (field.name === 'currentCadenceName' || field.name === 'current_cadence_name') {
        acc['current_cadence_name'] = field.defaultValue || ""
        acc['currentCadenceName'] = field.defaultValue || ""
      } else if (field.name === 'nextContactDate' || field.name === 'next_contact_date') {
        acc['next_contact_date'] = field.defaultValue || ""
        acc['nextContactDate'] = field.defaultValue || ""
      } else {
        acc[field.name] = field.defaultValue || ""
      }
      return acc
    }, {} as Record<string, any>)
    setFormData(initialData)
  }
}, [customer, fields])
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
			// Handle field name mapping for validation
			let fieldValue
			if (field.name === 'currentCadenceName' || field.name === 'current_cadence_name') {
				fieldValue = formData['current_cadence_name'] || formData['currentCadenceName']
			} else if (field.name === 'nextContactDate' || field.name === 'next_contact_date') {
				fieldValue = formData['next_contact_date'] || formData['nextContactDate']
			} else {
				fieldValue = formData[field.name]
			}
			
			if (field.required && !fieldValue) {
				newErrors[field.name] = `${field.label} is required`
			}
			
			if (field.type === "email" && fieldValue) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(fieldValue)) {
					newErrors[field.name] = "Please enter a valid email address"
				}
			}
			
			if (field.type === "phone" && fieldValue) {
				const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
				if (!phoneRegex.test(fieldValue.replace(/\D/g, ""))) {
					newErrors[field.name] = "Please enter a valid phone number"
				}
			}
		})
		
		console.log('Validation errors found:', newErrors)
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

  const handleSubmit = () => {
		console.log('Form submitted, current formData:', formData)
		console.log('Validation errors before submit:', errors)
		
		const isValid = validateForm()
		console.log('Form is valid:', isValid)
		console.log('Validation errors after validate:', errors)
		
		if (isValid) {
			// Map the form data to match database fields
			const mappedData = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				title: formData.title,
				company: formData.company,
				address: formData.address,
				linkedin: formData.linkedin,
				priority: formData.priority,
				status: formData.status,
				segment: formData.segment,
				staff: formData.staff,
				relationshipManager: formData.relationshipManager,
				notes: formData.notes,
				visits: formData.visits ? parseInt(formData.visits) : 0,
				lastVisit: formData.lastVisit,
				expirationDate: formData.expirationDate,
				pricingOption: formData.pricingOption,
				crossRegionalVisit: formData.crossRegionalVisit,
				visitType: formData.visitType,
				bookingMethod: formData.bookingMethod,
				referralType: formData.referralType,
				totalAssetsUnderManagement: formData.totalAssetsUnderManagement,
				recentDealValue: formData.recentDealValue,
				productInterests: formData.productInterests,
				lastReviewDate: formData.lastReviewDate,
				current_cadence_name: formData.current_cadence_name || formData.currentCadenceName,
				next_contact_date: formData.next_contact_date || formData.nextContactDate,
			}
			
			console.log('Mapped data being sent to onSave:', mappedData)
			onSave(mappedData)
		} else {
			console.log('Form validation failed, not saving')
		}
	}
	const getFieldOptions = (field: CustomField) => {
		switch (field.name) {
			case 'currentCadenceName':
			case 'current_cadence_name':
				return CADENCE_OPTIONS
			case 'priority':
				return field.options || PRIORITY_OPTIONS
			case 'status':
				return field.options || STATUS_OPTIONS
			default:
				return field.options || []
		}
	}

  const renderField = (field: CustomField) => {
    const fieldKey = field.name === 'currentCadenceName' ? 'current_cadence_name' : field.name
    const value = formData[fieldKey] || ""
    const hasError = !!errors[field.name]

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "date":
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            className={hasError ? "border-red-500" : ""}
          />
        )

      case "select":
        const options = getFieldOptions(field)
        return (
          <Select 
            value={value || ""} 
            onValueChange={(newValue) => handleFieldChange(fieldKey, newValue)}
          >
            <SelectTrigger className={hasError ? "border-red-500" : ""}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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

      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => handleFieldChange(fieldKey, checked)}
            />
            <Label>{value === true || value === "true" ? "Yes" : "No"}</Label>
          </div>
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className={hasError ? "border-red-500" : ""}
            rows={3}
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
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
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ChevronDoubleRightIcon className="h-5 w-5" />
          </Button>
          {onToggleFullScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullScreen}
              className="h-8 w-8 p-0"
            >
              {isFullScreen ? (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingInIcon className="h-5 w-5" />
              )}
            </Button>
          )}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
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

            {/* Cadence and Automation Section */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">Cadence & Automation</h3>
              <div className="grid gap-4">
                {visibleFields
                  .filter(field => ['currentCadenceName', 'nextContactDate', 'current_cadence_name', 'next_contact_date'].includes(field.name))
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
                  .filter(field => !['name', 'email', 'phone', 'title', 'company', 'currentCadenceName', 'nextContactDate', 'current_cadence_name', 'next_contact_date'].includes(field.name))
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
        </div>
      </div>

      {/* Footer with action buttons */}
      <div className="flex flex-shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-neutral-50 p-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={onClose}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="default"
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
     modal={true} // ← Change to true (or remove since true is default)
  dismissible={true}
    >
      <Drawer.Portal>
        <Drawer.Content
          className={`fixed right-0 top-0 z-50 h-full overflow-hidden bg-neutral-50 shadow-xl outline-none ${
            isFullScreen ? "w-full" : "w-full max-w-2xl"
          }`}
        >
          {renderContent()}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

