'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [selectedVoiceId, setSelectedVoiceId] = useState('uYXf8XasLslADfZ2MB4u');
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  
  // Voice-specific state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'user_turn' | 'ai_turn'>('idle');
  const [isPushToTalkPressed, setIsPushToTalkPressed] = useState(false);
  
  // Refs for audio functionality
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const isCallActiveRef = useRef(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio level monitoring for visual feedback
  useEffect(() => {
    let animationFrame: number;
    
    const updateAudioLevel = () => {
      if (analyserRef.current && isRecording) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
      }
      animationFrame = requestAnimationFrame(updateAudioLevel);
    };
    
    if (isRecording) {
      updateAudioLevel();
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRecording]);

  // Keep ref in sync with state
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;
      setupAudioAnalyser(stream);
      
      // Initialize media recorder for chunked recording
      initializeMediaRecorder(stream);
      
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

  const initializeMediaRecorder = (stream: MediaStream) => {
    try {
      // Use webm format which is widely supported
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0 && !isProcessingRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          
          // Only process if we have substantial audio (> 100KB typically means speech)
          if (audioBlob.size > 100000) {
            await processAudioChunk(audioBlob);
          }
        }
      };

      console.log('🎤 MediaRecorder initialized with mimeType:', mimeType);
    } catch (error) {
      console.error('Error initializing MediaRecorder:', error);
    }
  };

  const startContinuousRecording = () => {
    if (!isCallActiveRef.current || isProcessingRef.current || isPlaying) return;
    
    startRecording();
    
    // Record in 3-second chunks for continuous transcription
    recordingIntervalRef.current = setInterval(() => {
      if (isCallActiveRef.current && !isProcessingRef.current && !isPlaying) {
        stopRecording();
        // Small delay before starting next recording
        setTimeout(() => {
          if (isCallActiveRef.current && !isProcessingRef.current && !isPlaying) {
            startRecording();
          }
        }, 100);
      }
    }, 3000);
  };

  const stopContinuousRecording = () => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    stopRecording();
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCallStatus('listening');
      console.log('🎤 Started recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('🎤 Stopped recording');
    }
  };

  const processAudioChunk = async (audioBlob: Blob) => {
    try {
      console.log('🎤 Processing audio chunk, size:', audioBlob.size);
      
      // Create FormData and append the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      // Send to Groq Whisper API
      const response = await fetch('/api/roleplay/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      
      if (data.text && data.text.trim().length > 2) {
        console.log('🎤 Transcribed:', data.text);
        setCurrentTranscript(data.text);
        
        // Process the transcribed text
        if (!isProcessingRef.current) {
          await handleUserSpeech(data.text.trim());
        }
      }
    } catch (error) {
      console.error('Error processing audio chunk:', error);
      // Continue recording even if transcription fails
      if (isCallActiveRef.current && !isProcessingRef.current) {
        startContinuousRecording();
      }
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (transcript.length < 3 || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    stopContinuousRecording();
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
      
      // Resume recording after AI finishes
      if (isCallActiveRef.current) {
        setTimeout(() => {
          startContinuousRecording();
        }, 500);
      }
    }
  };

  const getAIResponse = async (userText: string, conversationHistory: Message[]) => {
    console.log('🤖 Getting AI response for:', userText);
    
    const response = await fetch('/api/roleplay/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userText,
        history: conversationHistory,
        scenario: scenario
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Chat API failed:', response.status, errorText);
      throw new Error(`Failed to get AI response: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  };

  const initiateAIGreeting = async () => {
    try {
      console.log('👋 Initiating AI greeting...');
      const greeting = await getAIResponse("", []);
      const aiMessage: Message = { role: 'assistant', text: greeting };
      setMessages([aiMessage]);
      
      if (!isMuted) {
        await playAIResponse(greeting);
      } else {
        // If muted, start recording immediately
        setTimeout(() => {
          if (isCallActiveRef.current) {
            startContinuousRecording();
          }
        }, 500);
      }
    } catch (error) {
      console.error('❌ Error with AI greeting:', error);
      // Start recording anyway
      setTimeout(() => {
        if (isCallActiveRef.current) {
          startContinuousRecording();
        }
      }, 500);
    }
  };

  const playAIResponse = async (text: string) => {
    try {
      console.log('🔊 Starting TTS for text:', text);
      setIsPlaying(true);
      setCallStatus('speaking');
      
      const ttsResponse = await fetch('/api/roleplay/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          voice_id: selectedVoiceId 
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('Failed to generate speech');
      }

      const ttsData = await ttsResponse.json();
      
      if (ttsData.use_browser_tts) {
        // Use browser's Speech Synthesis API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          
          const utterance = new SpeechSynthesisUtterance(ttsData.text);
          utterance.rate = ttsData.voice_settings.rate;
          utterance.pitch = ttsData.voice_settings.pitch;
          utterance.volume = ttsData.voice_settings.volume;
          
          utterance.onend = () => {
            setIsPlaying(false);
            setCallStatus('active');
            if (isCallActiveRef.current) {
              setTimeout(() => startContinuousRecording(), 500);
            }
          };
          
          utterance.onerror = () => {
            setIsPlaying(false);
            setCallStatus('active');
            if (isCallActiveRef.current) {
              setTimeout(() => startContinuousRecording(), 500);
            }
          };
          
          window.speechSynthesis.speak(utterance);
        }
      } else if (ttsData.audio_base64 && ttsData.mime_type) {
        // Play ElevenLabs audio
        const audioData = atob(ttsData.audio_base64);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        
        const audioBlob = new Blob([audioArray], { type: ttsData.mime_type });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        currentAudioRef.current = new Audio(audioUrl);
        currentAudioRef.current.onended = () => {
          setIsPlaying(false);
          setCallStatus('active');
          URL.revokeObjectURL(audioUrl);
          if (isCallActiveRef.current) {
            setTimeout(() => startContinuousRecording(), 500);
          }
        };
        
        currentAudioRef.current.onerror = () => {
          setIsPlaying(false);
          setCallStatus('active');
          URL.revokeObjectURL(audioUrl);
          if (isCallActiveRef.current) {
            setTimeout(() => startContinuousRecording(), 500);
          }
        };
        
        await currentAudioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      setCallStatus('active');
      if (isCallActiveRef.current) {
        setTimeout(() => startContinuousRecording(), 500);
      }
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsSessionActive(false);
    setCallStatus('idle');
    setIsRecording(false);
    setIsPlaying(false);
    setCurrentTranscript('');
    isProcessingRef.current = false;
    
    // Stop recording
    stopContinuousRecording();
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
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Mic className="w-3 h-3 mr-1" />Recording
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="default" className="animate-pulse">
              <Volume2 className="w-3 h-3 mr-1" />AI Speaking
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
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={startCall} 
                  disabled={isCallActive || !scenario.trim()}
                  className="flex-1"
                  size="lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Start Live Call
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
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Call Visualization */}
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div 
                      className={`w-40 h-40 mx-auto rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                          ? 'border-green-500 bg-green-50 dark:bg-green-950' 
                          : isPlaying 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-300 bg-gray-50 dark:bg-gray-800'
                      }`}
                      style={{
                        transform: isRecording ? `scale(${1 + audioLevel * 0.2})` : 'scale(1)',
                      }}
                    >
                      {isRecording ? (
                        <Mic className="w-16 h-16 text-green-500" />
                      ) : isPlaying ? (
                        <Volume2 className="w-16 h-16 text-blue-500 animate-pulse" />
                      ) : (
                        <Phone className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Audio level rings */}
                    {isRecording && audioLevel > 0.1 && (
                      <>
                        <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping opacity-75"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-green-400 animate-pulse opacity-50"></div>
                      </>
                    )}
                  </div>

                  {/* Status Text */}
                  <div className="text-center space-y-2">
                    {isRecording ? (
                      <p className="text-green-600 font-medium text-lg">🎤 Recording your voice...</p>
                    ) : isPlaying ? (
                      <p className="text-blue-600 font-medium text-lg">🔊 AI Prospect speaking...</p>
                    ) : (
                      <p className="text-gray-600 text-lg">📞 Call is active</p>
                    )}
                    
                    {currentTranscript && (
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">You said:</p>
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
                  >
                    {isMuted ? (
                      <><VolumeX className="w-5 h-5 mr-2" />Unmute</>
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
                        <div className="text-xs font-medium text-muted-foreground mb-1">
                          {message.role === 'user' ? '👤 You' : '🤖 AI Prospect'}
                        </div>
                        <div className="text-sm">{message.text}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Conversation History & Feedback */}
        <div className="space-y-6">
          {/* Conversation History (for non-call mode) */}
          {!isCallActive && messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Conversation History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80 w-full">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-green-50 dark:bg-green-950 border-l-4 border-l-green-500'
                            : 'bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-500'
                        }`}
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          {message.role === 'user' ? '👤 You (Salesperson)' : '🤖 AI Prospect'}
                        </div>
                        <div className="text-sm leading-relaxed">{message.text}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <Label htmlFor="message">Send a message</Label>
                  <div className="flex gap-2">
                    <Input
                      id="message"
                      placeholder="Type your sales pitch or response..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendTextMessage()}
                      disabled={isLoading}
                    />
                    <Button 
                      onClick={sendTextMessage} 
                      disabled={isLoading || !currentMessage.trim()}
                    >
                      {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={getFeedback} 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={isLoading || messages.length === 0}
                >
                  {isLoading ? 'Generating...' : 'Get Performance Feedback'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Performance Feedback */}
          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Feedback</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI analysis of your sales conversation
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        📞 Opening & First Impression
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {feedback.opening}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        🔍 Discovery & Questions
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        {feedback.discovery_questions}
                      </p>
                    </div>

                    <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                        ⚡ Handling Objections
                      </h4>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        {feedback.handling_objections}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                        💡 Value Proposition
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        {feedback.value_proposition}
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                        🎯 Closing Technique
                      </h4>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        {feedback.closing}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        📊 Overall Effectiveness
                      </h4>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        {feedback.overall_effectiveness}
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Empty State / Instructions */}
          {!isCallActive && messages.length === 0 && !feedback && (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Sales Training</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-6xl">🎯</div>
                <div className="space-y-2">
                  <h3 className="font-medium">Ready to practice your sales skills?</h3>
                  <p className="text-sm text-muted-foreground">
                    1. Set up your scenario on the left
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Choose an AI voice for your prospect
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Start a live voice call or type messages
                  </p>
                  <p className="text-sm text-muted-foreground">
                    4. Get detailed performance feedback
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Use realistic scenarios like cold calls, follow-ups, or objection handling practice
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}