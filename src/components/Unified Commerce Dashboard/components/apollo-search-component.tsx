// components/apollo-search-component.tsx
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
      setHasSearched(true);
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
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <div className="border-b border-gray-200 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apollo Search</h1>
            <p className="mt-1 text-gray-600">
              Find and connect with business professionals
            </p>
          </div>

          {/* Search Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setSearchMode("general")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                searchMode === "general"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="mr-2 inline h-4 w-4" />
              General Search
            </button>
            <button
              onClick={() => setSearchMode("company")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                searchMode === "company"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Building2 className="mr-2 inline h-4 w-4" />
              Company Search
            </button>
          </div>
        </div>
      </div>

      {/* Error Alerts */}
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

      {/* Search Summary */}
      {searchSummary && searchMode === "general" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Found {searchSummary.returned} contacts
            {searchSummary.totalAvailable && (
              <>
                {" "}
                out of {searchSummary.totalAvailable.toLocaleString()} available
              </>
            )}
            {searchSummary.pagesFetched > 1 && (
              <> (searched {searchSummary.pagesFetched} pages)</>
            )}
            {searchSummary.withEmail > 0 && (
              <> • {searchSummary.withEmail} with email</>
            )}
            {searchSummary.withPhone > 0 && (
              <> • {searchSummary.withPhone} with phone</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Company Search Results Summary */}
      {searchMode === "company" && companyContacts.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Found {companyContacts.length} contacts at {companyName}
            {companyPagination.total_entries > companyContacts.length && (
              <>
                {" "}
                • {companyPagination.total_entries.toLocaleString()} total
                available
              </>
            )}
            • {companyContacts.filter((c) => c.email).length} with email •{" "}
            {companyContacts.filter((c) => c.phone_numbers?.[0]).length} with
            phone
          </AlertDescription>
        </Alert>
      )}

      {/* General Search Form */}
      {searchMode === "general" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Search className="h-5 w-5" />
              Search Criteria
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="job-title" className="text-sm font-medium">
                  Job Title
                </Label>
                <Input
                  id="job-title"
                  placeholder="e.g. Loan Officer, Commercial Banker"
                  value={searchForm.jobTitle}
                  onChange={(e) =>
                    handleInputChange("jobTitle", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">
                  Industry
                </Label>
                <Select
                  value={searchForm.industry}
                  onValueChange={(value) =>
                    handleInputChange("industry", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Industry</SelectItem>
                    <SelectItem value="banking">Banking</SelectItem>
                    <SelectItem value="financial services">
                      Financial Services
                    </SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="real estate">Real Estate</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Charlotte, NC or Remote"
                  value={searchForm.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              {/* Company Size */}
              <div className="space-y-2">
                <Label htmlFor="company-size" className="text-sm font-medium">
                  Company Size
                </Label>
                <Select
                  value={searchForm.companySize}
                  onValueChange={(value) =>
                    handleInputChange("companySize", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Size</SelectItem>
                    <SelectItem value="1,50">1-50 employees</SelectItem>
                    <SelectItem value="51,200">51-200 employees</SelectItem>
                    <SelectItem value="201,1000">201-1000 employees</SelectItem>
                    <SelectItem value="1001,">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Max Results Selector */}
              <div className="space-y-2">
                <Label htmlFor="max-results" className="text-sm font-medium">
                  Maximum Results
                </Label>
                <Select value={maxResults} onValueChange={setMaxResults}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select max results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 contacts</SelectItem>
                    <SelectItem value="100">100 contacts</SelectItem>
                    <SelectItem value="200">200 contacts</SelectItem>
                    <SelectItem value="300">300 contacts</SelectItem>
                    <SelectItem value="500">500 contacts</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  💡 More results = longer search time & more credits
                </p>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm font-medium">
                  Experience Level
                </Label>
                <Select
                  value={searchForm.experienceLevel}
                  onValueChange={(value) =>
                    handleInputChange("experienceLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Level</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Button */}
            <div className="pt-4">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {parseInt(maxResults) > 100
                      ? "Searching Multiple Pages..."
                      : "Searching..."}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search {maxResults} Contacts
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Search Form */}
      {searchMode === "company" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" />
              Company People Search
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Name Input */}
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-sm font-medium">
                Company Name
              </Label>
              <div className="relative">
                <Building2
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <Input
                  id="company-name"
                  placeholder="Enter company name (e.g., Google, Microsoft, Apple)"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && searchCompanyPeople(1)
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters Toggle */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCompanyFilters(!showCompanyFilters)}
                className={
                  showCompanyFilters || hasActiveCompanyFilters
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : ""
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
              <Button
                onClick={() => searchCompanyPeople(1)}
                disabled={companySearchLoading || !companyName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {companySearchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search People
                  </>
                )}
              </Button>
            </div>

            {/* Company Filters Panel */}
            {showCompanyFilters && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Search Filters</h3>
                  {hasActiveCompanyFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCompanyFilters}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Seniority Levels */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Seniority Level
                    </Label>
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

                  {/* Departments */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Department
                    </Label>
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded border p-2">
                      {departmentOptions.map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={companyFilters.departments.includes(
                              option,
                            )}
                            onChange={() =>
                              updateCompanyFilter("departments", option)
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

                  {/* Title Keywords */}
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Title Keywords
                    </Label>
                    <Input
                      placeholder="e.g., engineer, manager"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && e.currentTarget.value.trim()) {
                          updateCompanyFilter(
                            "title_keywords",
                            e.currentTarget.value.trim(),
                          );
                          e.currentTarget.value = "";
                        }
                      }}
                      className="mb-2"
                    />
                    <div className="flex flex-wrap gap-1">
                      {companyFilters.title_keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                        >
                          {keyword}
                          <button
                            onClick={() =>
                              updateCompanyFilter("title_keywords", keyword)
                            }
                            className="rounded-full p-0.5 hover:bg-blue-200"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {searchMode === "general"
                  ? `${results.length} contact${results.length !== 1 ? "s" : ""} found`
                  : `${companyContacts.length} contact${companyContacts.length !== 1 ? "s" : ""} found`}
              </div>
              {searchMode === "company" && companyContacts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportCompanyContacts}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </Button>
              )}
            </div>
          </div>

          {/* General Search Results */}
          {searchMode === "general" && results.length > 0 && (
            <div className="grid gap-4">
              {results.map((contact, index) => (
                <Card
                  key={`general-${contact.id}-${index}`}
                  className="transition-shadow duration-200 hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {contact.organization?.name ||
                                  "Company not available"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-700">
                                {contact.location || "Location not available"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {contact.email ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {contact.email}
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="italic text-gray-400">
                                  Email not available
                                </span>
                              </div>
                            )}

                            {contact.phone ? (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {contact.phone}
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="italic text-gray-400">
                                  Phone not available
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 border-t border-gray-100 pt-3">
                          <div className="text-xs text-gray-500">
                            Apollo ID: {contact.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Company Search Results */}
          {searchMode === "company" && companyContacts.length > 0 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {companyContacts.map((contact, index) => (
                  <Card
                    key={`${contact.id}-${index}`}
                    className="transition-shadow duration-200 hover:shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-3">
                            {contact.photo_url ? (
                              <img
                                src={contact.photo_url}
                                alt={contact.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                                {contact.first_name?.charAt(0) || ""}
                                {contact.last_name?.charAt(0) || ""}
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {contact.name}
                              </h3>
                              <p className="font-medium text-blue-600">
                                {contact.title}
                              </p>
                              {contact.headline && (
                                <p className="mt-1 text-sm text-gray-600">
                                  {contact.headline}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">
                                  {contact.organization?.name || companyName}
                                </span>
                                {contact.organization?.website_url && (
                                  <a
                                    href={contact.organization.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-gray-700">
                                  {[
                                    contact.city,
                                    contact.state,
                                    contact.country,
                                  ]
                                    .filter(Boolean)
                                    .join(", ") || "Location not available"}
                                </span>
                              </div>
                              {contact.departments &&
                                contact.departments.length > 0 && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700">
                                      {contact.departments.join(", ")}
                                    </span>
                                  </div>
                                )}
                              {contact.seniority && (
                                <div className="flex items-center gap-2 text-sm">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="capitalize text-gray-700">
                                    {contact.seniority.replace(/_/g, " ")}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              {contact.email ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-4 w-4 text-gray-500" />
                                  <span className="italic text-gray-400">
                                    Email not available
                                  </span>
                                </div>
                              )}

                              {contact.phone_numbers &&
                              contact.phone_numbers[0] ? (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <a
                                    href={`tel:${contact.phone_numbers[0]}`}
                                    className="text-blue-600 hover:underline"
                                  >
                                    {contact.phone_numbers[0]}
                                  </a>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="italic text-gray-400">
                                    Phone not available
                                  </span>
                                </div>
                              )}

                              {contact.linkedin_url && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Linkedin className="h-4 w-4 text-gray-500" />
                                  <a
                                    href={contact.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-blue-600 hover:underline"
                                  >
                                    LinkedIn Profile
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                Apollo ID: {contact.id}
                              </div>
                              {contact.organization && (
                                <div className="text-xs text-gray-500">
                                  {contact.organization
                                    .estimated_num_employees && (
                                    <>
                                      Company size: ~
                                      {contact.organization.estimated_num_employees.toLocaleString()}{" "}
                                      employees
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More Button for Company Search */}
              {companyPagination.page < companyPagination.total_pages && (
                <div className="pt-4 text-center">
                  <Button
                    onClick={loadMoreCompanyContacts}
                    disabled={companySearchLoading}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    {companySearchLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        Load More (
                        {companyPagination.total_pages - companyPagination.page}{" "}
                        pages remaining)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {((searchMode === "general" && results.length === 0) ||
            (searchMode === "company" && companyContacts.length === 0)) && (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No contacts found
                </h3>
                <p className="text-gray-600">
                  {searchMode === "company"
                    ? "Try searching for a different company or adjusting your filters"
                    : "Try adjusting your search criteria"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ApolloSearchComponent;
