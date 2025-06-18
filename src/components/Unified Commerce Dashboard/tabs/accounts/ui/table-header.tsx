"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Playground/components/ui/popover"
import { Checkbox } from "@/components/Playground/components/ui/checkbox"
import {
  Filter,
  ArrowUpDown,
  Zap,
  Search,
  Settings,
  Plus,
  X,
  Save,
  ChevronDown,
  GripVertical,
  Trash2,
  CalendarIcon,
  UserCheck,
} from "lucide-react"
import { format } from "date-fns"

interface SortRule {
  id: string
  field: string
  direction: "asc" | "desc"
  label: string
}

interface FilterRule {
  id: string
  field: string
  operator: string
  value: string | number | Date | string[]
  label: string
}

interface PermanentRule {
  id: string
  field: string
  operator: string
  value: string | number | Date
  label: string
  type: "filter" | "sort"
}

interface DataHeaderProps {
  // Search
  searchTerm: string
  onSearchChange: (value: string) => void

  // Active filters and sorts
  activeFilters: FilterRule[]
  onFiltersChange: (filters: FilterRule[]) => void
  activeSorts: SortRule[]
  onSortsChange: (sorts: SortRule[]) => void
  permanentRules: PermanentRule[]
  onPermanentRulesChange: (rules: PermanentRule[]) => void

  // Column props
  columns: Array<{
    id: string
    label: string
    visible: boolean
  }>
  onToggleColumnVisibility: (id: string) => void
  hasUnsavedChanges: boolean
  onSaveConfiguration: () => void
  onResetConfiguration: () => void

  // Selection props
  selectedCount: number
  onClearSelection: () => void

  // Actions
  onAddAccount: () => void
  onShowActiveOnly: () => void

  // Data for filter options
  availableStaff: string[]
  availablePricingOptions: string[]
  availableSegments: string[]
  availableVisitTypes: string[]
  availableBookingMethods: string[]
  availableReferralTypes: string[]
}

