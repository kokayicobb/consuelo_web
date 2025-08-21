import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client only if API key is available
let elevenlabs: ElevenLabsClient | null = null;
if (process.env.ELEVENLABS_API_KEY) {
  elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
}

// Helper for exponential backoff retry mechanism
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000 // initial delay in ms
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential increase
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export async function POST(req: Request) {
  try {
    console.log('🔊 TTS API called');
    const body = await req.json();
    console.log('🔊 TTS request body:', body);
    
    const { text, voice_id } = body;
    console.log('🔊 Extracted text:', text, 'Type:', typeof text, 'Length:', text?.length);
    console.log('🔊 Voice ID:', voice_id);

    if (!text) {
      console.error('❌ No text provided for TTS');
      return NextResponse.json({ error: 'No text provided for TTS' }, { status: 400 });
    }

    if (!elevenlabs) {
      console.log('🔊 ElevenLabs not configured, falling back to browser TTS');
      return NextResponse.json({
        text: text,
        use_browser_tts: true,
        voice_settings: {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0
        }
      });
    }

    console.log('🔊 Calling ElevenLabs TTS API...');
    
    // Use a default professional voice if none specified
    const selectedVoiceId = voice_id || 'uYXf8XasLslADfZ2MB4u'; // Hope - a professional female voice
    
    const audioStream = await retryOperation(() => 
      elevenlabs!.textToSpeech.stream(selectedVoiceId, {
        text: text,
        modelId: 'eleven_v3',
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true
        }
      })
    );

    console.log('🔊 ElevenLabs TTS response received');

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value instanceof Uint8Array) {
          chunks.push(value);
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    // Combine all chunks into a single buffer
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64 for JSON response
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');
    
    console.log('🔊 Audio data length:', audioBase64.length);
    console.log('🔊 Returning ElevenLabs TTS response');
    
    return NextResponse.json({
      audio_base64: audioBase64,
      mime_type: 'audio/mpeg',
      voice_id: selectedVoiceId
    });

  } catch (error) {
    console.error('Error in TTS API:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
