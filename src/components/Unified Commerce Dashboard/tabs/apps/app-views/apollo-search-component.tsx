import React, { useState } from "react";
import {
  Search,
  Building,
  MapPin,
  Users,
  Briefcase,
  GraduationCap,
  AlertCircle,
  Info,
  Building2,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Download,
  Filter,
  Loader2,
  User,
  Calendar,
  Globe,
  ChevronRight,
  ChevronLeft,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  phone_numbers?: string[];
  linkedin_url: string;
  photo_url?: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  headline?: string;
  departments?: string[];
  seniority?: string;
  organization: {
    id: string;
    name: string;
    website_url?: string;
    linkedin_url?: string;
    industry?: string;
    estimated_num_employees?: number;
    logo_url?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface CompanySearchResponse {
  contacts: ApolloContact[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

const ApolloSearchComponent = () => {
  // Search mode state
  const [searchMode, setSearchMode] = useState<"general" | "company">("general");

  // General search form state
  const [searchForm, setSearchForm] = useState({
    jobTitle: "",
    industry: "any",
    location: "",
    companySize: "any",
    experienceLevel: "any",
  });

  // General search pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const perPage = 25;

  // General search results state
  const [results, setResults] = useState<ApolloContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Company search state
  const [companyName, setCompanyName] = useState("");
  const [companyContacts, setCompanyContacts] = useState<ApolloContact[]>([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [companySearchError, setCompanySearchError] = useState<string | null>(null);
  const [companyPagination, setCompanyPagination] = useState({
    page: 1,
    per_page: 25,
    total_entries: 0,
    total_pages: 0,
  });
  const [companyFilters, setCompanyFilters] = useState({
    seniority_levels: [] as string[],
    departments: [] as string[],
    title_keywords: [] as string[],
  });
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);

  // Reveal state - tracks which contacts have revealed info
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());
  const [revealingContacts, setRevealingContacts] = useState<Set<string>>(new Set());
  const [enrichedData, setEnrichedData] = useState<Record<string, any>>({});

  // Filter options for company search
  const seniorityOptions = [
    "c_suite",
    "founder",
    "owner",
    "partner",
    "vp",
    "head",
    "director",
    "manager",
    "senior",
    "entry",
    "intern",
    "individual_contributor",
  ];

  const departmentOptions = [
    "executive",
    "finance",
    "information_technology",
    "marketing",
    "operations",
    "sales",
    "engineering",
    "human_resources",
    "legal",
    "consulting",
    "education",
  ];

  // General search function - now with pagination
  const searchContacts = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/apollo/search-paginated", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...searchForm,
          page: page,
          per_page: perPage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      
      setResults(data.people || []);
      setCurrentPage(page);
      setTotalPages(data.pagination?.total_pages || 0);
      setTotalResults(data.pagination?.total_entries || 0);
      setHasSearched(true);
      
      // Clear revealed contacts when doing a new search (page 1)
      if (page === 1) {
        setRevealedContacts(new Set());
        setEnrichedData({});
      }
    } catch (err: any) {
      setError(err.message || "Failed to search contacts");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Company search function with pagination
  const searchCompanyPeople = async (page: number = 1) => {
    if (!companyName.trim()) {
      setCompanySearchError("Please enter a company name");
      return;
    }

    setCompanySearchLoading(true);
    setCompanySearchError(null);
    setHasSearched(true);

    try {
      const searchParams = {
        q_organization_name: companyName.trim(),
        page: page,
        per_page: 25,
        person_seniorities: companyFilters.seniority_levels,
        person_departments: companyFilters.departments,
        person_titles: companyFilters.title_keywords,
      };

      const response = await fetch("/api/apollo/search-company-people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP Error: ${response.status}`);
      }

      const data: CompanySearchResponse = await response.json();

      setCompanyContacts(data.contacts || []);
      setCompanyPagination(data.pagination);
      
      // Clear revealed contacts when doing a new search (page 1)
      if (page === 1) {
        setRevealedContacts(new Set());
        setEnrichedData({});
      }
    } catch (err: any) {
      console.error("Apollo company search error:", err);
      setCompanySearchError(err.message || "Failed to search company contacts");
      setCompanyContacts([]);
    } finally {
      setCompanySearchLoading(false);
    }
  };

  const handleSearch = () => {
    searchContacts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      searchContacts(newPage);
      document.querySelector('.results-container')?.scrollTo(0, 0);
    }
  };

  const handleCompanyPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= companyPagination.total_pages) {
      searchCompanyPeople(newPage);
      document.querySelector('.results-container')?.scrollTo(0, 0);
    }
  };

  const toggleReveal = async (contactId: string, contactEmail?: string) => {
    // If already revealed, just toggle visibility
    if (revealedContacts.has(contactId)) {
      setRevealedContacts(prev => {
        const newSet = new Set(prev);
        newSet.delete(contactId);
        return newSet;
      });
      return;
    }

    // If we already have enriched data, just reveal it
    if (enrichedData[contactId]) {
      setRevealedContacts(prev => new Set(prev).add(contactId));
      return;
    }

    // If no email available, we can't enrich
    if (!contactEmail) {
      // Still reveal to show whatever data we have
      setRevealedContacts(prev => new Set(prev).add(contactId));
      return;
    }

    // Enrich the contact to get full details
    setRevealingContacts(prev => new Set(prev).add(contactId));
    
    try {
      const response = await fetch('/api/apollo/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: contactEmail }),
      });

      if (response.ok) {
        const enrichedContact = await response.json();
        setEnrichedData(prev => ({
          ...prev,
          [contactId]: enrichedContact
        }));
      }
      
      setRevealedContacts(prev => new Set(prev).add(contactId));
    } catch (error) {
      console.error('Failed to enrich contact:', error);
      // Still reveal to show whatever data we have
      setRevealedContacts(prev => new Set(prev).add(contactId));
    } finally {
      setRevealingContacts(prev => {
        const newSet = new Set(prev);
        newSet.delete(contactId);
        return newSet;
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCompanyFilter = (
    filterType: keyof typeof companyFilters,
    value: string,
  ) => {
    setCompanyFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearCompanyFilters = () => {
    setCompanyFilters({
      seniority_levels: [],
      departments: [],
      title_keywords: [],
    });
  };

  const hasActiveCompanyFilters = Object.values(companyFilters).some(
    (arr) => arr.length > 0,
  );

  const exportContacts = () => {
    const contactsToExport = searchMode === "general" ? results : companyContacts;
    if (contactsToExport.length === 0) return;

    const csvData = contactsToExport.map((contact) => {
      const enriched = enrichedData[contact.id];
      const displayEmail = enriched?.email || contact.email;
      const displayLinkedIn = enriched?.linkedin_url || contact.linkedin_url;
      
      return {
        Name: contact.name,
        Title: contact.title,
        Email: revealedContacts.has(contact.id) ? displayEmail : "Hidden",
        Phone: contact.phone || "",
        Company: contact.organization?.name || "",
        LinkedIn: revealedContacts.has(contact.id) ? displayLinkedIn : "Hidden",
        Location: contact.location || "",
      };
    });

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row] || ""}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = searchMode === "general" 
      ? `apollo_contacts_page_${currentPage}.csv`
      : `${companyName.replace(/[^a-z0-9]/gi, "_")}_contacts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render contact card (shared between general and company search)
  const renderContactCard = (contact: ApolloContact) => {
    const isRevealed = revealedContacts.has(contact.id);
    const isRevealing = revealingContacts.has(contact.id);
    const enriched = enrichedData[contact.id];
    
    // Use enriched data if available, otherwise use search data
    const displayEmail = enriched?.email || contact.email;
    const displayLinkedIn = enriched?.linkedin_url || contact.linkedin_url;
    const displayPhone = enriched?.phone || contact.phone || (contact.phone_numbers && contact.phone_numbers[0]);
    
    return (
      <Card key={contact.id} className="border-slate-200 bg-white">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700">
                  {contact.first_name?.charAt(0) || ""}
                  {contact.last_name?.charAt(0) || ""}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {contact.name}
                  </h3>
                  <p className="font-medium text-slate-600">
                    {contact.title}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">
                    {contact.organization?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700">
                    {contact.location || "N/A"}
                  </span>
                </div>
                
                {isRevealed && (
                  <>
                    {displayEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <a
                          href={`mailto:${displayEmail}`}
                          className="text-blue-600 hover:underline"
                        >
                          {displayEmail}
                        </a>
                      </div>
                    )}
                    {displayPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-700">
                          {displayPhone}
                        </span>
                      </div>
                    )}
                    {displayLinkedIn && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-4 w-4 text-slate-400" />
                        <a
                          href={displayLinkedIn}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Profile
                        </a>
                      </div>
                    )}
                    {!displayEmail && !displayLinkedIn && !displayPhone && (
                      <p className="text-sm text-slate-500 italic">
                        No contact details available
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleReveal(contact.id, contact.email)}
              disabled={isRevealing}
              className="ml-4 border-slate-300"
            >
              {isRevealing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isRevealed ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Reveal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Fixed Header and Search Controls */}
      <div className="flex-shrink-0 space-y-4 bg-white p-4 shadow-sm">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Apollo Search</h1>
          <div className="flex rounded-lg bg-slate-200 p-1">
            <button
              onClick={() => setSearchMode("general")}
              className={`flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                searchMode === "general"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Users className="mr-2 h-4 w-4" />
              General
            </button>
            <button
              onClick={() => setSearchMode("company")}
              className={`flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                searchMode === "company"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </button>
          </div>
        </div>

        {/* General Search Form */}
        {searchMode === "general" && (
          <Card className="border-slate-200 bg-white shadow-none">
            <CardContent className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="job-title" className="text-slate-700">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Loan Officer"
                    value={searchForm.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className="border-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-slate-700">Industry</Label>
                  <Select
                    value={searchForm.industry}
                    onValueChange={(v) => handleInputChange("industry", v)}
                  >
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Industry</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                      <SelectItem value="financial services">Financial Services</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="real estate">Real Estate</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-700">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Charlotte, NC"
                    value={searchForm.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="border-slate-300"
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  variant="default"
                 
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Company Search Form */}
        {searchMode === "company" && (
          <Card className="border-slate-200 bg-white shadow-none">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-2 bg-white">
                <Label htmlFor="company-name" className="text-slate-700">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="e.g., Google, Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && searchCompanyPeople(1)
                  }
                  className="border-slate-300"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => searchCompanyPeople(1)}
                  disabled={companySearchLoading || !companyName.trim()}
                  variant="default"
                
                >
                  {companySearchLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCompanyFilters(!showCompanyFilters)}
                  className={`border-slate-300 ${
                    hasActiveCompanyFilters ? "border-blue-500" : ""
                  }`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {hasActiveCompanyFilters && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                      {Object.values(companyFilters).reduce(
                        (sum, arr) => sum + arr.length,
                        0,
                      )}
                    </span>
                  )}
                </Button>
              </div>
              {showCompanyFilters && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900">
                      Search Filters
                    </h3>
                    {hasActiveCompanyFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearCompanyFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="mb-2 block text-slate-700">Seniority Level</Label>
                      <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-slate-300 p-2">
                        {seniorityOptions.map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={companyFilters.seniority_levels.includes(
                                option,
                              )}
                              onChange={() =>
                                updateCompanyFilter("seniority_levels", option)
                              }
                              className="mr-2 rounded"
                            />
                            <span className="text-sm capitalize text-slate-700">
                              {option.replace(/_/g, " ")}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Scrollable Results Area */}
      <div className="results-container min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-slate-200 bg-slate-50 p-4">
        {/* Status Messages */}
        <div className="space-y-2">
          {error && searchMode === "general" && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {companySearchError && searchMode === "company" && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{companySearchError}</AlertDescription>
            </Alert>
          )}
          {searchMode === "general" && hasSearched && totalResults > 0 && (
            <Alert className="border-slate-200 bg-white">
              <Info className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-slate-700">
                Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, totalResults)} of {totalResults.toLocaleString()} contacts
              </AlertDescription>
            </Alert>
          )}
          {searchMode === "company" && companyContacts.length > 0 && (
            <Alert className="border-slate-200 bg-white">
              <Info className="h-4 w-4 text-slate-600" />
              <AlertDescription className="text-slate-700">
                Showing {((companyPagination.page - 1) * companyPagination.per_page) + 1}-{Math.min(companyPagination.page * companyPagination.per_page, companyPagination.total_entries)} of {companyPagination.total_entries.toLocaleString()} contacts
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            {((searchMode === "general" && results.length > 0) || 
              (searchMode === "company" && companyContacts.length > 0)) && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportContacts}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export Page
                  </Button>
                </div>

                <div className="grid gap-4">
                  {searchMode === "general" 
                    ? results.map((contact) => renderContactCard(contact))
                    : companyContacts.map((contact) => renderContactCard(contact))
                  }
                </div>

                {/* Pagination Controls */}
                {searchMode === "general" && totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                      className="border-slate-300"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-slate-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                      className="border-slate-300"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                {searchMode === "company" && companyPagination.total_pages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompanyPageChange(companyPagination.page - 1)}
                      disabled={companyPagination.page === 1 || companySearchLoading}
                      className="border-slate-300"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    <span className="text-sm text-slate-600">
                      Page {companyPagination.page} of {companyPagination.total_pages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompanyPageChange(companyPagination.page + 1)}
                      disabled={companyPagination.page === companyPagination.total_pages || companySearchLoading}
                      className="border-slate-300"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* No Results Message */}
            {((searchMode === "general" && results.length === 0) ||
              (searchMode === "company" && companyContacts.length === 0)) && 
              !isLoading && !companySearchLoading && (
              <div className="py-12 text-center text-slate-500">
                <Search className="mx-auto mb-2 h-10 w-10 text-slate-400" />
                <h3 className="font-medium text-slate-800">No contacts found</h3>
                <p className="text-sm">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApolloSearchComponent;