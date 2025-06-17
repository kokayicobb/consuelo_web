// "use client"

// import { useState, useMemo } from "react"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import {
//   ArrowUpDown,
//   ChevronLeft,
//   ChevronRight,
//   Download,
//   Filter,
//   Mail,
//   MoreHorizontal,
//   Search,
//   User,
//   X,
// } from "lucide-react"
// import { Checkbox } from "@/components/Playground/components/ui/checkbox"
// import { Customer } from "@/lib/supabase/customer"

// // // Update the Customer interface to match your database schema
// // interface Customer {
// //   id: string // "Client ID"
// //   name: string // "Client"
// //   email: string | null
// //   phone: string | null
// //   lastVisit: string | null // "Last Visit"
// //   visits: number // "# Visits"
// //   pricingOption: string | null // "Pricing Option" - we'll use this as segment
// //   expirationDate: string | null // "Expiration Date"
// //   staff: string | null // "Staff"
// //   crossRegionalVisit: string | null // "Cross Regional Visit"
// //   visitType: string | null // "Visit Type"
// //   bookingMethod: string | null // "Booking Method"
// //   referralType: string | null // "Referral Type"
// //   status: "active" | "inactive" // We'll derive this from expiration date
// // }

// // Update the interface to match your actual data structure
// interface CustomerTableProps {
//   customers: Customer[]
//   loading?: boolean
//   onViewProfile?: (customerId: string) => void
//   onSendEmail?: (customerId: string) => void
//   onViewDetails?: (customerId: string) => void
//   onEditCustomer?: (customerId: string) => void
//   onExportData?: () => void
//   onRefresh?: () => void
// }

// export default function CustomerTable({
//   customers,
//   loading = false,
//   onViewProfile,
//   onSendEmail,
//   onViewDetails,
//   onEditCustomer,
//   onExportData,
//   onRefresh,
// }: CustomerTableProps) {
//   const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
//   const [searchTerm, setSearchTerm] = useState("")
//   const [segmentFilter, setSegmentFilter] = useState<string>("all")
//   const [statusFilter, setStatusFilter] = useState<string>("all")
//   const [sortField, setSortField] = useState<keyof Customer>("name")
//   const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
//   const [currentPage, setCurrentPage] = useState(1)
//   const [pageSize, setPageSize] = useState(10)

//   // Filter and sort customers
//   const filteredAndSortedCustomers = useMemo(() => {
//     const filtered = customers.filter((customer) => {
//       const matchesSearch =
//         customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (customer.email !== null && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))

//       const matchesSegment = segmentFilter === "all" || customer.pricingOption === segmentFilter
//       const matchesStatus = statusFilter === "all" || customer.status === statusFilter

//       return matchesSearch && matchesSegment && matchesStatus
//     })

//     // Sort customers
//     filtered.sort((a, b) => {
//       let aValue = a[sortField]
//       let bValue = b[sortField]

//       if (typeof aValue === "string") {
//         aValue = aValue.toLowerCase()
//         bValue = (bValue as string).toLowerCase()
//       }

//       if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
//       if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
//       return 0
//     })

//     return filtered
//   }, [customers, searchTerm, segmentFilter, statusFilter, sortField, sortDirection])

//   // Pagination
//   const totalPages = Math.ceil(filteredAndSortedCustomers.length / pageSize)
//   const paginatedCustomers = filteredAndSortedCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

//   const handleSort = (field: keyof Customer) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === "asc" ? "desc" : "asc")
//     } else {
//       setSortField(field)
//       setSortDirection("asc")
//     }
//   }

//   const handleSelectAll = (checked: boolean) => {
//     if (checked) {
//       setSelectedCustomers(paginatedCustomers.map((customer) => customer.id))
//     } else {
//       setSelectedCustomers([])
//     }
//   }

//   const handleSelectCustomer = (customerId: string, checked: boolean) => {
//     if (checked) {
//       setSelectedCustomers([...selectedCustomers, customerId])
//     } else {
//       setSelectedCustomers(selectedCustomers.filter((id) => id !== customerId))
//     }
//   }

