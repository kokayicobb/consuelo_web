
// tools.ts

import { CalcomAPI, getNextWeekDateRange } from "./calcom-api"


// Tool definitions for the AI to use
export interface Tool {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required?: string[]
  }
}

export const tools: Tool[] = [
  {
    name: "get_available_times",
    description: "Get available time slots for scheduling a consultation with United Capital Source",
    parameters: {
      type: "object",
      properties: {
        timeZone: {
          type: "string",
          description: "The user's timezone (optional, defaults to America/New_York)",
        },
        dateFrom: {
          type: "string",
          description: "Start date for availability check (ISO format, optional)",
        },
        dateTo: {
          type: "string",
          description: "End date for availability check (ISO format, optional)",
        },
      },
      required: [],
    },
  },
  {
    name: "create_booking",
    description: "Create a booking for a consultation",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The customer's full name",
        },
        email: {
          type: "string",
          description: "The customer's email address",
        },
        phone: {
          type: "string",
          description: "The customer's phone number (optional)",
        },
        company: {
          type: "string",
          description: "The customer's company name (optional)",
        },
        notes: {
          type: "string",
          description: "Additional notes about the consultation (optional)",
        },
        startTime: {
          type: "string",
          description: "The selected start time (ISO format)",
        },
        endTime: {
          type: "string",
          description: "The end time (ISO format)",
        },
        timeZone: {
          type: "string",
          description: "The customer's timezone (defaults to America/New_York)",
        },
      },
      required: ["name", "email", "startTime", "endTime"],
    },
  },
]

// Tool execution functions
export async function executeGetAvailableTimes(args: { 
  timeZone?: string
  dateFrom?: string
  dateTo?: string
} = {}) {
  try {
    // Initialize Cal.com API
    const calcomAPI = new CalcomAPI()
    
    // Get the event type ID for consultations
    const eventTypeId = Number.parseInt(process.env.CALCOM_EVENT_TYPE_ID || "1")
    
    // Use provided dates or default to next week
    let startTime: string, endTime: string
    
    if (args.dateFrom && args.dateTo) {
      startTime = args.dateFrom
      endTime = args.dateTo
    } else {
      const range = getNextWeekDateRange()
      startTime = range.startTime
      endTime = range.endTime
    }
    
    const slots = await calcomAPI.getAvailableSlots(
      eventTypeId,
      startTime,
      endTime,
      args.timeZone || "America/New_York"
    )
    
    const formattedSlots = calcomAPI.formatAvailableSlots(slots)
    
    return {
      success: true,
      availableSlots: formattedSlots.slice(0, 10), // Limit to 10 slots
      rawSlots: slots.slice(0, 10), // Include raw slot data for booking
      message: `Found ${formattedSlots.length} available time slots for consultation.`,
      timeZone: args.timeZone || "America/New_York",
    }
  } catch (error) {
    console.error("Error fetching available times:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to fetch available times at the moment. Please try again later.",
      availableSlots: [],
      rawSlots: [],
    }
  }
}

export async function executeCreateBooking(args: {
  name: string
  email: string
  phone?: string
  company?: string
  notes?: string
  startTime: string
  endTime: string
  timeZone?: string
}) {
  try {
    const calcomAPI = new CalcomAPI()
    
    const booking = {
      ...args,
      timeZone: args.timeZone || "America/New_York",
    }
    
    const result = await calcomAPI.createBooking(booking)
    
    if (result.success) {
      return {
        success: true,
        message: "Your consultation has been successfully booked!",
        bookingId: result.bookingId,
        bookingUid: result.bookingUid,
        details: {
          time: new Date(args.startTime).toLocaleString("en-US", {
            dateStyle: "full",
            timeStyle: "short",
          }),
          timeZone: booking.timeZone,
        },
      }
    } else {
      return {
        success: false,
        error: result.error || "Unable to create booking. Please try again.",
      }
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while creating the booking.",
    }
  }
}

export async function executeToolCall(toolName: string, args: any) {
  switch (toolName) {
    case "get_available_times":
      return executeGetAvailableTimes(args)
    case "create_booking":
      return executeCreateBooking(args)
    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}

// Export everything for easy import
export { CalcomAPI, getNextWeekDateRange } 