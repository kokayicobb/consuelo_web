"use client"

import { useState, useMemo } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  User,
  X,
  Phone,
  Plus,
  Edit2,
} from "lucide-react"
import ColumnManager, { type CustomField } from "./column-manager"
import DynamicCustomerForm from "./dynamic-customer-form"
import { Checkbox } from "@/components/Playground/components/ui/checkbox"

// Default fields that match your existing structure
const defaultFields: CustomField[] = [
  {
    id: "name",
    name: "name",
    label: "Client Name",
    type: "text",
    required: true,
    sortable: true,
    filterable: true,
    visible: true,
    order: 0,
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    required: false,
    sortable: true,
    filterable: true,
    visible: true,
    order: 1,
  },
  {
    id: "phone",
    name: "phone",
    label: "Phone",
    type: "phone",
    required: false,
    sortable: true,
    filterable: true,
    visible: true,
    order: 2,
  },
  {
    id: "pricingOption",
    name: "pricingOption",
    label: "Pricing Option",
    type: "select",
    required: false,
    sortable: true,
    filterable: true,
    visible: true,
    order: 3,
    options: ["Premium", "Standard", "Basic", "Trial"],
  },
  {
    id: "visits",
    name: "visits",
    label: "Total Visits",
    type: "number",
    required: false,
    sortable: true,
    filterable: false,
    visible: true,
    order: 4,
  },
  {
    id: "lastVisit",
    name: "lastVisit",
    label: "Last Visit",
    type: "date",
    required: false,
    sortable: true,
    filterable: false,
    visible: true,
    order: 5,
  },
  {
    id: "staff",
    name: "staff",
    label: "Staff",
    type: "text",
    required: false,
    sortable: true,
    filterable: true,
    visible: true,
    order: 6,
  },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: "select",
    required: false,
    sortable: true,
    filterable: true,
    visible: true,
    order: 7,
    options: ["active", "inactive"],
  },
]

// Sample data
const sampleCustomers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    pricingOption: "Premium",
    visits: 15,
    lastVisit: "2024-01-15",
    staff: "Sarah Johnson",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1-555-0124",
    pricingOption: "Standard",
    visits: 8,
    lastVisit: "2024-01-10",
    staff: "Mike Wilson",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+1-555-0125",
    pricingOption: "Basic",
    visits: 3,
    lastVisit: "2023-12-20",
    staff: "Sarah Johnson",
    status: "inactive",
  },
]

interface EditableCustomerTableProps {
  onViewProfile?: (customerId: string) => void
  onSendEmail?: (customerId: string) => void
  onViewDetails?: (customerId: string) => void
}

