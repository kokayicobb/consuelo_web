
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Search,
  MapPin,
  Phone,
  Globe,
  Star,
  Building,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  Twitter,
  Users,
  DollarSign,
  Briefcase,
  Calendar,
  ChevronRight,
  X,
  Filter,
  Download,
  Upload,
  Save,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  Copy,
  RefreshCw,
  ChartBar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Drawer } from "vaul"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/Playground/components/ui/checkbox"

interface Place {
  id: string
  name: string
  address: string
  phone?: string
  website?: string
  email?: string
  rating?: number
  userRatingsTotal?: number
  businessStatus?: string
  types?: string[]
  location: {
    lat: number
    lng: number
  }
  openingHours?: {
    openNow?: boolean
    weekdayText?: string[]
  }
  priceLevel?: number
  photos?: Array<{
    photoReference: string
    width: number
    height: number
  }>
  // Enrichment fields
  linkedIn?: string
  facebook?: string
  instagram?: string
  twitter?: string
  industry?: string
  companySize?: string
  revenue?: string
  decisionMakers?: Array<{
    name: string
    title: string
    email?: string
    linkedIn?: string
  }>
}

interface SavedLead extends Place {
  savedAt?: string
  status?: string
  assignedTo?: string
  tags?: string[]
  notes?: string
}

// Business types from Google Places
const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurants" },
  { value: "store", label: "Retail Stores" },
  { value: "real_estate_agency", label: "Real Estate" },
  { value: "lawyer", label: "Law Firms" },
  { value: "doctor", label: "Medical Practices" },
  { value: "dentist", label: "Dental Offices" },
  { value: "accounting", label: "Accounting Firms" },
  { value: "insurance_agency", label: "Insurance Agencies" },
  { value: "car_dealer", label: "Car Dealerships" },
  { value: "gym", label: "Gyms & Fitness" },
  { value: "beauty_salon", label: "Beauty Salons" },
  { value: "spa", label: "Spas" },
  { value: "veterinary_care", label: "Veterinary Clinics" },
  { value: "school", label: "Schools" },
  { value: "bank", label: "Banks" },
]

const LEAD_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  { value: "qualified", label: "Qualified", color: "bg-green-100 text-green-700" },
  { value: "proposal", label: "Proposal Sent", color: "bg-purple-100 text-purple-700" },
  { value: "negotiation", label: "Negotiation", color: "bg-orange-100 text-orange-700" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-700" },
]

