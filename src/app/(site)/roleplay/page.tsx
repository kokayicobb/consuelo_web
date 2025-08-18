'use client';

import { useState, useRef, useEffect } from 'react';

// Extend the Window interface for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface Feedback {
  opening: string;
  discovery_questions: string;
  handling_objections: string;
  value_proposition: string;
  closing: string;
  overall_effectiveness: string;
}

interface Voice {
  voice_id: string;
  name: string;
  description?: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

export default function RoleplayPage() {
  const [scenario, setScenario] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Voice selection state
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('JBFqnCBsd6RMkjVDRZzb'); // Default Rachel voice
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  
  // Voice-specific state
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'speaking' | 'listening'>('idle');
  
  // Refs for audio functionality
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Audio level monitoring for visual feedback
  useEffect(() => {
    let animationFrame: number;
    
    const updateAudioLevel = () => {
      if (analyserRef.current && isListening) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
      }
      animationFrame = requestAnimationFrame(updateAudioLevel);
    };
    
    if (isListening) {
      updateAudioLevel();
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoadingVoices(true);
      try {
        const response = await fetch('/api/roleplay/voices');
        if (response.ok) {
          const data = await response.json();
          setAvailableVoices(data.voices || []);
          console.log('🎤 Loaded', data.voices?.length, 'voices');
        } else {
          console.error('Failed to fetch voices:', response.status);
        }
      } catch (error) {
        console.error('Error fetching voices:', error);
      } finally {
        setIsLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  const startCall = async () => {
    if (!scenario.trim()) {
      toast.error('Please enter a scenario first');
      return;
    }
    
    setCallStatus('connecting');
    
    try {
      // Request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setupAudioAnalyser(stream);
      
      // Initialize speech recognition
      await initializeContinuousListening();
      
      setIsSessionActive(true);
      setIsCallActive(true);
      setMessages([]);
      setFeedback(null);
      setCallStatus('active');
      
      toast.success('Call connected! Start speaking naturally.');
      
      // Start the call with AI greeting
      setTimeout(() => {
        initiateAIGreeting();
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to connect. Please allow microphone access.');
      console.error('Error starting call:', error);
      setCallStatus('idle');
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
    } catch (error) {
      console.error('Error setting up audio analyser:', error);
    }
  };

  const initializeContinuousListening = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
          reject(new Error('Speech recognition not supported'));
          return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        // Configure for continuous conversation
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        recognitionRef.current.onstart = () => {
          setIsListening(true);
          setCallStatus('listening');
        };
        
        recognitionRef.current.onresult = (event: any) => {
          interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              console.log('Final transcript:', transcript);
            } else {
              interimTranscript += transcript;
              console.log('Interim transcript:', transcript);
            }
          }
          
          setCurrentTranscript(interimTranscript || finalTranscript);
          
          // Process final result
          if (finalTranscript.trim() && !isProcessingRef.current) {
            console.log('Processing speech:', finalTranscript.trim());
            handleUserSpeech(finalTranscript.trim());
            finalTranscript = '';
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle different types of errors
          if (event.error === 'network') {
            toast.error('Network error - restarting voice recognition...');
            setTimeout(() => {
              if (isCallActive) {
                startListening();
              }
            }, 1000);
          } else if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please allow microphone access and try again.');
            setCallStatus('idle');
            setIsCallActive(false);
          } else if (event.error === 'no-speech') {
            console.log('No speech detected, continuing...');
            // Don't restart immediately for no-speech, let onend handle it
          } else if (event.error === 'audio-capture') {
            toast.error('Audio capture error. Check your microphone.');
          } else {
            console.log('Other speech error, attempting restart:', event.error);
            setTimeout(() => {
              if (isCallActive && !isProcessingRef.current) {
                startListening();
              }
            }, 500);
          }
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Restart listening if call is still active and not processing
          if (isCallActive && !isProcessingRef.current && !isPlaying) {
            setTimeout(() => {
              startListening();
            }, 100);
          }
        };
        
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const startListening = () => {
    if (recognitionRef.current && isCallActive && !isProcessingRef.current && !isPlaying) {
      try {
        console.log('Starting speech recognition...');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        // If already started, this will throw an error - that's normal
        if (error.name === 'InvalidStateError') {
          console.log('Recognition already running');
        }
      }
    } else {
      console.log('Cannot start listening:', {
        hasRecognition: !!recognitionRef.current,
        isCallActive,
        isProcessing: isProcessingRef.current,
        isPlaying
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (transcript.length < 3 || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    stopListening();
    setCallStatus('speaking');
    
    const userMessage: Message = { role: 'user', text: transcript };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentTranscript('');
    
    try {
      // Get AI response
      const response = await getAIResponse(transcript, updatedMessages);
      
      // Add AI message to conversation
      const aiMessage: Message = { role: 'assistant', text: response };
      setMessages([...updatedMessages, aiMessage]);
      
      // Play AI response
      if (!isMuted) {
        await playAIResponse(response);
      }
    } catch (error) {
      toast.error('Connection issue - please try again');
      console.error('Error handling user speech:', error);
    } finally {
      isProcessingRef.current = false;
      setCallStatus('active');
      // Note: Listening will be resumed by the audio onended callback in playAIResponse
    }
  };

  const getAIResponse = async (userText: string, conversationHistory: Message[]) => {
    console.log('🤖 Getting AI response for:', userText);
    console.log('🤖 Conversation history length:', conversationHistory.length);
    console.log('🤖 Scenario:', scenario);
    
    const response = await fetch('/api/roleplay/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: conversationHistory,
        scenario: scenario
      })
    });

    console.log('🤖 Chat API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Chat API failed:', response.status, errorText);
      throw new Error(`Failed to get AI response: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🤖 AI response:', data.response);
    return data.response;
  };

  const initiateAIGreeting = async () => {
    try {
      console.log('👋 Initiating AI greeting...');
      const greeting = await getAIResponse("", []);
      console.log('👋 AI greeting received:', greeting);
      const aiMessage: Message = { role: 'assistant', text: greeting };
      setMessages([aiMessage]);
      
      if (!isMuted) {
        console.log('👋 Playing AI greeting (not muted)');
        await playAIResponse(greeting);
      } else {
        console.log('👋 Skipping AI greeting (muted)');
        // If muted, we need to start listening immediately
        setTimeout(() => {
          if (isCallActive) {
            startListening();
          }
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error with AI greeting:', error);
      // If greeting fails, still start listening
      setTimeout(() => {
        if (isCallActive) {
          startListening();
        }
      }, 500);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsSessionActive(false);
    setCallStatus('idle');
    setIsListening(false);
    setIsPlaying(false);
    setCurrentTranscript('');
    isProcessingRef.current = false;
    
    // Stop all audio/recognition
    stopListening();
    stopCurrentAudio();
    
    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    toast.success('Call ended');
  };

  const playAIResponse = async (text: string) => {
    try {
      console.log('🔊 Starting TTS for text:', text);
      setIsPlaying(true);
      setCallStatus('speaking');
      
      console.log('📡 Making TTS API request...');
      const ttsResponse = await fetch('/api/roleplay/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice_id: selectedVoiceId 
        })
      });

      console.log('📡 TTS API response status:', ttsResponse.status);

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text();
        console.error('❌ TTS API failed:', ttsResponse.status, errorText);
        throw new Error(`Failed to generate speech: ${ttsResponse.status} - ${errorText}`);
      }

      console.log('📦 Parsing TTS response...');
      const ttsData = await ttsResponse.json();
      console.log('📦 TTS response data keys:', Object.keys(ttsData));
      console.log('📦 TTS audio_base64 length:', ttsData.audio_base64?.length);
      console.log('📦 TTS mime_type:', ttsData.mime_type);
      console.log('📦 TTS voice_id:', ttsData.voice_id);
      
      if (ttsData.use_browser_tts) {
        console.log('🎵 Using browser Speech Synthesis API...');
        
        // Stop any current audio
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        
        // Use browser's Speech Synthesis API
        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(ttsData.text);
          utterance.rate = ttsData.voice_settings.rate;
          utterance.pitch = ttsData.voice_settings.pitch;
          utterance.volume = ttsData.voice_settings.volume;
          
          // Function to set voice (handles voice loading async behavior)
          const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log('🎵 Available voices:', voices.length, voices.map(v => v.name));
            
            const preferredVoice = voices.find(voice => 
              voice.name.includes('Google') || 
              voice.name.includes('Premium') || 
              voice.name.includes('Enhanced') ||
              (voice.lang.startsWith('en') && voice.localService === false)
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            
            if (preferredVoice) {
              utterance.voice = preferredVoice;
              console.log('🎵 Using voice:', preferredVoice.name);
            } else {
              console.log('🎵 No preferred voice found, using default');
            }
          };
          
          // Set voice immediately if voices are loaded
          if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
          } else {
            // Wait for voices to load
            window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
          }
          
          utterance.onend = () => {
            console.log('🎵 Speech synthesis ended');
            setIsPlaying(false);
            setCallStatus('active');
            
            // Resume listening after AI finishes speaking
            setTimeout(() => {
              if (isCallActive) {
                startListening();
              }
            }, 500);
          };
          
          utterance.onerror = (event) => {
            console.error('🎵 Speech synthesis error:', event);
            setIsPlaying(false);
            setCallStatus('active');
            
            // Resume listening even if TTS fails
            setTimeout(() => {
              if (isCallActive) {
                startListening();
              }
            }, 500);
          };
          
          console.log('🎵 Starting speech synthesis...');
          window.speechSynthesis.speak(utterance);
        } else {
          throw new Error('Speech synthesis not supported in this browser');
        }
      } else if (ttsData.audio_base64 && ttsData.mime_type) {
        console.log('🎵 Using ElevenLabs TTS audio...');
        
        // Stop any current audio
        if (currentAudioRef.current) {
          console.log('🎵 Stopping previous audio...');
          currentAudioRef.current.pause();
        }
        
        // Convert base64 audio to blob and play
        console.log('🎵 Converting base64 to audio...');
        const audioData = atob(ttsData.audio_base64);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        
        console.log('🎵 Creating audio blob...');
        const audioBlob = new Blob([audioArray], { type: ttsData.mime_type });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('🎵 Audio blob created, size:', audioBlob.size, 'bytes');
        console.log('🎵 Audio URL:', audioUrl);
        
        console.log('🎵 Creating new audio element...');
        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.onended = () => {
          console.log('🎵 Audio playback ended');
          setIsPlaying(false);
          setCallStatus('active');
          URL.revokeObjectURL(audioUrl);
          
          // Resume listening after AI finishes speaking
          setTimeout(() => {
            if (isCallActive) {
              startListening();
            }
          }, 500);
        };
        
        currentAudioRef.current.onerror = (event) => {
          console.error('🎵 Audio playback error:', event);
          setIsPlaying(false);
          setCallStatus('active');
          URL.revokeObjectURL(audioUrl);
          
          // Resume listening even if audio fails
          setTimeout(() => {
            if (isCallActive) {
              startListening();
            }
          }, 500);
        };
        
        console.log('🎵 Starting audio playback...');
        await currentAudioRef.current.play();
        console.log('🎵 Audio playback started successfully');
      } else {
        throw new Error('No audio data received from TTS API');
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      setCallStatus('active');
      
      // Resume listening even if TTS fails
      setTimeout(() => {
        if (isCallActive) {
          startListening();
        }
      }, 500);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (currentAudioRef.current) {
      currentAudioRef.current.muted = !isMuted;
    }
  };

  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Text fallback for when voice isn't working
  const sendTextMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: currentMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await getAIResponse(currentMessage, updatedMessages);
      const aiMessage: Message = { role: 'assistant', text: response };
      setMessages([...updatedMessages, aiMessage]);
      
      if (!isMuted && isCallActive) {
        await playAIResponse(response);
      }
    } catch (error) {
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedback = async () => {
    if (messages.length === 0) {
      toast.error('No conversation to analyze');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/roleplay/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages,
          scenario: scenario
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }

      const feedbackData = await response.json();
      setFeedback(feedbackData);
      toast.success('Feedback generated successfully!');
    } catch (error) {
      toast.error('Failed to generate feedback');
      console.error('Error getting feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Voice Sales Roleplay Training</h1>
        <p className="text-muted-foreground">
          Practice real sales conversations with AI prospects using natural speech
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant={callStatus === 'active' || callStatus === 'listening' || callStatus === 'speaking' ? "default" : "secondary"}>
            {callStatus === 'idle' ? (
              <><PhoneOff className="w-3 h-3 mr-1" />Ready to Start</>
            ) : callStatus === 'connecting' ? (
              <><Phone className="w-3 h-3 mr-1" />Connecting...</>
            ) : (
              <><Phone className="w-3 h-3 mr-1" />Live Call</>
            )}
          </Badge>
          {isListening && (
            <Badge variant="destructive" className="animate-pulse">
              <Mic className="w-3 h-3 mr-1" />Listening
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="default" className="animate-pulse">
              <Volume2 className="w-3 h-3 mr-1" />AI Speaking
            </Badge>
          )}
          {callStatus === 'speaking' && !isPlaying && (
            <Badge variant="secondary">
              ⏳ Processing...
            </Badge>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Setup and Voice Interface */}
        <div className="space-y-6">
          {/* Scenario Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Scenario Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scenario">Describe the sales scenario</Label>
                <Textarea
                  id="scenario"
                  placeholder="e.g., Cold calling a potential client who needs CRM software. They're busy and skeptical about sales calls..."
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  disabled={isSessionActive}
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="voice">AI Prospect Voice</Label>
                <Select 
                  value={selectedVoiceId} 
                  onValueChange={setSelectedVoiceId}
                  disabled={isSessionActive || isLoadingVoices}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingVoices ? "Loading voices..." : "Select a voice"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          {voice.description && (
                            <span className="text-xs text-muted-foreground">{voice.description}</span>
                          )}
                          {voice.labels && (
                            <span className="text-xs text-muted-foreground">
                              {voice.labels.gender} • {voice.labels.age} • {voice.labels.accent}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isLoadingVoices && availableVoices.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Voice selection unavailable - using default voice
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={startCall} 
                  disabled={isCallActive || !scenario.trim() || callStatus === 'connecting'}
                  className="flex-1"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {callStatus === 'connecting' ? 'Connecting...' : 'Start Live Call'}
                </Button>
                <Button 
                  onClick={endCall} 
                  variant="outline"
                  disabled={!isCallActive}
                  size="lg"
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Call Interface */}
          {isCallActive && (
            <Card>
              <CardHeader>
                <CardTitle>Live Sales Call</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">You: Sales Agent</Badge>
                  <Badge variant="outline">AI: Prospect</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Call Visualization */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div 
                      className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                        isListening 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                          : isPlaying 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : callStatus === 'speaking'
                          ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                          : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                      }`}
                      style={{
                        transform: isListening ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
                      }}
                    >
                      {isListening ? (
                        <Mic className="w-16 h-16 text-green-500" />
                      ) : isPlaying ? (
                        <Volume2 className="w-16 h-16 text-blue-500 animate-pulse" />
                      ) : callStatus === 'speaking' ? (
                        <div className="w-16 h-16 text-yellow-500 animate-spin">⏳</div>
                      ) : (
                        <Phone className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Audio level rings */}
                    {isListening && audioLevel > 0.1 && (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-green-400 animate-pulse opacity-50"></div>
                      </>
                    )}
                    
                    {isPlaying && (
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-pulse opacity-75"></div>
                    )}
                  </div>

                  {/* Status Text */}
                  <div className="text-center space-y-2">
                    {callStatus === 'listening' ? (
                      <p className="text-green-600 font-medium text-lg">🎤 Listening to you...</p>
                    ) : isPlaying ? (
                      <p className="text-blue-600 font-medium text-lg">🔊 AI Prospect speaking...</p>
                    ) : callStatus === 'speaking' ? (
                      <p className="text-yellow-600 font-medium text-lg">⏳ AI is thinking...</p>
                    ) : (
                      <p className="text-gray-600 text-lg">📞 Call is active - speak naturally</p>
                    )}
                    
                    {currentTranscript && (
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">You're saying:</p>
                        <p className="text-sm font-medium italic">"{currentTranscript}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? "default" : "outline"}
                    size="lg"
                    disabled={!isCallActive}
                  >
                    {isMuted ? (
                      <><VolumeX className="w-5 h-5 mr-2" />Unmuted</>
                    ) : (
                      <><Volume2 className="w-5 h-5 mr-2" />Mute AI</>
                    )}
                  </Button>

                  {isPlaying && (
                    <Button
                      onClick={stopCurrentAudio}
                      variant="outline"
                      size="lg"
                    >
                      <VolumeX className="w-5 h-5 mr-2" />
                      Stop AI
                    </Button>
                  )}

                  <Button
                    onClick={endCall}
                    variant="destructive"
                    size="lg"
                  >
                    <PhoneOff className="w-5 h-5 mr-2" />
                    End Call
                  </Button>
                </div>

                {/* Text fallback */}
                <div className="border-t pt-4">
                  <Label htmlFor="textFallback" className="text-sm text-muted-foreground">
                    Emergency text input (if voice fails)
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="textFallback"
                      placeholder="Type your message if voice isn't working..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendTextMessage()}
                      disabled={isLoading || !isCallActive}
                    />
                    <Button 
                      onClick={sendTextMessage} 
                      disabled={isLoading || !currentMessage.trim() || !isCallActive}
                      size="sm"
                    >
                      Send
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={getFeedback} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading || messages.length === 0}
                >
                  {isLoading ? 'Generating...' : 'Get Performance Feedback'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Call Transcript */}
          {isCallActive && messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Live Call Transcript</CardTitle>
                <Badge variant="outline">Real-time transcript</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm border-l-4 ${
                          message.role === 'user'
                            ? 'border-l-green-500 bg-green-50 dark:bg-green-950'
                            : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1 flex items-center gap-2">
                          {message.role === 'user' ? (
                            <>👤 You (Sales Agent)</>
                          ) : (
                            <>🤖 AI Prospect</>
                          )}
                          <span className="text-muted-foreground">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div>{message.text}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Feedback */}
        <div className="space-y-6">
          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-blue-600 mb-2">Opening</h4>
                    <p className="text-sm text-muted-foreground">{feedback.opening}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm text-green-600 mb-2">Discovery Questions</h4>
                    <p className="text-sm text-muted-foreground">{feedback.discovery_questions}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm text-orange-600 mb-2">Handling Objections</h4>
                    <p className="text-sm text-muted-foreground">{feedback.handling_objections}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm text-purple-600 mb-2">Value Proposition</h4>
                    <p className="text-sm text-muted-foreground">{feedback.value_proposition}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm text-red-600 mb-2">Closing</h4>
                    <p className="text-sm text-muted-foreground">{feedback.closing}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Overall Effectiveness</h4>
                    <p className="text-sm text-muted-foreground">{feedback.overall_effectiveness}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use Live Voice Calls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-2">
                <p><strong>1. Describe your scenario:</strong> Set up the sales situation you want to practice</p>
                <p><strong>2. Start live call:</strong> Click "Start Live Call" and allow microphone access</p>
                <p><strong>3. Speak naturally:</strong> Talk normally - the system listens continuously</p>
                <p><strong>4. Have a conversation:</strong> AI responds naturally like a real prospect</p>
                <p><strong>5. Get performance analysis:</strong> End call and get detailed feedback</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Live Call Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>✅ Continuous listening - no buttons to hold</li>
                  <li>✅ Natural turn-taking like real calls</li>
                  <li>✅ Real-time transcript of conversation</li>
                  <li>✅ Mute AI if you need to think</li>
                  <li>✅ Emergency text input if voice fails</li>
                  <li>✅ Interruption handling (you can cut off AI)</li>
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-2">Best Practices:</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Speak in a quiet environment</li>
                  <li>Use Chrome browser for best results</li>
                  <li>Speak clearly but naturally</li>
                  <li>Wait for AI to finish before responding</li>
                  <li>Use the mute button if you need silence</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}