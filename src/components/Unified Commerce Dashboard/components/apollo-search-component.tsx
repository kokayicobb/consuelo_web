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

const ApolloSearchComponent = () => {
  const [searchForm, setSearchForm] = useState({
    jobTitle: "",
    industry: "any",
    location: "",
    companySize: "any",
    experienceLevel: "any",
  });

  const [maxResults, setMaxResults] = useState("200"); // NEW: Max results selector

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

    // Use multi-page search if more than 100 results requested
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Apollo Search</h1>
        <p className="mt-1 text-gray-600">
          Find and connect with business professionals
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Summary */}
      {searchSummary && (
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

      {/* Search Form */}
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
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
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
                onValueChange={(value) => handleInputChange("industry", value)}
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
                onChange={(e) => handleInputChange("location", e.target.value)}
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

            {/* NEW: Max Results Selector */}
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
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
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

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Search Results</h2>
            <div className="text-sm text-gray-600">
              {results.length} contact{results.length !== 1 ? "s" : ""} found
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((contact) => (
                <Card
                  key={contact.id}
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
                                <span className="text-gray-500">📧</span>
                                <a
                                  href={`mailto:${contact.email}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {contact.email}
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">📧</span>
                                <span className="italic text-gray-400">
                                  Email not available
                                </span>
                              </div>
                            )}

                            {contact.phone ? (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">📞</span>
                                <a
                                  href={`tel:${contact.phone}`}
                                  className="text-blue-600 hover:underline"
                                >
                                  {contact.phone}
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">📞</span>
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
          ) : (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="py-12 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No contacts found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria
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
