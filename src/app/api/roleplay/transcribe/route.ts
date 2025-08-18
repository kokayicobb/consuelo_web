// app/api/roleplay/transcribe/route.ts
import { NextResponse } from 'next/server';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    console.log('🎤 Transcription API called');
    
    // Get the audio data from the request
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('❌ No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('🎤 Audio file received:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type
    });

    console.log('🎤 Calling Groq Whisper API...');
    
    // Create FormData for the API request
    const transcribeFormData = new FormData();
    transcribeFormData.append('file', audioFile);
    transcribeFormData.append('model', 'whisper-large-v3-turbo');
    transcribeFormData.append('response_format', 'verbose_json');
    transcribeFormData.append('language', 'en');
    transcribeFormData.append('temperature', '0.0');

    // Make direct API call to Groq
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: transcribeFormData,
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const transcription = await response.json();

    console.log('🎤 Transcription received:', transcription.text);
    
    return NextResponse.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      segments: transcription.segments, // Optional: includes word-level timestamps
    });

  } catch (error) {
    console.error('Error in transcription API:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}