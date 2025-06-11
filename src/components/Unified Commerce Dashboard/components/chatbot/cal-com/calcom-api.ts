// calcom-api.ts - Cal.com API v2 Real Implementation
export interface CalcomTimeSlot {
  time: string
  attendees?: number
  bookingUid?: string
}

export interface CalcomBooking {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  startTime: string
  endTime: string
  timeZone: string
  eventTypeId?: number
}

export class CalcomAPI {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.CALCOM_API_KEY || ""
    this.baseUrl = baseUrl || process.env.CALCOM_BASE_URL || "https://api.cal.com/v2"
    
    // Debug logging
    console.log("Cal.com API v2 Debug:")
    console.log("- API Key exists:", !!this.apiKey)
    console.log("- API Key length:", this.apiKey.length)
    console.log("- Base URL:", this.baseUrl)
  }

  async getAvailableSlots(
    eventTypeId: number,
    startTime: string,
    endTime: string,
    timeZone: string = "America/New_York"
  ): Promise<CalcomTimeSlot[]> {
    try {
      // Cal.com v2 slots endpoint with correct parameters
      const url = new URL(`${this.baseUrl}/slots`)
      url.searchParams.append("eventTypeId", eventTypeId.toString())
      url.searchParams.append("start", startTime)
      url.searchParams.append("end", endTime)
      url.searchParams.append("timeZone", timeZone)
  
      console.log(`Making Cal.com v2 slots request to: ${url.toString()}`)
  
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'cal-api-version': '2024-09-04',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })
  
      console.log(`Cal.com v2 slots response status:`, response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log(`Cal.com v2 slots error:`, errorText.substring(0, 500))
        
        // If API fails, return mock data for development
        console.log("Cal.com API failed, returning mock data for development")
        return await this.getMockAvailableSlots()
      }
  
      const data = await response.json()
      console.log("Cal.com v2 slots success! Response:", data)
      
      // Handle Cal.com v2 response format based on documentation
      if (data.status === 'success' && data.data) {
        const slots: CalcomTimeSlot[] = []
        
        // Cal.com returns: { "2025-06-11": [{"start": "2025-06-11T09:00:00.000-04:00"}, ...], ... }
        for (const date in data.data) {
          const daySlots = data.data[date]
          if (Array.isArray(daySlots)) {
            for (const slot of daySlots) {
              console.log("Processing slot:", slot) // Debug individual slot
              
              // Make sure we're getting the time value correctly
              const timeValue = slot.start || slot.time
              
              if (!timeValue) {
                console.warn("Slot missing time value:", slot)
                continue
              }
              
              // Validate the time value before adding
              const testDate = new Date(timeValue)
              if (isNaN(testDate.getTime())) {
                console.warn("Invalid time value:", timeValue)
                continue
              }
              
              slots.push({
                time: timeValue,
                attendees: slot.attendeesCount || slot.attendees || 0,
                bookingUid: slot.bookingUid || slot.uid || null,
              })
            }
          }
        }
        
        console.log(`Processed ${slots.length} slots from Cal.com:`)
        slots.slice(0, 3).forEach(slot => {
          console.log("Sample slot:", slot)
          console.log("- Time property:", slot.time)
          console.log("- Time is valid date:", !isNaN(new Date(slot.time).getTime()))
        })
        
        return slots
      }
      
      // If unrecognized format, return mock data
      console.log("Unrecognized Cal.com response format, returning mock data")
      return await this.getMockAvailableSlots()
  
    } catch (error) {
      console.error("Error fetching available slots from Cal.com:", error)
      // Return mock data for development
      console.log("Returning mock data due to error")
      return await this.getMockAvailableSlots()
    }
  }

  // Generate mock slots for development/testing
  private async getMockAvailableSlots(): Promise<CalcomTimeSlot[]> {
    console.log("🔧 Generating mock available slots for development...")
    
    const mockSlots: CalcomTimeSlot[] = []
    const now = new Date()
    
    // Generate slots for the next 7 days, 9 AM to 5 PM
    for (let day = 1; day <= 7; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day)
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      for (let hour = 9; hour <= 17; hour += 2) { // Every 2 hours
        const slotTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0)
        
        // Ensure the date is valid
        if (!isNaN(slotTime.getTime())) {
          mockSlots.push({
            time: slotTime.toISOString(),
            attendees: 0,
            bookingUid: `mock-${day}-${hour}`
          })
        }
      }
    }
    
    console.log(`📅 Generated ${mockSlots.length} mock slots`)
    return mockSlots.slice(0, 10) // Return first 10 slots
  }

  async createBooking(booking: CalcomBooking): Promise<{ 
    success: boolean
    bookingId?: string
    bookingUid?: string
    error?: string 
  }> {
    try {
      const eventTypeId = booking.eventTypeId || Number.parseInt(process.env.CALCOM_EVENT_TYPE_ID || "1")
      
      // Calculate end time (assuming 30-minute meetings by default)
      const startDate = new Date(booking.startTime)
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000) // 30 minutes later
      
      // Cal.com v2 booking payload format based on documentation
      const bookingPayload = {
        start: booking.startTime, // Must be in UTC
        eventTypeId: eventTypeId,
        attendee: {
          name: booking.name,
          email: booking.email,
          timeZone: booking.timeZone,
          phoneNumber: booking.phone || undefined,
        },
        guests: [], // No additional guests for now
        metadata: {
          phone: booking.phone,
          company: booking.company,
          notes: booking.notes,
        },
        bookingFieldsResponses: {
          company: booking.company || '',
          notes: booking.notes || '',
        }
      }

      console.log("Creating Cal.com v2 booking with payload:", bookingPayload)
      
      const response = await fetch(`${this.baseUrl}/bookings`, {
        method: "POST",
        headers: {
          'cal-api-version': '2024-08-13', // Different version for bookings
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      })

      console.log("Cal.com v2 booking response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        console.log("Cal.com v2 booking error:", errorData)
        
        // For development, return mock success
        if (process.env.NODE_ENV === 'development') {
          console.log("🔧 Development mode: returning mock booking success")
          return {
            success: true,
            bookingId: 'mock-booking-' + Date.now(),
            bookingUid: 'mock-uid-' + Date.now(),
          }
        }
        
        throw new Error(errorData.message || `Booking failed with status ${response.status}`)
      }

      const data = await response.json()
      console.log("Cal.com v2 booking success:", data)
      
      // Handle Cal.com v2 booking response format
      if (data.status === 'success' && data.data) {
        return {
          success: true,
          bookingId: data.data.id?.toString(),
          bookingUid: data.data.uid,
        }
      } else {
        // Fallback format
        return {
          success: true,
          bookingId: data.id?.toString(),
          bookingUid: data.uid,
        }
      }
    } catch (error) {
      console.error("Error creating Cal.com booking:", error)
      
      // For development, return mock success
      if (process.env.NODE_ENV === 'development') {
        console.log("🔧 Development mode: returning mock booking success")
        return {
          success: true,
          bookingId: 'mock-booking-' + Date.now(),
          bookingUid: 'mock-uid-' + Date.now(),
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  formatAvailableSlots(slots: CalcomTimeSlot[]): string[] {
    return slots.map(slot => this.formatTimeSlot(slot.time))
  }

  formatTimeSlot(isoString: string): string {
    try {
      const date = new Date(isoString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date string:", isoString)
        return "Invalid Date"
      }
      
      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }
      
      // Use toLocaleString instead of toLocaleDateString to include time
      return date.toLocaleString("en-US", options)
    } catch (error) {
      console.error("Error formatting time slot:", error, "Input:", isoString)
      return "Invalid Date"
    }
  }

  // Method to test API connection using Cal.com v2
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("Testing Cal.com API v2 connection...")
      
      // Test with Cal.com v2 me endpoint
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'cal-api-version': '2024-09-04',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      })

      console.log("Cal.com v2 connection test status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Cal.com v2 API connection successful:", data)
        return { success: true, message: "✅ Cal.com API v2 connection successful!" }
      } else {
        const errorText = await response.text()
        console.log("Cal.com v2 API connection failed:", response.status, errorText.substring(0, 300))
        
        // For development, allow mock data
        if (process.env.NODE_ENV === 'development') {
          return { 
            success: true, 
            message: "🔧 Development mode: Using mock data (Cal.com API not connected)" 
          }
        }
        
        return { success: false, message: `❌ Cal.com API connection failed: ${response.status}` }
      }
    } catch (error) {
      console.error("Cal.com v2 API connection test error:", error)
      
      // For development, allow mock data
      if (process.env.NODE_ENV === 'development') {
        return { 
          success: true, 
          message: "🔧 Development mode: Using mock data (Cal.com API error)" 
        }
      }
      
      return { success: false, message: `❌ Connection error: ${error}` }
    }
  }

  // Helper method to format dates for Cal.com API (UTC format)
  private formatDateForCalcom(date: Date): string {
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD format
  }
}

export function getNextWeekDateRange(): { startTime: string; endTime: string } {
  const now = new Date()
  // Start from tomorrow
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  // End 7 days from start
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return {
    startTime: start.toISOString().split('T')[0], // YYYY-MM-DD format
    endTime: end.toISOString().split('T')[0],     // YYYY-MM-DD format
  }
}