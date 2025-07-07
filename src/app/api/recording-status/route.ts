// src/app/api/recording-status/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const recordingSid = formData.get('RecordingSid') as string
    const recordingUrl = formData.get('RecordingUrl') as string
    const recordingStatus = formData.get('RecordingStatus') as string

    if (recordingStatus === 'completed') {
      // You can process the recording here
      // For example, send it to a transcription service
      console.log(`Recording completed: ${recordingUrl}`)
      
      // TODO: Send to transcription service and update talking points
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Recording status webhook error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}