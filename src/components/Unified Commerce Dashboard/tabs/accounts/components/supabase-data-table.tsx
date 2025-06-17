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
  const {
    visibleColumns,
    hasUnsavedChanges,
    reorderColumns,
    toggleColumnVisibility,
    saveConfiguration,
    resetConfiguration,
    columns,
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

      await updateClient(customerId, updates);
      await refreshClients(); // Refresh the data
    } catch (error) {
      console.error("Failed to update client:", error);
      throw error;
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
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

  const hasActiveFilters =
    searchTerm || pricingFilter !== "all" || statusFilter !== "all";

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
      if (editingCustomer) {
        // Update existing customer
        const updates = {
          Client: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          "Pricing Option": customerData.pricingOption,
          "# Visits": customerData.visits,
          "Last Visit": customerData.lastVisit,
          Staff: customerData.staff,
          "Expiration Date": customerData.expirationDate,
          "Cross Regional Visit": customerData.crossRegionalVisit,
          "Visit Type": customerData.visitType,
          "Booking Method": customerData.bookingMethod,
          "Referral Type": customerData.referralType,
        };
        await updateClient(editingCustomer.id, updates);
      } else {
        // Create new customer - format data according to DatabaseClient interface
        const newClientData = {
          Client: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          "Last Visit": customerData.lastVisit,
          "# Visits": customerData.visits,
          "Pricing Option": customerData.pricingOption,
          "Expiration Date": customerData.expirationDate,
          Staff: customerData.staff,
          "Cross Regional Visit": customerData.crossRegionalVisit,
          "Visit Type": customerData.visitType,
          "Booking Method": customerData.bookingMethod,
          "Referral Type": customerData.referralType,
        };
        await createClient(newClientData);
      }
      await refreshClients();
      setIsFormOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Failed to save customer:", error);
      throw error;
    }
  };

  const getFieldType = (field: string) => {
    const typeMap: Record<string, string> = {
      email: "email",
      phone: "phone",
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

  const getFieldOptions = (field: string) => {
    const optionsMap: Record<string, string[]> = {
      pricingOption: ["Premium Banking", "Standard Banking", "Basic Banking", "Enterprise", "VIP", "Corporate"],
      status: ["active", "inactive", "pending", "suspended"],
      priority: ["Critical", "High", "Medium", "Low", "Normal"],
      segment: ["Enterprise", "SMB", "Startup", "Non-Profit", "Government", "Healthcare", "Education", "Retail", "Manufacturing", "Technology"],
      crossRegionalVisit: ["Yes", "No"],
      visitType: ["Portfolio Review", "Investment Consultation", "Account Opening", "Financial Planning", "Risk Assessment", "Follow-up Meeting", "Quarterly Review"],
      bookingMethod: ["Phone", "Email", "Online Portal", "Mobile App", "In-Person", "Video Call"],
      referralType: ["Professional Referral", "Existing Client", "Marketing Campaign", "Website", "Social Media", "Partnership", "Cold Outreach"],
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Account Directory
              </CardTitle>
              <CardDescription>
                Manage your account database with drag-and-drop columns and
                inline editing
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">
                    Unsaved column changes
                  </span>
                  <Button
                    size="sm"
                    onClick={saveConfiguration}
                    className="h-7 bg-slate-600 text-white hover:bg-slate-700"
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                </div>
              )}
              {selectedCustomers.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedCustomers.length} selected
                  </span>
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
              <Button
                size="sm"
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="h-9 bg-transparent text-black shadow-none hover:bg-slate-100"
              >
                <Settings className="mr-2 h-4 w-4" />
                Columns
              </Button>
              {/* <Button  size="sm" onClick={refreshClients} disabled={loading} className="h-9 bg-transparent text-black shadow-none hover:bg-slate-100">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button> */}
              <Button
                onClick={handleAddCustomer}
                className="h-9 bg-transparent text-black shadow-none hover:bg-slate-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Column Settings */}
          {showColumnSettings && (
            <div className="mb-6 rounded-lg border bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Column Visibility</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-transparent text-black shadow-none hover:bg-slate-100"
                    onClick={resetConfiguration}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    className="bg-transparent text-black shadow-none hover:bg-slate-100"
                    onClick={saveConfiguration}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {columns.map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={column.id}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    />
                    <label
                      htmlFor={column.id}
                      className="cursor-pointer text-sm font-medium"
                    >
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search accounts by name, email, phone, or staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={pricingFilter} onValueChange={setPricingFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Pricing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pricing</SelectItem>
                  {pricingOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Search: {searchTerm}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => setSearchTerm("")}
                    />
                  </Badge>
                )}
                {pricingFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Pricing: {pricingFilter}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => setPricingFilter("all")}
                    />
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-700"
                  >
                    Status: {statusFilter}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={() => setStatusFilter("all")}
                    />
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-6 bg-transparent px-2 text-xs text-black shadow-none hover:bg-slate-100"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border">
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
                       <TableCell key={column.id} className={`${column.key === "visits" ? "text-right" : ""} ${column.key === "phone" ? "whitespace-nowrap" : ""}`}>
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
