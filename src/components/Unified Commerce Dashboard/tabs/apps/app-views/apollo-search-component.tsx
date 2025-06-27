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
  X,
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
import { useApolloSearch } from "@/hooks/useApolloSearch";

// Types for Apollo Company Search
interface ApolloContact {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email: string;
  phone_numbers: string[];
  linkedin_url: string;
  photo_url: string;
  location: string;
  city: string;
  state: string;
  country: string;
  headline: string;
  departments: string[];
  seniority: string;
  organization: {
    id: string;
    name: string;
    website_url: string;
    linkedin_url: string;
    industry: string;
    estimated_num_employees: number;
    logo_url: string;
    city: string;
    state: string;
    country: string;
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
  // Existing state
  const [searchForm, setSearchForm] = useState({
    jobTitle: "",
    industry: "any",
    location: "",
    companySize: "any",
    experienceLevel: "any",
  });
  const [maxResults, setMaxResults] = useState("200");

  // New state for company search
  const [searchMode, setSearchMode] = useState<"general" | "company">(
    "general",
  );
  const [companyName, setCompanyName] = useState("");
  const [companyContacts, setCompanyContacts] = useState<ApolloContact[]>([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [companySearchError, setCompanySearchError] = useState<string | null>(
    null,
  );
  const [companyPagination, setCompanyPagination] = useState({
    page: 1,
    per_page: 200,
    total_entries: 0,
    total_pages: 0,
  });
  const [companyFilters, setCompanyFilters] = useState({
    seniority_levels: [] as string[],
    departments: [] as string[],
    title_keywords: [] as string[],
  });
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);

  // Existing hooks
  const {
    search,
    searchMultiple,
    isLoading,
    error,
    results,
    searchSummary,
    clearError,
  } = useApolloSearch();
  const [hasSearched, setHasSearched] = useState(false);

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

  // Company search function
  const searchCompanyPeople = async (page: number = 1) => {
    if (!companyName.trim()) {
      setCompanySearchError("Please enter a company name");
      return;
    }

    setCompanySearchLoading(true);
    setCompanySearchError(null);
    setHasSearched(true); // Set hasSearched on new search

    try {
      const searchParams = {
        q_organization_name: companyName.trim(),
        page: page,
        per_page: 100,
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

      if (page === 1) {
        setCompanyContacts(data.contacts || []);
      } else {
        setCompanyContacts((prev) => [...prev, ...(data.contacts || [])]);
      }

      setCompanyPagination(data.pagination);
    } catch (err: any) {
      console.error("Apollo company search error:", err);
      setCompanySearchError(err.message || "Failed to search company contacts");
      setCompanyContacts([]);
    } finally {
      setCompanySearchLoading(false);
    }
  };

  const loadMoreCompanyContacts = () => {
    if (companyPagination.page < companyPagination.total_pages) {
      searchCompanyPeople(companyPagination.page + 1);
    }
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

  const exportCompanyContacts = () => {
    if (companyContacts.length === 0) return;

    const csvData = companyContacts.map((contact) => ({
      Name: contact.name,
      Title: contact.title,
      Email: contact.email,
      Phone: contact.phone_numbers?.[0] || "",
      Company: contact.organization?.name || "",
      LinkedIn: contact.linkedin_url,
      Location:
        `${contact.city || ""}, ${contact.state || ""}, ${contact.country || ""}`.replace(
          /^,\s*|,\s*$/g,
          "",
        ),
      Department: contact.departments?.[0] || "",
      Seniority: contact.seniority,
    }));

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
    a.download = `${companyName.replace(/[^a-z0-9]/gi, "_")}_contacts.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Existing functions
  const handleSearch = async () => {
    setHasSearched(true);
    clearError();

    const searchParams = {
      jobTitle: searchForm.jobTitle,
      industry: searchForm.industry,
      location: searchForm.location,
      companySize: searchForm.companySize,
      experienceLevel: searchForm.experienceLevel,
    };

    if (parseInt(maxResults) > 100) {
      await searchMultiple(searchParams, parseInt(maxResults));
    } else {
      await search(searchParams);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasActiveCompanyFilters = Object.values(companyFilters).some(
    (arr) => arr.length > 0,
  );

  return (
    // This container is designed for a sidebar. Give its parent a defined height (e.g., h-screen).
    <div className="flex h-full flex-col bg-white">
      {/* ================================== */}
      {/* == NON-SCROLLING CONTROLS AREA === */}
      {/* ================================== */}
      <div className="flex-shrink-0 space-y-4 p-4">
        {/* Header with Mode Toggle */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Apollo Search</h1>
          <div className="flex rounded-lg bg-gray-200 p-1">
            <button
              onClick={() => setSearchMode("general")}
              className={`flex items-center justify-center rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                searchMode === "general"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
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
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </button>
          </div>
        </div>

        {/* General Search Form */}
        {searchMode === "general" && (
          <Card className="border-none bg-white shadow-none">
            <CardContent className="space-y-4 p-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="job-title">Job Title</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g. Loan Officer"
                    value={searchForm.jobTitle}
                    onChange={(e) =>
                      handleInputChange("jobTitle", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={searchForm.industry}
                    onValueChange={(v) => handleInputChange("industry", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Industry</SelectItem>
                      <SelectItem value="banking">Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Charlotte, NC"
                    value={searchForm.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
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
          <Card className="border-none bg-white shadow-none">
            <CardContent className="space-y-4 p-0">
              <div className="space-y-2 bg-white">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="e.g., Google, Microsoft"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && searchCompanyPeople(1)
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => searchCompanyPeople(1)}
                  disabled={companySearchLoading || !companyName.trim()}
                  variant="default"
                >
                  {companySearchLoading && !loadMoreCompanyContacts ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCompanyFilters(!showCompanyFilters)}
                  className={
                    hasActiveCompanyFilters ? "border-blue-500" : ""
                  }
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
                <div className="space-y-4 border-t pt-4">
                  {/* ... Company filter content ... */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
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
                      <Label className="mb-2 block">Seniority Level</Label>
                      <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-2">
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
                            <span className="text-sm capitalize">
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

      {/* ================================= */}
      {/* ===== SCROLLING RESULTS AREA ==== */}
      {/* ================================= */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto border-t border-neutral-200 p-4">
        {/* Alerts and Summaries */}
        <div className="space-y-2">
          {error && searchMode === "general" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {companySearchError && searchMode === "company" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{companySearchError}</AlertDescription>
            </Alert>
          )}
          {searchSummary && searchMode === "general" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Found {searchSummary.returned} contacts
              </AlertDescription>
            </Alert>
          )}
          {searchMode === "company" && companyContacts.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Showing {companyContacts.length} of{" "}
                {companyPagination.total_entries.toLocaleString()} contacts
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Search Results</h2>
              {searchMode === "company" && companyContacts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCompanyContacts}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </Button>
              )}
            </div>

            {/* General Search Results */}
            {searchMode === "general" && results.length > 0 && (
              <div className="grid gap-4">
                {results.map((contact, index) => (
                  <Card key={`general-${contact.id}-${index}`}>
                    <CardContent className="p-4">
                      {/* Using original detailed card layout */}
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                          {contact.first_name?.charAt(0) || ""}
                          {contact.last_name?.charAt(0) || ""}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {contact.name}
                          </h3>
                          <p className="font-medium text-blue-600">
                            {contact.title}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {contact.organization?.name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">
                            {contact.location || "N/A"}
                          </span>
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {contact.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Company Search Results */}
            {searchMode === "company" && companyContacts.length > 0 && (
              <div className="space-y-4">
                {companyContacts.map((contact, index) => (
                  <Card key={`${contact.id}-${index}`}>
                    <CardContent className="p-4">
                      {/* Using original detailed card layout */}
                      <div className="flex items-start gap-3">
                        {contact.photo_url ? (
                          <img
                            src={contact.photo_url}
                            alt={contact.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                            {contact.first_name?.charAt(0) || ""}
                            {contact.last_name?.charAt(0) || ""}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {contact.name}
                          </h3>
                          <p className="font-medium text-blue-600">
                            {contact.title}
                          </p>
                          <div className="mt-2 space-y-1 text-sm">
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.linkedin_url && (
                              <div className="flex items-center gap-2">
                                <Linkedin className="h-4 w-4 text-gray-400" />
                                <a
                                  href={contact.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  LinkedIn
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Load More Button */}
                {companyPagination.page < companyPagination.total_pages && (
                  <Button
                    onClick={loadMoreCompanyContacts}
                    disabled={companySearchLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {companySearchLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Load More"
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* No Results Message */}
            {((searchMode === "general" && results.length === 0) ||
              (searchMode === "company" &&
                companyContacts.length === 0)) && (
              <div className="py-12 text-center text-gray-500">
                <Search className="mx-auto mb-2 h-10 w-10" />
                <h3 className="font-medium text-gray-800">No contacts found</h3>
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