export default function DataHeader({
  searchTerm,
  onSearchChange,
  activeFilters,
  onFiltersChange,
  activeSorts,
  onSortsChange,
  permanentRules,
  onPermanentRulesChange,
  columns,
  onToggleColumnVisibility,
  hasUnsavedChanges,
  onSaveConfiguration,
  onResetConfiguration,
  selectedCount,
  onClearSelection,
  onAddAccount,
  onShowActiveOnly,
  availableStaff,
  availablePricingOptions,
  availableSegments,
  availableVisitTypes,
  availableBookingMethods,
  availableReferralTypes,
}: DataHeaderProps) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [showSecondaryRow, setShowSecondaryRow] = useState(false)
  const [activePanel, setActivePanel] = useState<"sort" | "filter" | "rule" | null>(null)
  const [newFilterField, setNewFilterField] = useState("")
  const [newFilterOperator, setNewFilterOperator] = useState("")
  const [newFilterValue, setNewFilterValue] = useState<string | number | Date>("")
  const [activeTab, setActiveTab] = useState<"leads" | "clients">("clients")
  const [currentUser, setCurrentUser] = useState("Current User") // This should come from auth
  
  // Refs for dropdown positioning
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const ruleDropdownRef = useRef<HTMLDivElement>(null)

  // Database field definitions
  const sortableFields = [
    { field: "Client", label: "Client Name", type: "text" },
    { field: "email", label: "Email", type: "text" },
    { field: "phone", label: "Phone", type: "text" },
    { field: "Last Visit", label: "Last Visit", type: "date" },
    { field: "# Visits", label: "Number of Visits", type: "number" },
    { field: "Pricing Option", label: "Pricing Option", type: "text" },
    { field: "Expiration Date", label: "Expiration Date", type: "date" },
    { field: "Staff", label: "Staff", type: "text" },
    { field: "status", label: "Status", type: "text" },
    { field: "priority", label: "Priority", type: "text" },
    { field: "segment", label: "Segment", type: "text" },
    { field: "relationship_manager", label: "Relationship Manager", type: "text" },
    { field: "total_assets_under_management", label: "Total AUM", type: "number" },
    { field: "recent_deal_value", label: "Recent Deal Value", type: "number" },
    { field: "last_review_date", label: "Last Review Date", type: "date" },
    { field: "created_at", label: "Created Date", type: "date" },
    { field: "updated_at", label: "Updated Date", type: "date" },
  ]

  const filterableFields = [
    { field: "Client", label: "Client Name", type: "text" },
    { field: "email", label: "Email", type: "text" },
    { field: "phone", label: "Phone", type: "text" },
    { field: "Pricing Option", label: "Pricing Option", type: "select", options: availablePricingOptions },
    { field: "Staff", label: "Staff", type: "select", options: availableStaff },
    { field: "status", label: "Status", type: "select", options: ["active", "inactive"] },
    { field: "priority", label: "Priority", type: "select", options: ["high", "medium", "low"] },
    { field: "segment", label: "Segment", type: "select", options: availableSegments },
    { field: "relationship_manager", label: "Relationship Manager", type: "select", options: availableStaff },
    { field: "Visit Type", label: "Visit Type", type: "select", options: availableVisitTypes },
    { field: "Booking Method", label: "Booking Method", type: "select", options: availableBookingMethods },
    { field: "Referral Type", label: "Referral Type", type: "select", options: availableReferralTypes },
    { field: "# Visits", label: "Number of Visits", type: "number" },
    { field: "total_assets_under_management", label: "Total AUM", type: "number" },
    { field: "recent_deal_value", label: "Recent Deal Value", type: "number" },
    { field: "Last Visit", label: "Last Visit", type: "date" },
    { field: "Expiration Date", label: "Expiration Date", type: "date" },
    { field: "last_review_date", label: "Last Review Date", type: "date" },
  ]

  const getOperatorsForType = (type: string) => {
    switch (type) {
      case "text":
        return [
          { value: "equals", label: "Equals" },
          { value: "contains", label: "Contains" },
          { value: "starts_with", label: "Starts with" },
          { value: "ends_with", label: "Ends with" },
          { value: "not_equals", label: "Does not equal" },
          { value: "is_empty", label: "Is empty" },
          { value: "is_not_empty", label: "Is not empty" },
        ]
      case "number":
        return [
          { value: "equals", label: "Equals" },
          { value: "greater_than", label: "Greater than" },
          { value: "less_than", label: "Less than" },
          { value: "greater_than_or_equal", label: "Greater than or equal" },
          { value: "less_than_or_equal", label: "Less than or equal" },
          { value: "not_equals", label: "Does not equal" },
          { value: "is_empty", label: "Is empty" },
          { value: "is_not_empty", label: "Is not empty" },
        ]
      case "date":
        return [
          { value: "equals", label: "Is" },
          { value: "before", label: "Is before" },
          { value: "after", label: "Is after" },
          { value: "on_or_before", label: "Is on or before" },
          { value: "on_or_after", label: "Is on or after" },
          { value: "is_empty", label: "Is empty" },
          { value: "is_not_empty", label: "Is not empty" },
        ]
      case "select":
        return [
          { value: "equals", label: "Is" },
          { value: "not_equals", label: "Is not" },
          { value: "is_empty", label: "Is empty" },
          { value: "is_not_empty", label: "Is not empty" },
        ]
      default:
        return [{ value: "equals", label: "Equals" }]
    }
  }

  // Memoize the filter update function to prevent useEffect dependency issues
  const updateTabFilter = useCallback(() => {
    const tabFilter: FilterRule = {
      id: "tab-filter",
      field: "segment",
      operator: activeTab === "leads" ? "contains" : "not_contains",
      value: ["lead", "prospect", "potential"],
      label: activeTab === "leads" ? "Leads" : "Clients"
    }
    
    // Update filters based on tab
    const otherFilters = activeFilters.filter(f => f.id !== "tab-filter")
    onFiltersChange([...otherFilters, tabFilter])
  }, [activeTab, activeFilters, onFiltersChange])

  // Apply tab-based filtering
  useCallback(() => {
    updateTabFilter()
  }, [updateTabFilter])

  const handleSortClick = () => {
    if (activePanel === "sort") {
      setActivePanel(null)
      setShowSecondaryRow(false)
    } else {
      setShowSecondaryRow(true)
      setActivePanel("sort")
    }
  }

  const handleFilterClick = () => {
    if (activePanel === "filter") {
      setActivePanel(null)
      setShowSecondaryRow(false)
    } else {
      setShowSecondaryRow(true)
      setActivePanel("filter")
    }
  }

  const addSortRule = () => {
    const newSort: SortRule = {
      id: Date.now().toString(),
      field: "Client",
      direction: "asc",
      label: "Client Name",
    }
    onSortsChange([...activeSorts, newSort])
  }

  const removeSortRule = (id: string) => {
    onSortsChange(activeSorts.filter((rule) => rule.id !== id))
  }

  const updateSortRule = (id: string, field: string, direction: "asc" | "desc") => {
    const fieldInfo = sortableFields.find((f) => f.field === field)
    onSortsChange(
      activeSorts.map((rule) =>
        rule.id === id ? { ...rule, field, direction, label: fieldInfo?.label || field } : rule,
      ),
    )
  }

  const addFilterFromBuilder = () => {
    if (!newFilterField || !newFilterOperator) return

    const fieldInfo = filterableFields.find((f) => f.field === newFilterField)
    const operatorInfo = getOperatorsForType(fieldInfo?.type || "text").find((o) => o.value === newFilterOperator)

    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field: newFilterField,
      operator: newFilterOperator,
      value: newFilterValue,
      label: `${fieldInfo?.label}: ${operatorInfo?.label} ${newFilterValue}`,
    }

    onFiltersChange([...activeFilters, newFilter])

    // Reset builder
    setNewFilterField("")
    setNewFilterOperator("")
    setNewFilterValue("")
    setActivePanel(null)
    setShowSecondaryRow(false)
  }

  const removeFilterRule = (id: string) => {
    onFiltersChange(activeFilters.filter((rule) => rule.id !== id))
  }

  const addAssignedToMeFilter = () => {
    const newFilter: FilterRule = {
      id: Date.now().toString(),
      field: "Staff",
      operator: "equals",
      value: currentUser,
      label: `Assigned to: ${currentUser}`,
    }
    onFiltersChange([...activeFilters, newFilter])
  }

  const addPermanentFilterRule = (field: string, operator: string, value: any) => {
    const fieldInfo = filterableFields.find((f) => f.field === field)
    const operatorInfo = getOperatorsForType(fieldInfo?.type || "text").find((o) => o.value === operator)
    
    const newRule: PermanentRule = {
      id: Date.now().toString(),
      field,
      operator,
      value,
      label: `${fieldInfo?.label}: ${operatorInfo?.label} ${value}`,
      type: "filter"
    }
    
    onPermanentRulesChange([...permanentRules, newRule])
  }

  const addPermanentSortRule = (field: string, direction: "asc" | "desc") => {
    const fieldInfo = sortableFields.find((f) => f.field === field)
    
    const newRule: PermanentRule = {
      id: Date.now().toString(),
      field,
      operator: direction,
      value: "",
      label: `${fieldInfo?.label} (${direction === "asc" ? "Ascending" : "Descending"})`,
      type: "sort"
    }
    
    onPermanentRulesChange([...permanentRules, newRule])
  }

  const renderFilterValueInput = () => {
    const fieldInfo = filterableFields.find((f) => f.field === newFilterField)
    if (!fieldInfo) return null

    const needsValue = !["is_empty", "is_not_empty"].includes(newFilterOperator)
    if (!needsValue) return null

    switch (fieldInfo.type) {
      case "select":
        return (
          <Select value={newFilterValue as string} onValueChange={setNewFilterValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <ScrollArea className="h-[200px]">
                {fieldInfo.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </ScrollArea>
            </SelectContent>
          </Select>
        )
      case "number":
        return (
          <Input
            type="number"
            value={newFilterValue as string}
            onChange={(e) => setNewFilterValue(Number(e.target.value))}
            placeholder="Enter number"
          />
        )
      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newFilterValue ? format(newFilterValue as Date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={newFilterValue as Date}
                onSelect={(date) => setNewFilterValue(date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )
      default:
        return (
          <Input
            value={newFilterValue as string}
            onChange={(e) => setNewFilterValue(e.target.value)}
            placeholder="Enter value"
          />
        )
    }
  }

  return (
    <div className="border-b bg-white">
      {/* Main header row */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left side - Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-gray-900">Account Directory</h1>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-1">
          {/* Selection indicator */}
          {selectedCount > 0 && (
            <div className="mr-2 flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-2 py-1">
              <span className="text-xs font-medium text-blue-700">{selectedCount} selected</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                className="h-4 w-4 p-0 text-blue-700 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Unsaved changes indicator */}
          {hasUnsavedChanges && (
            <div className="mr-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1">
              <span className="text-xs font-medium text-amber-700">Unsaved changes</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={onSaveConfiguration}
                className="h-4 w-4 p-0 text-amber-700 hover:bg-amber-100"
              >
                <Save className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Filter button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFilterClick}
            className={`h-8 w-8 rounded-full p-0 ${activePanel === "filter" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Sort button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSortClick}
            className={`h-8 w-8 rounded-full p-0 ${activePanel === "sort" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {/* Zap button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
            title="Consuelo Zap"
          >
            <Zap className="h-4 w-4" />
          </Button>

          {/* Search dialog */}
          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100">
                <Search className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Search accounts</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search by name, email, phone, or staff..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSearchDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setSearchDialogOpen(false)}>Search</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-h-[90vh]" side="bottom">
              <ScrollArea className="h-full max-h-[calc(90vh-2rem)]">
                <DropdownMenuLabel>Table settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Column visibility section */}
                <div className="p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Column visibility</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={onResetConfiguration} className="h-6 px-2 text-xs">
                        Reset
                      </Button>
                      <Button variant="ghost" size="sm" onClick={onSaveConfiguration} className="h-6 px-2 text-xs">
                        Save
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-2 gap-2">
                      {columns.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={column.id}
                            checked={column.visible}
                            onCheckedChange={() => onToggleColumnVisibility(column.id)}
                          />
                          <label htmlFor={column.id} className="cursor-pointer text-xs font-medium">
                            {column.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <DropdownMenuSeparator />

                {/* Permanent Filters section */}
                <DropdownMenuLabel>Permanent Filters</DropdownMenuLabel>
                <div className="p-3 space-y-2">
                  <ScrollArea className="h-32">
                    {permanentRules.filter(r => r.type === "filter").map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-xs">{rule.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onPermanentRulesChange(permanentRules.filter((r) => r.id !== rule.id))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                        <Plus className="mr-1 h-3 w-3" />
                        Add permanent filter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Permanent Filter</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select onValueChange={(value) => {
                          const [field, operator, val] = value.split('|')
                          addPermanentFilterRule(field, operator, val)
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a filter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="status|equals|active">Active accounts only</SelectItem>
                            <SelectItem value="priority|equals|high">High priority only</SelectItem>
                            <SelectItem value="Staff|equals|Me">Assigned to me</SelectItem>
                            <SelectItem value="# Visits|greater_than|5">More than 5 visits</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <DropdownMenuSeparator />

                {/* Permanent Sorts section */}
                <DropdownMenuLabel>Permanent Sorts</DropdownMenuLabel>
                <div className="p-3 space-y-2">
                  <ScrollArea className="h-32">
                    {permanentRules.filter(r => r.type === "sort").map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-xs">{rule.label}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onPermanentRulesChange(permanentRules.filter((r) => r.id !== rule.id))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                        <Plus className="mr-1 h-3 w-3" />
                        Add permanent sort
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Permanent Sort</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Select onValueChange={(value) => {
                          const [field, direction] = value.split('|')
                          addPermanentSortRule(field, direction as "asc" | "desc")
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sort" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Last Visit|desc">Last Visit (Newest first)</SelectItem>
                            <SelectItem value="Client|asc">Client Name (A-Z)</SelectItem>
                            <SelectItem value="# Visits|desc">Number of Visits (High to Low)</SelectItem>
                            <SelectItem value="priority|asc">Priority (High to Low)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <DropdownMenuSeparator />

                {/* Additional Settings */}
                <DropdownMenuLabel>Display Settings</DropdownMenuLabel>
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact-mode" className="text-xs">Compact mode</Label>
                    <Switch id="compact-mode" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-avatars" className="text-xs">Show avatars</Label>
                    <Switch id="show-avatars" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlight-overdue" className="text-xs">Highlight overdue</Label>
                    <Switch id="highlight-overdue" defaultChecked />
                  </div>
                </div>
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* New button */}
          <Button
            onClick={onAddAccount}
            size="sm"
            className="h-8 bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 rounded-md"
          >
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>
      </div>

      {/* Tab row */}
      <div className="px-6 pb-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("clients")}
            className={`h-7 rounded-full px-4 text-sm font-medium ${
              activeTab === "clients" 
                ? "bg-gray-100 text-gray-700" 
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            Clients
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("leads")}
            className={`h-7 rounded-full px-4 text-sm font-medium ${
              activeTab === "leads" 
                ? "bg-gray-100 text-gray-700" 
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            Leads
          </Button>
        </div>
      </div>

      {/* Secondary controls row */}
      {showSecondaryRow && (
        <div className="relative border-t bg-gray-50 px-6 py-3">
          <div className="flex items-center gap-2">
            {/* Sort controls */}
            {activeSorts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(activePanel === "sort" ? null : "sort")}
                className={`h-7 rounded-md px-3 text-sm font-medium ${activePanel === "sort" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                <ArrowUpDown className="mr-1 h-3 w-3" />
                {activeSorts.length} sort{activeSorts.length > 1 ? "s" : ""}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            )}

            {/* Permanent rules indicator */}
            {permanentRules.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(activePanel === "rule" ? null : "rule")}
                className={`h-7 rounded-md px-3 text-sm font-medium ${activePanel === "rule" ? "bg-blue-100 text-blue-600" : "bg-white text-gray-700 hover:bg-gray-100"}`}
              >
                {permanentRules.filter(r => r.type === "filter").length} permanent filter{permanentRules.filter(r => r.type === "filter").length !== 1 ? "s" : ""},
                {permanentRules.filter(r => r.type === "sort").length} sort{permanentRules.filter(r => r.type === "sort").length !== 1 ? "s" : ""}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            )}

            {/* Dynamic filters */}
            {activeFilters.filter(f => f.id !== "tab-filter").map((filter) => (
              <Button
                key={filter.id}
                variant="ghost"
                size="sm"
                className="h-7 rounded-md bg-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                {filter.label}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFilterRule(filter.id)
                  }}
                />
              </Button>
            ))}

            {/* Quick filter buttons */}
            <Button
              variant="ghost"
              size="sm"
              onClick={addAssignedToMeFilter}
              className="h-7 rounded-md px-3 text-sm font-medium text-gray-500 hover:bg-gray-100"
            >
              <UserCheck className="mr-1 h-3 w-3" />
              Assigned to me
            </Button>

            {/* Add filter button */}
            {activeFilters.filter(f => f.id !== "tab-filter").length < 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(activePanel === "filter" ? null : "filter")}
                className="h-7 rounded-md px-3 text-sm font-medium text-gray-500 hover:bg-gray-100"
              >
                <Plus className="mr-1 h-3 w-3" />
                Filter
              </Button>
            )}
          </div>

          {/* Dropdown panels */}
          {activePanel === "sort" && (
            <div className="absolute left-6 z-50 mt-2" style={{ top: '100%' }} ref={sortDropdownRef}>
              <Card className="w-96 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sort by</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ScrollArea className="h-[200px]">
                    {activeSorts.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-2 mb-3">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Select
                          value={rule.field}
                          onValueChange={(value) => updateSortRule(rule.id, value, rule.direction)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom">
                            <ScrollArea className="h-[200px]">
                              {sortableFields.map((option) => (
                                <SelectItem key={option.field} value={option.field}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <Select
                          value={rule.direction}
                          onValueChange={(value: "asc" | "desc") => updateSortRule(rule.id, rule.field, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper" side="bottom">
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSortRule(rule.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={addSortRule} className="text-blue-600 hover:bg-blue-50">
                      <Plus className="mr-1 h-3 w-3" />
                      Add sort
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSortsChange([])}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Clear all
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activePanel === "filter" && (
            <div className="absolute left-6 z-50 mt-2" style={{ top: '100%' }} ref={filterDropdownRef}>
              <Card className="w-96 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Add filter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Field</label>
                    <Select value={newFilterField} onValueChange={setNewFilterField}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent position="popper" side="bottom">
                        <ScrollArea className="h-[200px]">
                          {filterableFields.map((field) => (
                            <SelectItem key={field.field} value={field.field}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  {newFilterField && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Operator</label>
                      <Select value={newFilterOperator} onValueChange={setNewFilterOperator}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent position="popper" side="bottom">
                          <ScrollArea className="h-[150px]">
                            {getOperatorsForType(
                              filterableFields.find((f) => f.field === newFilterField)?.type || "text",
                            ).map((operator) => (
                              <SelectItem key={operator.value} value={operator.value}>
                                {operator.label}
                              </SelectItem>
                            ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newFilterField && newFilterOperator && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Value</label>
                      <div className="mt-1">{renderFilterValueInput()}</div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={addFilterFromBuilder}
                      disabled={!newFilterField || !newFilterOperator}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add filter
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNewFilterField("")
                        setNewFilterOperator("")
                        setNewFilterValue("")
                        setActivePanel(null)
                        setShowSecondaryRow(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activePanel === "rule" && (
            <div className="absolute left-6 z-50 mt-2" style={{ top: '100%' }} ref={ruleDropdownRef}>
              <Card className="w-80 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Permanent Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Filters</h4>
                      <ScrollArea className="h-[120px]">
                        {permanentRules.filter(r => r.type === "filter").map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between rounded-md border p-2 mb-2">
                            <span className="text-xs">{rule.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => onPermanentRulesChange(permanentRules.filter((r) => r.id !== rule.id))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-2">Sorts</h4>
                      <ScrollArea className="h-[120px]">
                        {permanentRules.filter(r => r.type === "sort").map((rule) => (
                          <div key={rule.id} className="flex items-center justify-between rounded-md border p-2 mb-2">
                            <span className="text-xs">{rule.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                              onClick={() => onPermanentRulesChange(permanentRules.filter((r) => r.id !== rule.id))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}