//   const getSegmentBadgeStyle = (segment: string | null) => {
//     if (!segment) {
//       return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
//     }
//     switch (segment) {
//       case "VIP":
//         return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
//       case "Loyal":
//         return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
//       case "At-Risk":
//         return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
//       case "Regular":
//         return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
//       case "Occasional":
//         return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
//     }
//   }

//   const clearFilters = () => {
//     setSearchTerm("")
//     setSegmentFilter("all")
//     setStatusFilter("all")
//     setCurrentPage(1)
//   }

//   const hasActiveFilters = searchTerm || segmentFilter !== "all" || statusFilter !== "all"

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="text-2xl font-bold">Customer Directory</CardTitle>
//             <CardDescription>Manage and view your customer base with advanced filtering and sorting</CardDescription>
//           </div>
//           {selectedCustomers.length > 0 && (
//             <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
//               <span className="text-sm font-medium text-blue-700">{selectedCustomers.length} selected</span>
//               <Button
//                 size="sm"
//                 variant="outline"
//                 className="h-7 border-blue-200 text-blue-700 hover:bg-blue-100"
//                 onClick={() => setSelectedCustomers([])}
//               >
//                 Clear
//               </Button>
//             </div>
//           )}
//         </div>
//       </CardHeader>

//       <CardContent>
//         {/* Filters and Search */}
//         <div className="flex flex-col gap-4 mb-6">
//           <div className="flex flex-col sm:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search customers by name, email, or location..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Select value={segmentFilter} onValueChange={setSegmentFilter}>
//               <SelectTrigger className="w-full sm:w-[180px]">
//                 <SelectValue placeholder="All Segments" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Segments</SelectItem>
//                 <SelectItem value="VIP">VIP</SelectItem>
//                 <SelectItem value="Loyal">Loyal</SelectItem>
//                 <SelectItem value="At-Risk">At-Risk</SelectItem>
//                 <SelectItem value="Regular">Regular</SelectItem>
//                 <SelectItem value="Occasional">Occasional</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-full sm:w-[180px]">
//                 <SelectValue placeholder="All Status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Status</SelectItem>
//                 <SelectItem value="active">Active</SelectItem>
//                 <SelectItem value="inactive">Inactive</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {hasActiveFilters && (
//             <div className="flex items-center gap-2">
//               <Filter className="h-4 w-4 text-gray-500" />
//               <span className="text-sm text-gray-600">Active filters:</span>
//               {searchTerm && (
//                 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//                   Search: {searchTerm}
//                   <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
//                 </Badge>
//               )}
//               {segmentFilter !== "all" && (
//                 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//                   Segment: {segmentFilter}
//                   <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSegmentFilter("all")} />
//                 </Badge>
//               )}
//               {statusFilter !== "all" && (
//                 <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//                   Status: {statusFilter}
//                   <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
//                 </Badge>
//               )}
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={clearFilters}
//                 className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
//               >
//                 Clear all
//               </Button>
//             </div>
//           )}
//         </div>

