import { NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// Initialize ElevenLabs client only if API key is available
let elevenlabs: ElevenLabsClient | null = null;
if (process.env.ELEVENLABS_API_KEY) {
  elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });
}

export async function GET() {
  try {
    console.log('🎤 Voices API called');

    if (!elevenlabs) {
      console.log('🎤 ElevenLabs not configured, returning empty voices list');
      return NextResponse.json({
        voices: [],
        total_count: 0
      });
    }

    console.log('🎤 Fetching voices from ElevenLabs...');
    
    const response = await elevenlabs!.voices.search({
      pageSize: 50, // Get more voices
      includeTotalCount: true
    });

    console.log('🎤 Voices fetched successfully');
    
    // Filter and format voices for the frontend
    const formattedVoices = response.voices
      .filter(voice => 
        // Only include professional, premade, or generated voices
        voice.category && ['professional', 'premade', 'generated'].includes(voice.category) &&
        // Only include voices available for the user's tier
        voice.availableForTiers && voice.availableForTiers.length > 0
      )
      .map(voice => ({
        voice_id: voice.voiceId,
        name: voice.name,
        description: voice.description,
        category: voice.category,
        labels: voice.labels,
        preview_url: voice.previewUrl,
        settings: voice.settings
      }))
      .slice(0, 20); // Limit to 20 voices for performance

    console.log('🎤 Returning', formattedVoices.length, 'voices');
    
    return NextResponse.json({
      voices: formattedVoices,
      total_count: formattedVoices.length
    });

  } catch (error) {
    console.error('Error in voices API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch voices', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}