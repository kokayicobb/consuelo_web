import {
  Scenario,
  Character,
  RoleplaySession,
  SessionAnalytics,
  RoleplayTip,
  ConversationEntry,
  ChatResponse,
  TranscribeResponse,
  TTSResponse,
  mockScenarios,
  mockCharacters
} from './types';

// Existing API integrations (matching your current structure)

export async function sendChatMessage(
  message: string,
  history: ConversationEntry[],
  scenario: string
): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/roleplay/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        scenario
      })
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in chat API:', error);
    throw error;
  }
}

export async function transcribeAudio(audioFile: File): Promise<TranscribeResponse> {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch('/api/roleplay/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Transcribe API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in transcribe API:', error);
    throw error;
  }
}

export async function generateSpeech(
  text: string,
  voiceId?: string
): Promise<TTSResponse> {
  try {
    const response = await fetch('/api/roleplay/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId
      })
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in TTS API:', error);
    throw error;
  }
}

// New API functions for session management (you'll need to implement these endpoints)

export async function fetchScenarios(): Promise<Scenario[]> {
  try {
    const response = await fetch('/api/roleplay/scenarios');
    
    if (!response.ok) {
      console.warn('Scenarios API not available, using mock data');
      return mockScenarios;
    }
    
    const data = await response.json();
    return data.scenarios || [];
  } catch (error) {
    console.warn('Error fetching scenarios, using mock data:', error);
    return mockScenarios;
  }
}

export async function fetchCharacters(): Promise<Character[]> {
  try {
    const response = await fetch('/api/roleplay/characters');
    
    if (!response.ok) {
      console.warn('Characters API not available, using mock data');
      return mockCharacters;
    }
    
    const data = await response.json();
    return data.characters || [];
  } catch (error) {
    console.warn('Error fetching characters, using mock data:', error);
    return mockCharacters;
  }
}

export async function createSession(
  scenarioId: string,
  characterId?: string,
  userId?: string
): Promise<RoleplaySession> {
  try {
    const response = await fetch('/api/roleplay/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario_id: scenarioId,
        character_id: characterId,
        user_id: userId || 'anonymous'
      })
    });

    if (!response.ok) {
      throw new Error(`Create session API error: ${response.status}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error creating session:', error);
    // Return mock session for development
    return {
      id: Date.now().toString(),
      session_id: `session_${Date.now()}`,
      scenario_id: scenarioId,
      character_id: characterId,
      user_id: userId || 'anonymous',
      status: 'active',
      start_time: new Date().toISOString(),
      conversation_history: [],
      voice_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export async function fetchSessionHistory(userId?: string): Promise<RoleplaySession[]> {
  try {
    const url = userId 
      ? `/api/roleplay/sessions?user_id=${userId}`
      : '/api/roleplay/sessions';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Session history API not available');
      return [];
    }
    
    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.warn('Error fetching session history:', error);
    return [];
  }
}

export async function updateSession(
  sessionId: string, 
  updates: Partial<RoleplaySession>
): Promise<RoleplaySession> {
  try {
    const response = await fetch(`/api/roleplay/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Update session API error: ${response.status}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

export async function endSession(sessionId: string): Promise<void> {
  try {
    const response = await fetch(`/api/roleplay/sessions/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`End session API error: ${response.status}`);
    }
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
}

export async function fetchSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
  try {
    const response = await fetch(`/api/roleplay/analytics/${sessionId}`);
    
    if (!response.ok) {
      console.warn('Analytics API not available');
      return null;
    }
    
    const data = await response.json();
    return data.analytics;
  } catch (error) {
    console.warn('Error fetching session analytics:', error);
    return null;
  }
}

export async function fetchAnalyticsSummary(userId?: string): Promise<SessionAnalytics[]> {
  try {
    const url = userId 
      ? `/api/roleplay/analytics/summary?user_id=${userId}`
      : '/api/roleplay/analytics/summary';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Analytics summary API not available');
      return [];
    }
    
    const data = await response.json();
    return data.analytics || [];
  } catch (error) {
    console.warn('Error fetching analytics summary:', error);
    return [];
  }
}

export async function fetchRoleplayTips(
  category?: string,
  sessionId?: string
): Promise<RoleplayTip[]> {
  try {
    let url = '/api/roleplay/tips';
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (sessionId) params.append('session_id', sessionId);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('Tips API not available');
      return [];
    }
    
    const data = await response.json();
    return data.tips || [];
  } catch (error) {
    console.warn('Error fetching roleplay tips:', error);
    return [];
  }
}

export async function fetchRecentTips(limit: number = 10): Promise<RoleplayTip[]> {
  try {
    const response = await fetch(`/api/roleplay/tips/recent?limit=${limit}`);
    
    if (!response.ok) {
      console.warn('Recent tips API not available');
      return [];
    }
    
    const data = await response.json();
    return data.tips || [];
  } catch (error) {
    console.warn('Error fetching recent tips:', error);
    return [];
  }
}

// Utility functions for local data management

export function formatSessionDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  } else if (remainingSeconds === 0) {
    return `${minutes}m`;
  } else {
    return `${minutes}m ${remainingSeconds}s`;
  }
}

export function getScenarioById(scenarios: Scenario[], id: string): Scenario | undefined {
  return scenarios.find(scenario => scenario.id === id);
}

export function getCharacterById(characters: Character[], id: string): Character | undefined {
  return characters.find(character => character.id === id);
}

export function filterTipsByDifficulty(
  tips: RoleplayTip[], 
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): RoleplayTip[] {
  return tips.filter(tip => tip.difficulty_level === difficulty);
}

export function getSessionDuration(session: RoleplaySession): number {
  if (session.total_duration) {
    return session.total_duration;
  }
  
  if (session.end_time) {
    const start = new Date(session.start_time).getTime();
    const end = new Date(session.end_time).getTime();
    return Math.floor((end - start) / 1000);
  }
  
  return 0;
}