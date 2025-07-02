"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  RefreshCw,
  Save,
  Settings,
} from "lucide-react";

import ColumnManager, { CustomField } from "../ui/column-manager";
import DynamicCustomerForm from "../ui/dynamic-customer-form";
import { Checkbox } from "@/components/Playground/components/ui/checkbox";
import { useClients } from "@/hooks/use-clients";
import { useColumnConfig } from "@/hooks/use-column-config";
import { updateClient, exportClientsToCSV } from "@/lib/supabase/clients";
import { Customer, CreateCustomerInput } from "@/lib/supabase/customer";
import { createClient } from "@/lib/supabase/clients";
import DraggableTableHeader from "../ui/draggable-table-header";
import InlineEditCell from "../ui/inline-edit-cell";
import DetailedSidePanel from "../ui/side-panel-account";
import DataHeader from "../ui/table-header";
import { useSession } from "@clerk/nextjs"
import { createClerkSupabaseClient } from "@/lib/supabase/client"

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
interface ProductionCustomerTableProps {
  onViewProfile?: (customerId: string) => void;
  onSendEmail?: (customerId: string) => void;
  onViewDetails?: (customerId: string) => void;
}

export default function SupabaseCustomerTable({
  onViewProfile,
  onSendEmail,
  onViewDetails,
}: ProductionCustomerTableProps) {
  const { clients, loading, error, refreshClients } = useClients();
  const { session } = useSession()
  const {
    visibleColumns,
   
    reorderColumns,
    toggleColumnVisibility,
    saveConfiguration,
    resetConfiguration,
    columns,
    updateColumns,
  } = useColumnConfig();

  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pricingFilter, setPricingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("lastVisit");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Get unique pricing options for filter
  const pricingOptions = useMemo(() => {
    const options = new Set(
      clients.map((client) => client.pricingOption).filter(Boolean),
    );
    return Array.from(options).sort();
  }, [clients]);
  const [activeFilters, setActiveFilters] = useState<FilterRule[]>([])
  const availableStaff = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "Me"]
  const availablePricingOptions = ["Premium", "Standard", "Basic", "Enterprise"]
  const availableSegments = ["High Net Worth", "Corporate", "Retail", "Institutional"]
  const availableVisitTypes = ["In-Person", "Virtual", "Phone", "Email"]
  const availableBookingMethods = ["Online", "Phone", "Walk-in", "Referral"]
  const availableReferralTypes = ["Client Referral", "Partner", "Marketing", "Cold Outreach"]
  const [activeSorts, setActiveSorts] = useState<SortRule[]>([])
  const [permanentRules, setPermanentRules] = useState<PermanentRule[]>([])
  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    const filtered = clients.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.staff?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPricing =
        pricingFilter === "all" || customer.pricingOption === pricingFilter;
      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;

      return matchesSearch && matchesPricing && matchesStatus;
    });

    // Sort customers
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof Customer];
      let bValue = b[sortField as keyof Customer];

      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return sortDirection === "asc" ? 1 : -1;
      if (bValue === null) return sortDirection === "asc" ? -1 : 1;

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    clients,
    searchTerm,
    pricingFilter,
    statusFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize);
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(paginatedCustomers.map((customer) => customer.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId));
    }
  };
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] =
    useState<Customer | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSidePanelFullScreen, setIsSidePanelFullScreen] = useState(false);
  const handleInlineEdit = async (
    customerId: string,
    field: string,
    value: any,
  ) => {
    try {
      // Get authenticated client
      const token = await session?.getToken()
      const supabaseClient = createClerkSupabaseClient(token)
      
      const fieldMapping: Record<string, string> = {
        // Basic client information
        name: "Client",
        email: "email",
        phone: "phone",
        
        // Financial service fields
        pricingOption: "Pricing Option",
        visits: "# Visits",
        lastVisit: "Last Visit",
        staff: "Staff",
        expirationDate: "Expiration Date",
        crossRegionalVisit: "Cross Regional Visit",
        visitType: "Visit Type",
        bookingMethod: "Booking Method",
        referralType: "Referral Type",
        
        // Additional CRM/Banking fields
        title: "title",
        company: "company",
        address: "address",
        linkedin: "linkedin",
        priority: "priority",
        status: "status",
        segment: "segment",
        relationshipManager: "relationship_manager",
        notes: "notes",
        totalAssetsUnderManagement: "total_assets_under_management",
        recentDealValue: "recent_deal_value",
        productInterests: "product_interests",
        lastReviewDate: "last_review_date",
        createdAt: "created_at",
        updatedAt: "updated_at",
        clientId: "Client ID"
      };
  
      const dbField = fieldMapping[field] || field;
      const updates = { [dbField]: value };
  
      await updateClient(customerId, updates, supabaseClient);
      await refreshClients(); // Refresh the data
    } catch (error) {
      console.error("Failed to update client:", error);
      throw error;
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  const handleResize = (index: number, width: number) => {
    const updatedColumns = visibleColumns.map((col, i) => 
      i === index ? { ...col, width } : col
    );
    
    // Update the full columns array with new widths
    const newColumns = columns.map(col => {
      const updated = updatedColumns.find(c => c.id === col.id);
      return updated ? { ...col, width: updated.width } : col;
    });
    
    updateColumns(newColumns);
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      reorderColumns(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPricingFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || pricingFilter !== "all" || statusFilter !== "all"

  const handleExportData = () => {
    exportClientsToCSV(filteredAndSortedCustomers);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customerId: string) => {
    const customer = clients.find((c) => c.id === customerId);
    if (customer) {
      setEditingCustomer(customer);
      setIsFormOpen(true);
    }
  };

  const handleSaveCustomer = async (customerData: CreateCustomerInput) => {
    try {
      // Get authenticated client
      const token = await session?.getToken()
      const supabaseClient = createClerkSupabaseClient(token)
      
      // Helper function to clean date values
      const cleanDateValue = (value: any) => {
        if (!value || value === '') return null;
        return value;
      };
      
      // Helper function to clean all values
      const cleanValue = (value: any, fieldName: string) => {
        // List of date fields in your database
        const dateFields = ['Last Visit', 'Expiration Date', 'last_review_date'];
        
        if (dateFields.includes(fieldName)) {
          return cleanDateValue(value);
        }
        
        // For other fields, convert empty strings to null
        if (value === '') return null;
        
        return value;
      };
      
      if (editingCustomer) {
        // Update existing customer
        const updates = {
          Client: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          "Pricing Option": customerData.pricingOption,
          "# Visits": customerData.visits,
          "Last Visit": cleanDateValue(customerData.lastVisit),
          Staff: customerData.staff,
          "Expiration Date": cleanDateValue(customerData.expirationDate),
          "Cross Regional Visit": customerData.crossRegionalVisit,
          "Visit Type": customerData.visitType,
          "Booking Method": customerData.bookingMethod,
          "Referral Type": customerData.referralType,
          // Add additional fields if they exist
          title: customerData.title,
          company: customerData.company,
          address: customerData.address,
          linkedin: customerData.linkedin,
          priority: customerData.priority,
          segment: customerData.segment,
          relationship_manager: customerData.relationship_manager,
          notes: customerData.notes,
          total_assets_under_management: customerData.total_assets_under_management,
          recent_deal_value: customerData.recent_deal_value,
          product_interests: customerData.product_interests,
          last_review_date: cleanDateValue(customerData.last_review_date),
        };
        
        // Remove any undefined values
        const cleanedUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = cleanValue(value, key);
          }
          return acc;
        }, {} as any);
        
        await updateClient(editingCustomer.id, cleanedUpdates, supabaseClient);
      } else {
        // Create new customer - DON'T include user_id, the trigger will add it automatically
        const newClientData = {
          Client: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null,
          "Last Visit": cleanDateValue(customerData.lastVisit),
          "# Visits": customerData.visits || 0,
          "Pricing Option": customerData.pricingOption || null,
          "Expiration Date": cleanDateValue(customerData.expirationDate),
          Staff: customerData.staff || null,
          "Cross Regional Visit": customerData.crossRegionalVisit || null,
          "Visit Type": customerData.visitType || null,
          "Booking Method": customerData.bookingMethod || null,
          "Referral Type": customerData.referralType || null,
          // Add additional fields if they exist
          title: customerData.title || null,
          company: customerData.company || null,
          address: customerData.address || null,
          linkedin: customerData.linkedin || null,
          priority: customerData.priority || null,
          segment: customerData.segment || null,
          relationship_manager: customerData.relationship_manager || null,
          notes: customerData.notes || null,
          total_assets_under_management: customerData.total_assets_under_management || null,
          recent_deal_value: customerData.recent_deal_value || null,
          product_interests: customerData.product_interests || null,
          last_review_date: cleanDateValue(customerData.last_review_date),
        };
        
        // Remove any undefined values and ensure empty strings become null
        const cleanedData = Object.entries(newClientData).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = cleanValue(value, key);
          }
          return acc;
        }, {} as any);
        
        await createClient(cleanedData, supabaseClient);
      }
      
      await refreshClients();
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Failed to save customer:", error);
      // You might want to show a toast notification here
      throw error;
    }
  };
  

  const getFieldType = (field: string) => {
    const typeMap: Record<string, string> = {
      email: "email",
      phone: "phone",
      title: "title",
      visits: "number",
      lastVisit: "date",
      expirationDate: "date",
      lastReviewDate: "date",
      totalAssetsUnderManagement: "number",
      recentDealValue: "number",
      priority: "select",
      status: "select",
      segment: "select",
      pricingOption: "select",
      crossRegionalVisit: "select",
      visitType: "select",
      bookingMethod: "select",
      referralType: "select",
    };
    return typeMap[field] || "text";
  };
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)



  const handleToggleColumnVisibility = (id: string) => {
    // Your column visibility logic here
    setHasUnsavedChanges(true)
  }

  const handleSaveConfiguration = () => {
    // Your save logic here
    setHasUnsavedChanges(false)
  }

  const handleResetConfiguration = () => {
    // Your reset logic here
    setHasUnsavedChanges(false)
  }

  


  const handleShowActiveOnly = () => {
    setStatusFilter("active")
  }

  const handleAddAccount = () => {
    setEditingCustomer(null); // Clear any existing customer data
    setIsFormOpen(true); // Open the form in create mode
  };


  const getFieldOptions = (field: string) => {
    const optionsMap: Record<string, string[]> = {
      
    };
    
    if (field === "relationshipManager") {
      // You can populate this with actual staff members from your database
      return ["Alice Cooper", "Bob Martinez", "Carol Johnson", "Dan Williams", "Eva Rodriguez", "Frank Chen"];
    }
    
    return optionsMap[field] || [];
  };

 
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-2 text-lg font-medium text-red-600">
              Error loading clients
            </div>
            <div className="mb-4 text-sm text-gray-500">{error}</div>
            <Button
              onClick={refreshClients}
              className="bg-transparent text-black shadow-none hover:bg-slate-100"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="w-full space-y-4">
      <Card className="w-full">
        
      <DataHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeFilters={activeFilters}
        onFiltersChange={setActiveFilters}
        activeSorts={activeSorts}
        onSortsChange={setActiveSorts}
        permanentRules={permanentRules}
        onPermanentRulesChange={setPermanentRules}
        columns={columns}
        onToggleColumnVisibility={handleToggleColumnVisibility}
        hasUnsavedChanges={hasUnsavedChanges}
        onSaveConfiguration={handleSaveConfiguration}
        onResetConfiguration={handleResetConfiguration}
        selectedCount={selectedCustomers.length}
        onClearSelection={() => setSelectedCustomers([])}
        onAddAccount={handleAddAccount}
        onShowActiveOnly={handleShowActiveOnly}
        availableStaff={availableStaff}
        availablePricingOptions={availablePricingOptions}
        availableSegments={availableSegments}
        availableVisitTypes={availableVisitTypes}
        availableBookingMethods={availableBookingMethods}
        availableReferralTypes={availableReferralTypes}
      />

        <CardContent>
         

         
          {/* Table */}
          <div className="w-full overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedCustomers.length ===
                          paginatedCustomers.length &&
                        paginatedCustomers.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all accounts"
                    />
                  </TableHead>
                  {visibleColumns.map((column, index) => (
                    <DraggableTableHeader
                      key={column.id}
                      column={column}
                      index={index}
                      onSort={handleSort}
                      onResize={handleResize}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      isDragging={draggedIndex === index}
                    />
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={visibleColumns.length + 2}
                      className="py-12 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading accounts...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className={`${selectedCustomers.includes(customer.id) ? "bg-blue-50" : ""} cursor-pointer hover:bg-gray-50`}
                      onClick={() => {
                        setSelectedCustomerForDetails(customer);
                        setIsSidePanelOpen(true);
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={(checked) =>
                            handleSelectCustomer(
                              customer.id,
                              checked as boolean,
                            )
                          }
                          aria-label={`Select ${customer.name}`}
                        />
                      </TableCell>
                      {visibleColumns.map((column) => (
  <TableCell 
    key={column.id} 
    className={`${column.key === "visits" ? "text-right" : ""} ${column.key === "phone" ? "whitespace-nowrap" : ""}`}
    style={{ width: column.width || 'auto', minWidth: column.width || 'auto' }}
  >
                          {column.key === "name" ? (
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src="/placeholder.svg"
                                  alt={customer.name}
                                />
                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                  {customer.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <InlineEditCell
                                  customer={customer}
        field={column.key}
        value={customer[column.key as keyof Customer]}
        onSave={handleInlineEdit}
        type={getFieldType(column.key) as any}
        options={getFieldOptions(column.key)}
                                />
                                {customer.email && (
                                  <div className="flex items-center gap-1 text-sm text-gray-500">
                                    <Mail className="h-3 w-3" />
                                    {customer.email}
                                  </div>
                                )}
                                {customer.phone && (

                                   
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Phone className="h-3 w-3" />
                                    {customer.phone }
                                  </div>
                                )}
                              </div>
                            </div>

                            
                          ) : (
                            <InlineEditCell
                              customer={customer}
                              field={column.key}
                              value={customer[column.key as keyof Customer]}
                              onSave={handleInlineEdit}
                              type={getFieldType(column.key) as any}
                              options={getFieldOptions(column.key)}
                            />
                          )}
                        </TableCell>
                      ))}
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              className="h-8 w-8 bg-transparent text-black shadow-none hover:bg-slate-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-slate-200"
                          >
                            <DropdownMenuItem
                              onClick={() => onViewProfile?.(customer.id)}
                              className="cursor-pointer hover:bg-slate-300  "
                            >
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            {customer.email && (
                              <DropdownMenuItem
                                onClick={() => onSendEmail?.(customer.id)}
                                className="cursor-pointer"
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => onViewDetails?.(customer.id)}
                              className="cursor-pointer"
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditCustomer(customer.id)}
                              className="cursor-pointer"
                            >
                              Edit Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!loading && paginatedCustomers.length === 0 && (
              <div className="py-12 text-center">
                <div className="text-lg font-medium text-gray-500">
                  No accounts found
                </div>
                <div className="mt-1 text-sm text-gray-400">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "No accounts to display"}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {(currentPage - 1) * pageSize + 1}-
                  {Math.min(
                    currentPage * pageSize,
                    filteredAndSortedCustomers.length,
                  )}{" "}
                  of {filteredAndSortedCustomers.length}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 bg-transparent text-black shadow-none hover:bg-slate-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 bg-transparent text-black shadow-none hover:bg-slate-100"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 bg-transparent text-black shadow-none hover:bg-slate-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {paginatedCustomers.length} of{" "}
            {filteredAndSortedCustomers.length} accounts
            {filteredAndSortedCustomers.length !== clients.length && (
              <span className="text-gray-500">
                {" "}
                (filtered from {clients.length} total)
              </span>
            )}
          </div>
          <Button
            onClick={handleExportData}
            className="bg-transparent text-black shadow-none hover:bg-slate-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Account Data
          </Button>
        </CardFooter>
      </Card>

      <DynamicCustomerForm
        fields={columns
          .filter((col) => col.visible)
          .map((col) => ({
            id: col.id,
            name: col.key,
            label: col.label,
            type: getFieldType(col.key) as any,
            required: col.key === "name",
            sortable: true,
            filterable: true,
            visible: true,
            order: col.order,
            options: getFieldOptions(col.key),
          }))}
        customer={editingCustomer}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
      />
      <DetailedSidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        customer={selectedCustomerForDetails}
        isFullScreen={isSidePanelFullScreen}
        onToggleFullScreen={() =>
          setIsSidePanelFullScreen(!isSidePanelFullScreen)
        }
      />
    </div>
  );
}
