import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// Split text into chunks that fit within API limits
function splitTextIntoChunks(text: string, maxChars: number = 9000): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue
    
    const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence
    
    if (potentialChunk.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk + '.')
        currentChunk = trimmedSentence
      } else {
        // If single sentence is too long, split by words
        const words = trimmedSentence.split(' ')
        let wordChunk = ''
        
        for (const word of words) {
          const potentialWordChunk = wordChunk + (wordChunk ? ' ' : '') + word
          
          if (potentialWordChunk.length > maxChars) {
            if (wordChunk) {
              chunks.push(wordChunk)
              wordChunk = word
            } else {
              // Single word too long - truncate
              chunks.push(word.substring(0, maxChars))
            }
          } else {
            wordChunk = potentialWordChunk
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk
        }
      }
    } else {
      currentChunk = potentialChunk
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk + '.')
  }
  
  return chunks.length > 0 ? chunks : [text.substring(0, maxChars)]
}

// Merge WAV audio buffers
function mergeWavBuffers(buffers: Buffer[]): Buffer {
  if (buffers.length === 0) return Buffer.alloc(0)
  if (buffers.length === 1) return buffers[0]
  
  // Simple WAV concatenation (assumes same format)
  // Extract header from first buffer
  const header = buffers[0].subarray(0, 44)
  
  // Extract audio data from all buffers
  const audioDataBuffers = buffers.map(buffer => buffer.subarray(44))
  const totalAudioLength = audioDataBuffers.reduce((sum, buf) => sum + buf.length, 0)
  
  // Update header with new data size
  const newHeader = Buffer.from(header)
  const fileSize = 36 + totalAudioLength
  const dataSize = totalAudioLength
  
  // Update file size in header
  newHeader.writeUInt32LE(fileSize, 4)
  newHeader.writeUInt32LE(dataSize, 40)
  
  // Combine header with all audio data
  return Buffer.concat([newHeader, ...audioDataBuffers])
}

export async function POST(req: NextRequest) {
  try {
    const { text, title, chunkIndex, sessionId } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
    }

    // Split text into manageable chunks
    const chunks = splitTextIntoChunks(text, 9000)
    
    // If requesting a specific chunk
    if (typeof chunkIndex === 'number') {
      if (chunkIndex >= chunks.length) {
        return NextResponse.json({ error: 'Chunk index out of range' }, { status: 400 })
      }
      
      const chunk = chunks[chunkIndex]
      
      // Generate audio for this chunk
      const audioResponse = await groq.audio.speech.create({
        model: "playai-tts",
        voice: "Atlas-PlayAI", 
        response_format: "wav",
        input: chunk,
      })

      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer())
      console.log('🔊 Generated audio buffer size:', audioBuffer.length, 'bytes')
      
      const audioBase64 = audioBuffer.toString('base64')
      console.log('🔊 Base64 audio length:', audioBase64.length)
      
      return NextResponse.json({
        chunkIndex,
        totalChunks: chunks.length,
        audioBase64,
        isLastChunk: chunkIndex === chunks.length - 1,
        sessionId
      })
    }

    // If no chunk index, return metadata about the chunks
    const wordCount = text.split(/\s+/).length
    const estimatedDurationSeconds = Math.ceil((wordCount / 150) * 60)
    
    return NextResponse.json({
      totalChunks: chunks.length,
      estimatedDuration: estimatedDurationSeconds,
      sessionId: sessionId || Date.now().toString(),
      chunks: chunks.map((chunk, index) => ({
        index,
        preview: chunk.substring(0, 100) + '...',
        length: chunk.length
      }))
    })

  } catch (error) {
    console.error('TTS API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}