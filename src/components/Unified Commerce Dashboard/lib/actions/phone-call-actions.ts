// src/app/actions/phone-call-actions.ts
"use server"

import { auth } from "@clerk/nextjs/server"
import { createClerkSupabaseClient } from "@/lib/supabase/client"
import twilio from 'twilio'
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

// Types
interface CallData {
  salesAgentNumber: string
  customerNumber: string
  callSid?: string
  conferenceSid?: string
  transcript?: string[]
}

interface TalkingPoints {
  points: string[]
  reasoning: string
  timestamp: string
  context?: string
}

// Store active calls in memory (in production, use Redis or similar)
const activeCalls = new Map<string, CallData>()

/**
 * Initiates a conference call between sales agent and customer
 * Calls the sales agent first, then connects to customer
 */
export async function initiateCall(
  salesAgentNumber: string,
  customerNumber: string
) {
  try {
    const authResult = await auth()
    const userId = authResult.userId
    
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate phone numbers
    if (!salesAgentNumber || !customerNumber) {
      return { success: false, error: "Both phone numbers are required" }
    }

    // Clean phone numbers (ensure E.164 format)
    const cleanNumber = (num: string) => {
      const digits = num.replace(/\D/g, '')
      if (digits.length === 10) return `+1${digits}`
      if (digits.length === 11 && digits[0] === '1') return `+${digits}`
      return `+${digits}`
    }

    const agentNumber = cleanNumber(salesAgentNumber)
    const clientNumber = cleanNumber(customerNumber)

    // Generate a unique conference room name
    const conferenceRoom = `sales-call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create TwiML for the conference
    const conferenceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/conference-twiml?room=${conferenceRoom}`

    // First, call the sales agent
    const agentCall = await twilioClient.calls.create({
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: agentNumber,
      url: conferenceUrl,
      statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/call-status`,
      statusCallbackEvent: ['initiated', 'answered', 'completed'],
      machineDetection: 'DetectMessageEnd',
      machineDetectionTimeout: 30
    })

    // Store call data
    const callData: CallData = {
      salesAgentNumber: agentNumber,
      customerNumber: clientNumber,
      callSid: agentCall.sid,
      transcript: []
    }
    activeCalls.set(agentCall.sid, callData)

    // Wait a moment for agent to answer, then call customer
    setTimeout(async () => {
      try {
        const customerCall = await twilioClient.calls.create({
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: clientNumber,
          url: conferenceUrl,
          statusCallback: `${process.env.NEXT_PUBLIC_APP_URL}/api/call-status`,
          statusCallbackEvent: ['initiated', 'answered', 'completed']
        })

        // Update call data with customer call SID
        callData.conferenceSid = conferenceRoom
        activeCalls.set(customerCall.sid, callData)

        // Log to database
        const authForToken = await auth()
        const token = await authForToken.getToken()
        const supabase = createClerkSupabaseClient(token)
        
        await supabase.from('call_logs').insert({
          user_id: userId,
          agent_number: agentNumber,
          customer_number: clientNumber,
          agent_call_sid: agentCall.sid,
          customer_call_sid: customerCall.sid,
          conference_room: conferenceRoom,
          status: 'initiated',
          created_at: new Date().toISOString()
        })

      } catch (error) {
        console.error('Error calling customer:', error)
      }
    }, 3000) // Wait 3 seconds for agent to pick up

    return {
      success: true,
      call_sid: agentCall.sid,
      conference_room: conferenceRoom
    }

  } catch (error) {
    console.error('Error initiating call:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate call'
    }
  }
}

/**
 * End an active call
 */
export async function endCall(callSid: string) {
  try {
    const authResult = await auth()
    const userId = authResult.userId
    
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    // Get all participants in the conference
    const callData = activeCalls.get(callSid)
    if (!callData || !callData.conferenceSid) {
      return { success: false, error: "Call not found" }
    }

    // Get conference participants
    const conferences = await twilioClient.conferences.list({
      friendlyName: callData.conferenceSid,
      status: 'in-progress',
      limit: 1
    })

    if (conferences.length > 0) {
      const conference = conferences[0]
      const conferenceContext = twilioClient.conferences(conference.sid)
      const participants = await conferenceContext.participants.list()

      // Kick all participants to end the conference
      for (const participant of participants) {
        await conferenceContext.participants(participant.callSid).remove()
      }
    }

    // Update database
    const authForToken = await auth()
    const token = await authForToken.getToken()
    const supabase = createClerkSupabaseClient(token)
    
    await supabase
      .from('call_logs')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('agent_call_sid', callSid)

    // Clean up active calls
    activeCalls.delete(callSid)

    return { success: true }

  } catch (error) {
    console.error('Error ending call:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to end call'
    }
  }
}

/**
 * Generate AI talking points based on call context
 */
export async function generateTalkingPoints(
  callSid: string,
  conversationContext?: string
) {
  try {
    const authResult = await auth()
    const userId = authResult.userId
    
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    const callData = activeCalls.get(callSid)
    if (!callData) {
      return { success: false, error: "Call not found" }
    }

    // Create prompt for Groq
    const prompt = `You are an AI sales coach providing real-time guidance to a sales agent during a live call with a customer.

${conversationContext ? `Current conversation context: ${conversationContext}` : 'The call has just started.'}

${callData.transcript && callData.transcript.length > 0 ? `Recent conversation:
${callData.transcript.slice(-5).join('\n')}` : ''}

Provide 3-5 concise, actionable talking points for the sales agent to:
1. Build rapport and trust
2. Identify customer needs
3. Present value effectively
4. Handle objections if any
5. Move towards a positive outcome

Keep each point brief (1-2 sentences) and immediately actionable.
Also provide a brief reasoning (1-2 sentences) explaining your strategy.`

    // Use the AI SDK's generateText function with Groq
    const { text } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert sales coach providing real-time guidance. Be concise, practical, and focused on immediate actions the agent can take.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 500
    })

    // Parse the response to extract points and reasoning
    const lines = text.split('\n').filter(line => line.trim())
    const points: string[] = []
    let reasoning = ''
    let isReasoningSection = false

    for (const line of lines) {
      if (line.toLowerCase().includes('reasoning:') || line.toLowerCase().includes('strategy:')) {
        isReasoningSection = true
        reasoning = line.replace(/^(reasoning:|strategy:)/i, '').trim()
      } else if (isReasoningSection) {
        reasoning += ' ' + line.trim()
      } else if (line.match(/^\d+\.|^[-•*]/)) {
        points.push(line.replace(/^\d+\.|^[-•*]\s*/, '').trim())
      }
    }

    // If no structured response, treat the whole response as points
    if (points.length === 0) {
      points.push(...lines.slice(0, 5))
      reasoning = 'Focus on understanding customer needs and building value.'
    }

    const talkingPoints: TalkingPoints = {
      points: points.slice(0, 5), // Max 5 points
      reasoning: reasoning || 'Listen actively and respond to customer cues.',
      timestamp: new Date().toISOString(),
      context: conversationContext
    }

    // Store in database for analytics
    const authForToken = await auth()
    const token = await authForToken.getToken()
    const supabase = createClerkSupabaseClient(token)
    
    await supabase.from('call_talking_points').insert({
      call_sid: callSid,
      user_id: userId,
      talking_points: talkingPoints,
      created_at: new Date().toISOString()
    })

    return {
      success: true,
      talking_points: talkingPoints
    }

  } catch (error) {
    console.error('Error generating talking points:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate talking points'
    }
  }
}

/**
 * Get current talking points for a call
 */
export async function getTalkingPoints(callSid?: string) {
  try {
    const authResult = await auth()
    const userId = authResult.userId
    
    if (!userId) {
      return { success: false, error: "Unauthorized" }
    }

    const authForToken = await auth()
    const token = await authForToken.getToken()
    const supabase = createClerkSupabaseClient(token)

    // If no callSid provided, get the most recent active call
    let actualCallSid = callSid
    if (!actualCallSid) {
      const { data: recentCall } = await supabase
        .from('call_logs')
        .select('agent_call_sid')
        .eq('user_id', userId)
        .eq('status', 'in-progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentCall) {
        actualCallSid = recentCall.agent_call_sid
      }
    }

    if (!actualCallSid) {
      return { success: false, error: "No active call found" }
    }

    // Get the most recent talking points
    const { data, error } = await supabase
      .from('call_talking_points')
      .select('talking_points')
      .eq('call_sid', actualCallSid)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      // Generate new talking points if none exist
      return await generateTalkingPoints(actualCallSid)
    }

    return {
      success: true,
      talking_points: data.talking_points
    }

  } catch (error) {
    console.error('Error getting talking points:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get talking points'
    }
  }
}

/**
 * Update call transcript (called from webhook)
 */
export async function updateCallTranscript(
  callSid: string,
  transcript: string,
  speaker: 'agent' | 'customer'
) {
  try {
    const callData = activeCalls.get(callSid)
    if (!callData) {
      return { success: false, error: "Call not found" }
    }

    // Add to transcript
    const transcriptLine = `${speaker.toUpperCase()}: ${transcript}`
    callData.transcript = callData.transcript || []
    callData.transcript.push(transcriptLine)

    // Keep only last 20 lines
    if (callData.transcript.length > 20) {
      callData.transcript = callData.transcript.slice(-20)
    }

    // Generate new talking points periodically
    if (callData.transcript.length % 5 === 0) {
      // Every 5 new transcript lines
      const context = callData.transcript.slice(-10).join('\n')
      await generateTalkingPoints(callSid, context)
    }

    return { success: true }

  } catch (error) {
    console.error('Error updating transcript:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update transcript'
    }
  }
}