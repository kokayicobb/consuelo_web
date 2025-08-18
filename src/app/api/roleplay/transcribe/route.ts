// app/api/roleplay/transcribe/route.ts
import { NextResponse } from 'next/server';
// import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  try {
    console.log('🎤 Transcription API called');
    
    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found in environment variables');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
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

    // Check audio file size (Groq has limits)
    if (audioFile.size > 25 * 1024 * 1024) { // 25MB limit
      console.error('❌ Audio file too large:', audioFile.size);
      return NextResponse.json({ error: 'Audio file too large (max 25MB)' }, { status: 400 });
    }

    // Check if we have actual audio content
    if (audioFile.size < 1000) {
      console.error('❌ Audio file too small:', audioFile.size);
      return NextResponse.json({ error: 'Audio file too small - no audio detected' }, { status: 400 });
    }

    console.log('🎤 Calling Groq Whisper API...');
    
    // Create FormData for the API request
    const transcribeFormData = new FormData();
    transcribeFormData.append('file', audioFile);
    transcribeFormData.append('model', 'whisper-large-v3-turbo');
    transcribeFormData.append('response_format', 'json'); // Use simple JSON format
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

    console.log('🎤 Groq API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const transcription = await response.json();

    console.log('🎤 Transcription received:', transcription.text);
    
    // Handle empty or very short transcriptions
    if (!transcription.text || transcription.text.trim().length < 2) {
      console.log('🎤 No meaningful speech detected');
      return NextResponse.json({
        text: '',
        message: 'No speech detected'
      });
    }
    
    return NextResponse.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
    });

  } catch (error) {
    console.error('❌ Error in transcription API:', error);
    return NextResponse.json({ 
      error: 'Failed to transcribe audio', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}