//         {/* Table */}
//         <div className="border rounded-lg overflow-hidden">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-gray-50">
//                 <TableHead className="w-12">
//                   <Checkbox
//                     checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
//                     onCheckedChange={handleSelectAll}
//                     aria-label="Select all customers"
//                   />
//                 </TableHead>
//                 <TableHead>
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleSort("name")}
//                     className="h-auto p-0 font-semibold hover:bg-transparent"
//                   >
//                     Customer
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHead>
//                 <TableHead>
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleSort("pricingOption")}
//                     className="h-auto p-0 font-semibold hover:bg-transparent"
//                   >
//                     Segment
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHead>
//                 <TableHead className="text-right">
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleSort("visits")}
//                     className="h-auto p-0 font-semibold hover:bg-transparent"
//                   >
//                     Visits
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHead>
//                 <TableHead className="text-right">
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleSort("lastVisit")}
//                     className="h-auto p-0 font-semibold hover:bg-transparent"
//                   >
//                     Last Visit
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHead>
//                 <TableHead>
//                   <Button
//                     variant="ghost"
//                     onClick={() => handleSort("status")}
//                     className="h-auto p-0 font-semibold hover:bg-transparent"
//                   >
//                     Status
//                     <ArrowUpDown className="ml-2 h-4 w-4" />
//                   </Button>
//                 </TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {paginatedCustomers.map((customer) => (
//                 <TableRow key={customer.id} className={selectedCustomers.includes(customer.id) ? "bg-blue-50" : ""}>
//                   <TableCell>
//                     <Checkbox
//                       checked={selectedCustomers.includes(customer.id)}
//                       onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
//                       aria-label={`Select ${customer.name}`}
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center gap-3">
//                       <Avatar className="h-10 w-10">
//                         <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
//                         <AvatarFallback className="bg-gray-100 text-gray-600">
//                           {customer.name
//                             .split(" ")
//                             .map((n) => n[0])
//                             .join("")
//                             .toUpperCase()}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <div className="font-medium text-gray-900">{customer.name}</div>
//                         <div className="text-sm text-gray-500">{customer.email}</div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge variant="outline" className={getSegmentBadgeStyle(customer.pricingOption)}>
//                       {customer.pricingOption}
//                     </Badge>
//                   </TableCell>
//                   <TableCell className="text-right font-medium">{customer.visits}</TableCell>
//                   <TableCell className="text-right text-sm">{customer.lastVisit}</TableCell>
//                   <TableCell>
//                     <div
//                       className={`flex items-center gap-2 ${
//                         customer.status === "active" ? "text-green-700" : "text-gray-500"
//                       }`}
//                     >
//                       <div
//                         className={`h-2 w-2 rounded-full ${
//                           customer.status === "active" ? "bg-green-500" : "bg-gray-400"
//                         }`}
//                       />
//                       <span className="text-sm font-medium capitalize">{customer.status}</span>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
//                           <MoreHorizontal className="h-4 w-4" />
//                           <span className="sr-only">Open menu</span>
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end" className="w-48">
//                         <DropdownMenuItem onClick={() => onViewProfile?.(customer.id)} className="cursor-pointer">
//                           <User className="mr-2 h-4 w-4" />
//                           View Profile
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => onSendEmail?.(customer.id)} className="cursor-pointer">
//                           <Mail className="mr-2 h-4 w-4" />
//                           Send Email
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => onViewDetails?.(customer.id)} className="cursor-pointer">
//                           View Details
//                         </DropdownMenuItem>
//                         <DropdownMenuSeparator />
//                         <DropdownMenuItem onClick={() => onEditCustomer?.(customer.id)} className="cursor-pointer">
//                           Edit Customer
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           {paginatedCustomers.length === 0 && (
//             <div className="py-12 text-center">
//               <div className="text-gray-500 text-lg font-medium">No customers found</div>
//               <div className="text-gray-400 text-sm mt-1">
//                 {hasActiveFilters ? "Try adjusting your filters" : "No customers to display"}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between mt-6">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-600">Rows per page:</span>
//               <Select
//                 value={pageSize.toString()}
//                 onValueChange={(value) => {
//                   setPageSize(Number(value))
//                   setCurrentPage(1)
//                 }}
//               >
//                 <SelectTrigger className="w-20">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="5">5</SelectItem>
//                   <SelectItem value="10">10</SelectItem>
//                   <SelectItem value="20">20</SelectItem>
//                   <SelectItem value="50">50</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-4">
//               <span className="text-sm text-gray-600">
//                 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredAndSortedCustomers.length)}{" "}
//                 of {filteredAndSortedCustomers.length}
//               </span>

//               <div className="flex items-center gap-1">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => setCurrentPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="h-8 w-8"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </Button>

//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                     let pageNum
//                     if (totalPages <= 5) {
//                       pageNum = i + 1
//                     } else if (currentPage <= 3) {
//                       pageNum = i + 1
//                     } else if (currentPage >= totalPages - 2) {
//                       pageNum = totalPages - 4 + i
//                     } else {
//                       pageNum = currentPage - 2 + i
//                     }

//                     return (
//                       <Button
//                         key={pageNum}
//                         variant={currentPage === pageNum ? "default" : "outline"}
//                         size="icon"
//                         onClick={() => setCurrentPage(pageNum)}
//                         className="h-8 w-8"
//                       >
//                         {pageNum}
//                       </Button>
//                     )
//                   })}
//                 </div>

//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => setCurrentPage(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="h-8 w-8"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}
//       </CardContent>

//       <CardFooter className="flex justify-between items-center border-t bg-gray-50">
//         <div className="text-sm text-gray-600">
//           Showing {paginatedCustomers.length} of {filteredAndSortedCustomers.length} customers
//           {filteredAndSortedCustomers.length !== customers.length && (
//             <span className="text-gray-500"> (filtered from {customers.length} total)</span>
//           )}
//         </div>
//         <Button onClick={onExportData} className="bg-blue-600 hover:bg-blue-700 text-white">
//           <Download className="mr-2 h-4 w-4" />
//           Export Customer Data
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }

// // Example usage component showing how to integrate with your existing data
// export function CustomerTableExample() {
//   const customers = [
//     {
//       id: "CUST-7291",
//       name: "Emma Thompson",
//       email: "emma.thompson@example.com",
//       phone: "+1 (555) 123-4567",
//       lastVisit: "Mar 26, 2025",
//       visits: 32,
//       pricingOption: "VIP",
//       expirationDate: "Apr 26, 2025",
//       staff: "John Doe",
//       crossRegionalVisit: "Yes",
//       visitType: "Personal Training",
//       bookingMethod: "Online",
//       referralType: "Friend",
//       status: "active",
//       avatar: "/avatars/emma.jpg",
//     },
//     {
//       id: "CUST-6532",
//       name: "James Wilson",
//       email: "james.wilson@example.com",
//       phone: "+1 (555) 234-5678",
//       lastVisit: "Mar 24, 2025",
//       visits: 28,
//       pricingOption: "Loyal",
//       expirationDate: "Apr 24, 2025",
//       staff: "Jane Smith",
//       crossRegionalVisit: "No",
//       visitType: "Group Class",
//       bookingMethod: "Phone",
//       referralType: "Advertisement",
//       status: "active",
//       avatar: "/avatars/james.jpg",
//     },
//     {
//       id: "CUST-5478",
//       name: "Olivia Martinez",
//       email: "olivia.martinez@example.com",
//       phone: "+1 (555) 345-6789",
//       lastVisit: "Mar 20, 2025",
//       visits: 17,
//       pricingOption: "At-Risk",
//       expirationDate: "Apr 20, 2025",
//       staff: "John Doe",
//       crossRegionalVisit: "Yes",
//       visitType: "Personal Training",
//       bookingMethod: "Online",
//       referralType: "Friend",
//       status: "active",
//       avatar: "/avatars/olivia.jpg",
//     },
//     {
//       id: "CUST-4123",
//       name: "Noah Brown",
//       email: "noah.brown@example.com",
//       phone: "+1 (555) 456-7890",
//       lastVisit: "Mar 28, 2025",
//       visits: 41,
//       pricingOption: "VIP",
//       expirationDate: "Apr 28, 2025",
//       staff: "Jane Smith",
//       crossRegionalVisit: "No",
//       visitType: "Group Class",
//       bookingMethod: "Phone",
//       referralType: "Advertisement",
//       status: "active",
//       avatar: "/avatars/noah.jpg",
//     },
//     {
//       id: "CUST-3987",
//       name: "Sophia Davis",
//       email: "sophia.davis@example.com",
//       phone: "+1 (555) 567-8901",
//       lastVisit: "Feb 15, 2025",
//       visits: 8,
//       pricingOption: "Occasional",
//       expirationDate: "Mar 15, 2025",
//       staff: "John Doe",
//       crossRegionalVisit: "Yes",
//       visitType: "Personal Training",
//       bookingMethod: "Online",
//       referralType: "Friend",
//       status: "inactive",
//       avatar: "/avatars/sophia.jpg",
//     },
//     {
//       id: "CUST-2754",
//       name: "Liam Johnson",
//       email: "liam.johnson@example.com",
//       phone: "+1 (555) 678-9012",
//       lastVisit: "Mar 22, 2025",
//       visits: 26,
//       pricingOption: "Loyal",
//       expirationDate: "Apr 22, 2025",
//       staff: "Jane Smith",
//       crossRegionalVisit: "No",
//       visitType: "Group Class",
//       bookingMethod: "Phone",
//       referralType: "Advertisement",
//       status: "active",
//       avatar: "/avatars/liam.jpg",
//     },
//     {
//       id: "CUST-1689",
//       name: "Ava Williams",
//       email: "ava.williams@example.com",
//       phone: "+1 (555) 789-0123",
//       lastVisit: "Jan 18, 2025",
//       visits: 12,
//       pricingOption: "At-Risk",
//       expirationDate: "Feb 18, 2025",
//       staff: "John Doe",
//       crossRegionalVisit: "Yes",
//       visitType: "Personal Training",
//       bookingMethod: "Online",
//       referralType: "Friend",
//       status: "inactive",
//       avatar: "/avatars/ava.jpg",
//     },
//     {
//       id: "CUST-1456",
//       name: "Michael Johnson",
//       email: "michael.johnson@example.com",
//       phone: "+1 (555) 890-1234",
//       lastVisit: "Mar 10, 2025",
//       visits: 19,
//       pricingOption: "Regular",
//       expirationDate: "Apr 10, 2025",
//       staff: "Jane Smith",
//       crossRegionalVisit: "No",
//       visitType: "Group Class",
//       bookingMethod: "Phone",
//       referralType: "Advertisement",
//       status: "active",
//       avatar: "/avatars/michael.jpg",
//     },
//     {
//       id: "CUST-1234",
//       name: "Isabella Garcia",
//       email: "isabella.garcia@example.com",
//       phone: "+1 (555) 901-2345",
//       lastVisit: "Feb 28, 2025",
//       visits: 7,
//       pricingOption: "Occasional",
//       expirationDate: "Mar 28, 2025",
//       staff: "John Doe",
//       crossRegionalVisit: "Yes",
//       visitType: "Personal Training",
//       bookingMethod: "Online",
//       referralType: "Friend",
//       status: "active",
//       avatar: "/avatars/isabella.jpg",
//     },
//     {
//       id: "CUST-1098",
//       name: "William Smith",
//       email: "william.smith@example.com",
//       phone: "+1 (555) 012-3456",
//       lastVisit: "Mar 27, 2025",
//       visits: 37,
//       pricingOption: "VIP",
//       expirationDate: "Apr 27, 2025",
//       staff: "Jane Smith",
//       crossRegionalVisit: "No",
//       visitType: "Group Class",
//       bookingMethod: "Phone",
//       referralType: "Advertisement",
//       status: "active",
//       avatar: "/avatars/william.jpg",
//     },
//   ]

//   const handleViewProfile = (customerId: string) => {
//     console.log("View profile for customer:", customerId)
//     // This will be replaced with your Supabase function
//   }

//   const handleSendEmail = (customerId: string) => {
//     console.log("Send email to customer:", customerId)
//     // This will be replaced with your Supabase function
//   }

//   const handleViewDetails = (customerId: string) => {
//     console.log("View details for customer:", customerId)
//     // This will be replaced with your Supabase function
//   }

//   const handleEditCustomer = (customerId: string) => {
//     console.log("Edit customer:", customerId)
//     // This will be replaced with your Supabase function
//   }

//   const handleExportData = () => {
//     console.log("Export customer data")
//     // This will be replaced with your Supabase function
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <CustomerTable
//         customers={customers}
//         onViewProfile={handleViewProfile}
//         onSendEmail={handleSendEmail}
//         onViewDetails={handleViewDetails}
//         onEditCustomer={handleEditCustomer}
//         onExportData={handleExportData}
//       />
//     </div>
//   )
// }
