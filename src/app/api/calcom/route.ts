// app/api/calcom/route.ts
import { CalcomAPI, getNextWeekDateRange } from '@/components/Unified Commerce Dashboard/components/chatbot/cal-com/calcom-api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Test endpoint to check API connection
  const { searchParams } = new URL(request.url)
  const testConnection = searchParams.get('test')

  if (testConnection === 'true') {
    try {
      const calcomAPI = new CalcomAPI()
      const result = await calcomAPI.testConnection()
      return NextResponse.json(result)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Regular availability check - simplified
  try {
    const calcomAPI = new CalcomAPI()
    const eventTypeId = parseInt(process.env.CALCOM_EVENT_TYPE_ID || '1')
    const { startTime, endTime } = getNextWeekDateRange()
    const timeZone = searchParams.get('timeZone') || 'America/New_York'
    
    const slots = await calcomAPI.getAvailableSlots(eventTypeId, startTime, endTime, timeZone)
    
    return NextResponse.json({
      success: true,
      availableSlots: slots,
      totalSlots: slots.length
    })
  } catch (error) {
    console.error('Error fetching available times:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...args } = body

    // Add environment variable debugging
    console.log("Environment check:")
    console.log("- CALCOM_API_KEY exists:", !!process.env.CALCOM_API_KEY)
    console.log("- CALCOM_BASE_URL:", process.env.CALCOM_BASE_URL)
    console.log("- CALCOM_EVENT_TYPE_ID:", process.env.CALCOM_EVENT_TYPE_ID)

    const calcomAPI = new CalcomAPI()

    switch (action) {
      case 'test_connection':
        const testResult = await calcomAPI.testConnection()
        return NextResponse.json(testResult)
        
      case 'get_available_times':
        const eventTypeId = parseInt(process.env.CALCOM_EVENT_TYPE_ID || '1')
        const { startTime, endTime } = getNextWeekDateRange()
        const timeZone = args.timeZone || 'America/New_York'
        
        console.log("Fetching slots with:", { eventTypeId, startTime, endTime, timeZone })
        
        const slots = await calcomAPI.getAvailableSlots(eventTypeId, startTime, endTime, timeZone)
        
        console.log(`Returning ${slots.length} slots to frontend`)
        console.log("First 3 slots being sent:", slots.slice(0, 3))
        
        return NextResponse.json({
          success: true,
          availableSlots: slots,
          totalSlots: slots.length
        })
        
      case 'create_booking':
        // Add eventTypeId to booking data if not present
        const bookingData = {
          ...args,
          eventTypeId: args.eventTypeId || parseInt(process.env.CALCOM_EVENT_TYPE_ID || '1')
        }
        
        const bookingResult = await calcomAPI.createBooking(bookingData)
        
        if (bookingResult.success) {
          return NextResponse.json({
            success: true,
            message: `Your meeting has been scheduled! Booking ID: ${bookingResult.bookingUid || bookingResult.bookingId}`,
            bookingId: bookingResult.bookingId,
            bookingUid: bookingResult.bookingUid
          })
        } else {
          return NextResponse.json({
            success: false,
            error: bookingResult.error || 'Failed to create booking'
          })
        }
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Cal.com API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}