export default function LeadGenerationSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [radius, setRadius] = useState("5000")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [savedLeads, setSavedLeads] = useState<SavedLead[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [isSavingLead, setIsSavingLead] = useState(false)
  const [isEnrichingData, setIsEnrichingData] = useState(false)
  const [enrichmentProgress, setEnrichmentProgress] = useState(0)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  // Initialize Google Maps
  useEffect(() => {
    const loadGoogleMaps = async () => {
      const loader = new (window as any).google.maps.plugins.loader.Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        version: "weekly",
        libraries: ["places"],
      })

      await loader.load()
      initializeMap()
    }

    if (typeof window !== "undefined" && !(window as any).google) {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.onload = () => initializeMap()
      document.head.appendChild(script)
    } else if ((window as any).google) {
      initializeMap()
    }
  }, [])

  const initializeMap = () => {
    const mapElement = document.getElementById("search-map")
    if (!mapElement || mapRef.current) return

    mapRef.current = new google.maps.Map(mapElement, {
      center: { lat: 40.7128, lng: -74.0060 }, // Default to NYC
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
    })

    // Initialize Places Autocomplete for location input
    const locationInput = document.getElementById("location-input") as HTMLInputElement
    if (locationInput) {
      const autocomplete = new google.maps.places.Autocomplete(locationInput, {
        types: ["geocode"],
      })

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place.geometry?.location) {
          mapRef.current?.setCenter(place.geometry.location)
          mapRef.current?.setZoom(14)
        }
      })
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query")
      return
    }

    setIsSearching(true)
    setSearchResults([])
    clearMapMarkers()

    try {
      // Get coordinates if location is provided
      let locationCoords = null
      if (searchLocation && mapRef.current) {
        const geocoder = new google.maps.Geocoder()
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: searchLocation }, (results, status) => {
            if (status === "OK" && results) resolve(results)
            else reject(status)
          })
        })

        if (result[0]?.geometry?.location) {
          locationCoords = {
            lat: result[0].geometry.location.lat(),
            lng: result[0].geometry.location.lng(),
          }
          mapRef.current.setCenter(locationCoords)
        }
      }

      // Call our API
      const response = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          location: locationCoords,
          radius: parseInt(radius),
          type: selectedType || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Search failed")
      }

      setSearchResults(data.places || [])
      setNextPageToken(data.nextPageToken || null)
      
      // Add markers to map
      if (mapRef.current && data.places.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        data.places.forEach((place: Place) => {
          const marker = new google.maps.Marker({
            position: place.location,
            map: mapRef.current!,
            title: place.name,
          })

          marker.addListener("click", () => {
            setSelectedPlace(place)
            setIsDetailDrawerOpen(true)
          })

          markersRef.current.push(marker)
          bounds.extend(place.location)
        })

        mapRef.current.fitBounds(bounds)
      }

      toast.success(`Found ${data.places.length} businesses`)
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search businesses")
    } finally {
      setIsSearching(false)
    }
  }

  const loadMoreResults = async () => {
    if (!nextPageToken || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const response = await fetch(`/api/places/search?pagetoken=${nextPageToken}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load more results")
      }

      setSearchResults(prev => [...prev, ...data.places])
      setNextPageToken(data.nextPageToken || null)

      // Add new markers
      if (mapRef.current && data.places.length > 0) {
        data.places.forEach((place: Place) => {
          const marker = new google.maps.Marker({
            position: place.location,
            map: mapRef.current!,
            title: place.name,
          })

          marker.addListener("click", () => {
            setSelectedPlace(place)
            setIsDetailDrawerOpen(true)
          })

          markersRef.current.push(marker)
        })
      }
    } catch (error) {
      console.error("Load more error:", error)
      toast.error("Failed to load more results")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const clearMapMarkers = () => {
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []
  }

  const saveLead = async (place: Place) => {
    setIsSavingLead(true)
    try {
      const response = await fetch("/api/places/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          place_id: place.id,
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
          email: place.email,
          rating: place.rating,
          user_ratings_total: place.userRatingsTotal,
          business_status: place.businessStatus,
          types: place.types,
          location: place.location,
          opening_hours: place.openingHours,
          price_level: place.priceLevel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("This lead has already been saved")
        } else {
          throw new Error(data.error || "Failed to save lead")
        }
        return
      }

      setSavedLeads(prev => [data.lead, ...prev])
      toast.success("Lead saved successfully")

      // Start enrichment process
      enrichLead(data.lead.id, place)
    } catch (error) {
      console.error("Save lead error:", error)
      toast.error("Failed to save lead")
    } finally {
      setIsSavingLead(false)
    }
  }

  const enrichLead = async (leadId: string, place: Place) => {
    setIsEnrichingData(true)
    setEnrichmentProgress(0)

    try {
      // Simulate enrichment process
      // In real implementation, this would call various APIs
      const steps = [
        { progress: 25, message: "Finding social media profiles..." },
        { progress: 50, message: "Searching for company information..." },
        { progress: 75, message: "Looking for decision makers..." },
        { progress: 100, message: "Enrichment complete!" },
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEnrichmentProgress(step.progress)
        toast.info(step.message)
      }

      // Simulate enriched data
      const enrichedData = {
        linkedIn: `linkedin.com/company/${place.name.toLowerCase().replace(/\s+/g, '-')}`,
        facebook: `facebook.com/${place.name.toLowerCase().replace(/\s+/g, '')}`,
        instagram: `@${place.name.toLowerCase().replace(/\s+/g, '_')}`,
        industry: place.types?.[0] || "Unknown",
        companySize: "10-50 employees",
        revenue: "$1M - $5M",
        decisionMakers: [
          {
            name: "John Doe",
            title: "Owner",
            email: `contact@${place.name.toLowerCase().replace(/\s+/g, '')}.com`,
            linkedIn: "linkedin.com/in/johndoe",
          },
        ],
      }

      // Update lead with enriched data
      await fetch("/api/places/save", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: leadId,
          ...enrichedData,
        }),
      })

      // Update local state
      setSavedLeads(prev =>
        prev.map(lead =>
          lead.id === leadId ? { ...lead, ...enrichedData } : lead
        )
      )

      toast.success("Lead enrichment completed!")
    } catch (error) {
      console.error("Enrichment error:", error)
      toast.error("Failed to enrich lead data")
    } finally {
      setIsEnrichingData(false)
      setEnrichmentProgress(0)
    }
  }

  const exportLeads = () => {
    const csvContent = [
      ["Name", "Address", "Phone", "Website", "Email", "Rating", "Status", "Industry", "Company Size", "Revenue"],
      ...savedLeads.map(lead => [
        lead.name,
        lead.address,
        lead.phone || "",
        lead.website || "",
        lead.email || "",
        lead.rating || "",
        lead.status || "new",
        lead.industry || "",
        lead.companySize || "",
        lead.revenue || "",
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Leads exported successfully")
  }

  const deleteLeads = async (leadIds: string[]) => {
    try {
      const response = await fetch(`/api/places/save?ids=${leadIds.join(",")}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete leads")
      }

      setSavedLeads(prev => prev.filter(lead => !leadIds.includes(lead.id)))
      setSelectedLeads([])
      toast.success(`Deleted ${leadIds.length} lead(s)`)
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Failed to delete leads")
    }
  }

  const getPhotoUrl = (photoReference: string, maxWidth = 400) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
  }

  const renderSearchTab = () => (
    <div className="flex h-full">
      {/* Search Panel */}
      <div className="w-1/2 p-6 overflow-y-auto border-r">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Find New Leads</h2>
            <p className="text-gray-600">Search for businesses and enrich their data</p>
          </div>

          {/* Search Form */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search-query">Search Query</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-query"
                      placeholder="e.g., dentists, restaurants, law firms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location-input">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="location-input"
                      placeholder="Enter city, state, or address"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="business-type">Business Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger id="business-type">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bank">All types</SelectItem>
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="radius">Search Radius</Label>
                    <Select value={radius} onValueChange={setRadius}>
                      <SelectTrigger id="radius">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">1 km</SelectItem>
                        <SelectItem value="5000">5 km</SelectItem>
                        <SelectItem value="10000">10 km</SelectItem>
                        <SelectItem value="25000">25 km</SelectItem>
                        <SelectItem value="50000">50 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search Businesses
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Found {searchResults.length} businesses
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    searchResults.forEach(saveLead)
                  }}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save All
                </Button>
              </div>

              <div className="space-y-3">
                {searchResults.map((place) => (
                  <Card
                    key={place.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedPlace(place)
                      setIsDetailDrawerOpen(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{place.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {place.rating && (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                {place.rating} ({place.userRatingsTotal})
                              </div>
                            )}
                            {place.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {place.phone}
                              </div>
                            )}
                            {place.website && (
                              <Globe className="h-4 w-4" />
                            )}
                          </div>

                          {place.types && place.types.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {place.types.slice(0, 3).map((type) => (
                                <Badge key={type} variant="secondary" className="text-xs">
                                  {type.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            saveLead(place)
                          }}
                          disabled={isSavingLead}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {nextPageToken && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={loadMoreResults}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Results"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="w-1/2 relative">
        <div id="search-map" className="h-full w-full" />
        {isEnrichingData && (
          <div className="absolute top-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-2">Enriching Lead Data...</h4>
            <Progress value={enrichmentProgress} className="mb-2" />
            <p className="text-sm text-gray-600">
              Finding additional information about this business
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderLeadsTab = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Saved Leads</h2>
          <p className="text-gray-600">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedLeads.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteLeads(selectedLeads)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedLeads.length})
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}
          <Button variant="outline" size="sm" onClick={exportLeads}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {savedLeads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads saved yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Start by searching for businesses and saving them as leads
            </p>
            <Button onClick={() => setActiveTab("search")}>
              <Search className="mr-2 h-4 w-4" />
              Search for Leads
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === savedLeads.length}
                    onCheckedChange={(checked) => {
                      setSelectedLeads(checked ? savedLeads.map((l) => l.id) : [])
                    }}
                  />
                </TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Data Quality</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => {
                        setSelectedLeads(
                          checked
                            ? [...selectedLeads, lead.id]
                            : selectedLeads.filter((id) => id !== lead.id)
                        )
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {lead.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">{lead.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.phone && (
                        <p className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.phone}
                        </p>
                      )}
                      {lead.email && (
                        <p className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {lead.email}
                        </p>
                      )}
                      {lead.website && (
                        <p className="text-sm flex items-center">
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        LEAD_STATUSES.find((s) => s.value === (lead.status || "new"))
                          ?.color || ""
                      }
                    >
                      {LEAD_STATUSES.find((s) => s.value === (lead.status || "new"))
                        ?.label || "New"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{lead.industry || "Unknown"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {lead.phone && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {lead.email && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {lead.website && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {lead.linkedIn && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPlace(lead)
                            setIsDetailDrawerOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Lead
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Re-enrich Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteLeads([lead.id])}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
              </Table>
            </Card>
          )}
        </div>
      )
    
      return (
        <div className="h-full flex flex-col bg-gray-50">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-white px-6">
              <TabsList className="h-14 bg-transparent p-0 border-0">
                <TabsTrigger
                  value="search"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </TabsTrigger>
                <TabsTrigger
                  value="leads"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Leads ({savedLeads.length})
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-14"
                >
                  <ChartBar className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>
    
            <div className="flex-1 overflow-hidden">
              <TabsContent value="search" className="h-full m-0">
                {renderSearchTab()}
              </TabsContent>
              <TabsContent value="leads" className="h-full m-0 overflow-y-auto">
                {renderLeadsTab()}
              </TabsContent>
              <TabsContent value="analytics" className="h-full m-0 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{savedLeads.length}</p>
                      <p className="text-xs text-gray-500 mt-1">All time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Enriched Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {savedLeads.filter((l) => l.email || l.linkedIn).length}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((savedLeads.filter((l) => l.email || l.linkedIn).length / savedLeads.length) * 100).toFixed(0)}% enriched
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Contact Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {((savedLeads.filter((l) => l.phone || l.email).length / savedLeads.length) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Have contact info</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Avg Rating
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {(savedLeads.reduce((acc, l) => acc + (l.rating || 0), 0) / savedLeads.filter((l) => l.rating).length).toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Stars average</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
    
          {/* Lead Detail Drawer */}
          <Drawer.Root open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen} direction="right">
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
              <Drawer.Content className="bg-white h-full w-full max-w-2xl fixed top-0 right-0 z-50 overflow-hidden">
                {selectedPlace && (
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsDetailDrawerOpen(false)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-semibold">{selectedPlace.name}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const lead = savedLeads.find((l) => l.id === selectedPlace.id)
                            if (!lead) {
                              saveLead(selectedPlace)
                            }
                          }}
                          disabled={isSavingLead || savedLeads.some((l) => l.id === selectedPlace.id)}
                        >
                          {savedLeads.some((l) => l.id === selectedPlace.id) ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Saved
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Lead
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
    
                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-6 space-y-6">
                        {/* Photos */}
                        {selectedPlace.photos && selectedPlace.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
                            {selectedPlace.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={getPhotoUrl(photo.photoReference)}
                                alt={`${selectedPlace.name} photo ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                            ))}
                          </div>
                        )}
    
                        {/* Basic Info */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                              <div>
                                <p className="font-medium">Address</p>
                                <p className="text-sm text-gray-600">{selectedPlace.address}</p>
                              </div>
                            </div>
    
                            {selectedPlace.phone && (
                              <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">Phone</p>
                                  <a
                                    href={`tel:${selectedPlace.phone}`}
                                    className="text-sm text-blue-600 hover:underline"
                                  >
                                    {selectedPlace.phone}
                                  </a>
                                </div>
                              </div>
                            )}
    
                            {selectedPlace.website && (
                              <div className="flex items-start gap-3">
                                <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">Website</p>
                                  <a
                                    href={selectedPlace.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline flex items-center"
                                  >
                                    {new URL(selectedPlace.website).hostname}
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                  </a>
                                </div>
                              </div>
                            )}
    
                            {selectedPlace.rating && (
                              <div className="flex items-start gap-3">
                                <Star className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">Rating</p>
                                  <p className="text-sm text-gray-600">
                                    {selectedPlace.rating} stars ({selectedPlace.userRatingsTotal} reviews)
                                  </p>
                                </div>
                              </div>
                            )}
    
                            {selectedPlace.businessStatus && (
                              <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">Status</p>
                                  <p className="text-sm text-gray-600">
                                    {selectedPlace.businessStatus.replace(/_/g, " ")}
                                  </p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
    
                        {/* Enriched Data */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Enriched Data</CardTitle>
                            <CardDescription>
                              Additional information found about this business
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {selectedPlace.email ? (
                              <>
                                <div className="flex items-start gap-3">
                                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Email</p>
                                    <a
                                      href={`mailto:${selectedPlace.email}`}
                                      className="text-sm text-blue-600 hover:underline"
                                    >
                                      {selectedPlace.email}
                                    </a>
                                  </div>
                                </div>
    
                                <div className="grid grid-cols-2 gap-4">
                                  {selectedPlace.linkedIn && (
                                    <div className="flex items-start gap-3">
                                      <Linkedin className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">LinkedIn</p>
                                        <a
                                          href={`https://${selectedPlace.linkedIn}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline"
                                        >
                                          Profile
                                        </a>
                                      </div>
                                    </div>
                                  )}
    
                                  {selectedPlace.facebook && (
                                    <div className="flex items-start gap-3">
                                      <Facebook className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Facebook</p>
                                        <a
                                          href={`https://${selectedPlace.facebook}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline"
                                        >
                                          Page
                                        </a>
                                      </div>
                                    </div>
                                  )}
    
                                  {selectedPlace.instagram && (
                                    <div className="flex items-start gap-3">
                                      <Instagram className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Instagram</p>
                                        <p className="text-sm text-gray-600">
                                          {selectedPlace.instagram}
                                        </p>
                                      </div>
                                    </div>
                                  )}
    
                                  {selectedPlace.twitter && (
                                    <div className="flex items-start gap-3">
                                      <Twitter className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Twitter</p>
                                        <p className="text-sm text-gray-600">
                                          {selectedPlace.twitter}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
    
                                <Separator />
    
                                <div className="grid grid-cols-2 gap-4">
                                  {selectedPlace.industry && (
                                    <div className="flex items-start gap-3">
                                      <Briefcase className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Industry</p>
                                        <p className="text-sm text-gray-600">
                                          {selectedPlace.industry}
                                        </p>
                                      </div>
                                    </div>
                                  )}
    
                                  {selectedPlace.companySize && (
                                    <div className="flex items-start gap-3">
                                      <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Company Size</p>
                                        <p className="text-sm text-gray-600">
                                          {selectedPlace.companySize}
                                        </p>
                                      </div>
                                    </div>
                                  )}
    
                                  {selectedPlace.revenue && (
                                    <div className="flex items-start gap-3">
                                      <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="font-medium">Est. Revenue</p>
                                        <p className="text-sm text-gray-600">
                                          {selectedPlace.revenue}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-8">
                                <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 mb-4">
                                  No enriched data available yet
                                </p>
                                <Button
                                  onClick={() => {
                                    if (!savedLeads.some((l) => l.id === selectedPlace.id)) {
                                      saveLead(selectedPlace)
                                    } else {
                                      enrichLead(selectedPlace.id, selectedPlace)
                                    }
                                  }}
                                  disabled={isEnrichingData}
                                >
                                  {isEnrichingData ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Enriching...
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Enrich Data
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
    
                        {/* Decision Makers */}
                        {selectedPlace.decisionMakers && selectedPlace.decisionMakers.length > 0 && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Decision Makers</CardTitle>
                              <CardDescription>
                                Key contacts at this business
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {selectedPlace.decisionMakers.map((person, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                  >
                                    <Avatar>
                                      <AvatarFallback>
                                        {person.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium">{person.name}</p>
                                      <p className="text-sm text-gray-600">{person.title}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        {person.email && (
                                          <a
                                            href={`mailto:${person.email}`}
                                            className="text-sm text-blue-600 hover:underline flex items-center"
                                          >
                                            <Mail className="h-3 w-3 mr-1" />
                                            Email
                                          </a>
                                        )}
                                        {person.linkedIn && (
                                          <a
                                            href={`https://${person.linkedIn}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline flex items-center"
                                          >
                                            <Linkedin className="h-3 w-3 mr-1" />
                                            LinkedIn
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          person.email || ""
                                        )
                                        toast.success("Email copied to clipboard")
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
    
                        {/* Opening Hours */}
                        {selectedPlace.openingHours?.weekdayText && (
                          <Card>
                            <CardHeader>
                              <CardTitle>Opening Hours</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-1">
                                {selectedPlace.openingHours.weekdayText.map((day, index) => (
                                  <p key={index} className="text-sm">
                                    {day}
                                  </p>
                                ))}
                              </div>
                              {selectedPlace.openingHours.openNow !== undefined && (
                                <Badge
                                  className="mt-3"
                                  variant={
                                    selectedPlace.openingHours.openNow
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {selectedPlace.openingHours.openNow
                                    ? "Open Now"
                                    : "Closed"}
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        )}
    
                        {/* Notes */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Notes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              placeholder="Add notes about this lead..."
                              className="min-h-[100px]"
                              defaultValue={
                                savedLeads.find((l) => l.id === selectedPlace.id)?.notes
                              }
                            />
                            <Button className="mt-3" size="sm">
                              Save Notes
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      )
    }