export default function EditableCustomerTable({
  onViewProfile,
  onSendEmail,
  onViewDetails,
}: EditableCustomerTableProps) {
  const [fields, setFields] = useState<CustomField[]>(defaultFields)
  const [customers, setCustomers] = useState(sampleCustomers)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortField, setSortField] = useState<string>("lastVisit")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Record<string, any> | null>(null)
  const [activeTab, setActiveTab] = useState("table")

  // Get filterable fields for filter dropdowns
  const filterableFields = useMemo(() => {
    return fields.filter((field) => field.filterable && field.type === "select")
  }, [fields])

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    const filtered = customers.filter((customer) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        fields.some((field) => {
          const value = customer[field.name]
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })

      // Field filters
      const matchesFilters = Object.entries(filters).every(([fieldName, filterValue]) => {
        if (filterValue === "all" || !filterValue) return true
        return customer[fieldName] === filterValue
      })

      return matchesSearch && matchesFilters
    })

    // Sort customers
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle null values
      if (aValue === null && bValue === null) return 0
      if (aValue === null) return sortDirection === "asc" ? 1 : -1
      if (bValue === null) return sortDirection === "asc" ? -1 : 1

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toString().toLowerCase()
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [customers, searchTerm, filters, sortField, sortDirection, fields])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize)
  const paginatedCustomers = filteredAndSortedCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(fieldName)
      setSortDirection("asc")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(paginatedCustomers.map((customer) => customer.id))
    } else {
      setSelectedCustomers([])
    }
  }

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId])
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId))
    }
  }

  const handleFilterChange = (fieldName: string, value: string) => {
    setFilters((prev) => ({ ...prev, [fieldName]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilters({})
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || Object.values(filters).some((value) => value && value !== "all")

  const handleSaveCustomer = (customerData: Record<string, any>) => {
    if (editingCustomer) {
      // Update existing customer - preserve the existing customer object structure
      setCustomers((prev) =>
        prev.map((customer) => 
          customer.id === editingCustomer.id 
            ? { ...customer, ...customerData } 
            : customer
        )
      )
    } else {
      // Add new customer - ensure all required fields are present
      const newCustomer = {
        id: Date.now().toString(),
        name: customerData.name || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        pricingOption: customerData.pricingOption || "",
        visits: customerData.visits || 0,
        lastVisit: customerData.lastVisit || "",
        staff: customerData.staff || "",
        status: customerData.status || "active",
        ...customerData, // This will override any of the above if they exist in customerData
      }
      setCustomers((prev) => [...prev, newCustomer])
    }
    setEditingCustomer(null)
  }
  const handleEditCustomer = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setEditingCustomer(customer)
      setIsFormOpen(true)
    }
  }

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsFormOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const renderCellValue = (customer: Record<string, any>, field: CustomField) => {
    const value = customer[field.name]

    switch (field.type) {
      case "date":
        return formatDate(value)
      case "boolean":
        return value ? "Yes" : "No"
      case "select":
        if (field.name === "pricingOption") {
          const colorMap: Record<string, string> = {
            Premium: "bg-purple-100 text-purple-800 border-purple-200",
            Standard: "bg-blue-100 text-blue-800 border-blue-200",
            Basic: "bg-green-100 text-green-800 border-green-200",
            Trial: "bg-yellow-100 text-yellow-800 border-yellow-200",
          }
          return (
            <Badge variant="outline" className={colorMap[value] || "bg-purple-100 text-purple-800 border-purple-200"}>
              {value || "Not Set"}
            </Badge>
          )
        }
        if (field.name === "status") {
          return (
            <div className={`flex items-center gap-2 ${value === "active" ? "text-green-700" : "text-gray-500"}`}>
              <div className={`h-2 w-2 rounded-full ${value === "active" ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-sm font-medium capitalize">{value}</span>
            </div>
          )
        }
        return value || "Not Set"
      default:
        return value || "—"
    }
  }

  const visibleFields = fields.filter((field) => field.visible).sort((a, b) => a.order - b.order)

  return (
    <div className="w-full space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table">Customer Table</TabsTrigger>
          <TabsTrigger value="settings">Column Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Client Directory</CardTitle>
                  <CardDescription>Manage your customizable client database</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCustomers.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-medium text-blue-700">{selectedCustomers.length} selected</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-blue-200 text-blue-700 hover:bg-blue-100"
                        onClick={() => setSelectedCustomers([])}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                  <Button onClick={handleAddCustomer}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Filters and Search */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {filterableFields.map((field) => (
                    <Select
                      key={field.id}
                      value={filters[field.name] || "all"}
                      onValueChange={(value) => handleFilterChange(field.name, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={`All ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {field.label}</SelectItem>
                        {field.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Search: {searchTerm}
                        <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                      </Badge>
                    )}
                    {Object.entries(filters).map(([fieldName, value]) => {
                      if (!value || value === "all") return null
                      const field = fields.find((f) => f.name === fieldName)
                      return (
                        <Badge key={fieldName} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {field?.label}: {value}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => handleFilterChange(fieldName, "all")}
                          />
                        </Badge>
                      )
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all customers"
                        />
                      </TableHead>
                      {visibleFields.map((field) => (
                        <TableHead
                          key={field.id}
                          className={field.name === "name" ? "" : field.type === "number" ? "text-right" : ""}
                        >
                          {field.sortable ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleSort(field.name)}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              {field.label}
                              <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="font-semibold">{field.label}</span>
                          )}
                        </TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className={selectedCustomers.includes(customer.id) ? "bg-blue-50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.includes(customer.id)}
                            onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                            aria-label={`Select ${customer.name}`}
                          />
                        </TableCell>
                        {visibleFields.map((field) => (
                          <TableCell key={field.id} className={field.type === "number" ? "text-right font-medium" : ""}>
                            {field.name === "name" ? (
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src="/placeholder.svg" alt={customer.name} />
                                  <AvatarFallback className="bg-gray-100 text-gray-600">
                                    {customer.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-gray-900">{customer.name}</div>
                                  {customer.email && (
                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {customer.email}
                                    </div>
                                  )}
                                  {customer.phone && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {customer.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              renderCellValue(customer, field)
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onViewProfile?.(customer.id)} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              {customer.email && (
                                <DropdownMenuItem onClick={() => onSendEmail?.(customer.id)} className="cursor-pointer">
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => onViewDetails?.(customer.id)} className="cursor-pointer">
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEditCustomer(customer.id)}
                                className="cursor-pointer"
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {paginatedCustomers.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="text-gray-500 text-lg font-medium">No customers found</div>
                    <div className="text-gray-400 text-sm mt-1">
                      {hasActiveFilters ? "Try adjusting your filters" : "No customers to display"}
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Rows per page:</span>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setCurrentPage(1)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {(currentPage - 1) * pageSize + 1}-
                      {Math.min(currentPage * pageSize, filteredAndSortedCustomers.length)} of{" "}
                      {filteredAndSortedCustomers.length}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="icon"
                              onClick={() => setCurrentPage(pageNum)}
                              className="h-8 w-8"
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
                {filteredAndSortedCustomers.length !== customers.length && (
                  <span className="text-gray-500"> (filtered from {customers.length} total)</span>
                )}
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <ColumnManager
            fields={fields}
            onFieldsChange={setFields}
            onSave={() => {
              // Here you would save the field configuration to your backend
              console.log("Saving field configuration:", fields)
              setActiveTab("table")
            }}
          />
        </TabsContent>
      </Tabs>

      <DynamicCustomerForm
        fields={fields}
        customer={editingCustomer}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingCustomer(null)
        }}
        onSave={handleSaveCustomer}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
      />
    </div>
  )
}
