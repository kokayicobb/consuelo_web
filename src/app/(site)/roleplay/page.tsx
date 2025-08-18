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
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'active' | 'user_turn' | 'ai_turn' | 'speaking' | 'listening'>('idle');
  const [isPushToTalkPressed, setIsPushToTalkPressed] = useState(false);
  
  // Refs for audio functionality
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);


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
      
      // Initialize media recorder
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

  const handlePushToTalkStart = () => {
    if (!isCallActive || isPlaying || callStatus !== 'user_turn') return;
    
    setIsPushToTalkPressed(true);
    startRecording();
  };

  const handlePushToTalkEnd = () => {
    if (!isPushToTalkPressed) return;
    
    setIsPushToTalkPressed(false);
    stopRecording();
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
          
          // Process audio if we have any content
          if (audioBlob.size > 1000) {
            await processAudioChunk(audioBlob);
          }
        }
      };

      console.log('🎤 MediaRecorder initialized with mimeType:', mimeType);
    } catch (error) {
      console.error('Error initializing MediaRecorder:', error);
    }
  };


  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
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
      setCallStatus('user_turn');
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (transcript.length < 3 || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setCallStatus('ai_turn');
    
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
      } else {
        // If muted, go back to user turn immediately
        setCallStatus('user_turn');
      }
    } catch (error) {
      toast.error('Connection issue - please try again');
      console.error('Error handling user speech:', error);
      setCallStatus('user_turn');
    } finally {
      isProcessingRef.current = false;
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
        // If muted, go to user turn immediately
        setCallStatus('user_turn');
      }
    } catch (error) {
      console.error('❌ Error with AI greeting:', error);
      setCallStatus('user_turn');
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
            setCallStatus('user_turn');
          };
          
          utterance.onerror = () => {
            setIsPlaying(false);
            setCallStatus('user_turn');
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
          setCallStatus('user_turn');
          URL.revokeObjectURL(audioUrl);
        };
        
        currentAudioRef.current.onerror = () => {
          setIsPlaying(false);
          setCallStatus('user_turn');
          URL.revokeObjectURL(audioUrl);
        };
        
        await currentAudioRef.current.play();
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlaying(false);
      setCallStatus('user_turn');
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
    
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    stopCurrentAudio();
    
    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    toast.success('Call ended');
  };

  const resetScenario = () => {
    setScenario('');
    setMessages([]);
    setCurrentMessage('');
    setFeedback(null);
    setIsSessionActive(false);
    setIsCallActive(false);
    setCallStatus('idle');
    setCurrentTranscript('');
    toast.success('Scenario reset');
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

      {/* During Call Layout - Side by Side */}
      {isCallActive ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Live Call Interface */}
          <div className="space-y-6">

            {/* Live Call Interface */}
            <Card>
              <CardHeader>
                <CardTitle>Live Sales Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Push-to-Talk Interface */}
                <div className="text-center space-y-4">
                  {/* Status Text */}
                  <div className="space-y-2">
                    {callStatus === 'user_turn' ? (
                      <p className="text-base font-medium text-blue-600">Your turn - Press and hold to speak</p>
                    ) : callStatus === 'ai_turn' ? (
                      <p className="text-base font-medium text-purple-600">AI is thinking...</p>
                    ) : isPlaying ? (
                      <p className="text-base font-medium text-green-600">🔊 AI Prospect is speaking</p>
                    ) : (
                      <p className="text-base font-medium text-gray-600">📞 Call in progress</p>
                    )}
                    
                    {currentTranscript && (
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-sm mx-auto">
                        <p className="text-xs text-muted-foreground mb-1">You said:</p>
                        <p className="text-xs font-medium italic">"{currentTranscript}"</p>
                      </div>
                    )}
                  </div>

                  {/* Large Push-to-Talk Button */}
                  <div className="flex justify-center">
                    <button
                      onMouseDown={handlePushToTalkStart}
                      onMouseUp={handlePushToTalkEnd}
                      onMouseLeave={handlePushToTalkEnd}
                      onTouchStart={handlePushToTalkStart}
                      onTouchEnd={handlePushToTalkEnd}
                      disabled={callStatus !== 'user_turn' || isPlaying}
                      className={`w-32 h-32 sm:w-40 sm:h-40 lg:w-36 lg:h-36 xl:w-48 xl:h-48 rounded-full border-8 flex items-center justify-center transition-all duration-200 active:scale-95 ${
                        isPushToTalkPressed 
                          ? 'border-green-500 bg-green-500 shadow-2xl scale-105' 
                          : callStatus === 'user_turn' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 shadow-lg hover:scale-105'
                          : 'border-gray-300 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                      }`}
                    >
                      {isPushToTalkPressed ? (
                        <Mic className="w-12 h-12 sm:w-16 sm:h-16 lg:w-14 lg:h-14 xl:w-20 xl:h-20 text-white animate-pulse" />
                      ) : callStatus === 'user_turn' ? (
                        <Mic className="w-12 h-12 sm:w-16 sm:h-16 lg:w-14 lg:h-14 xl:w-20 xl:h-20 text-blue-500" />
                      ) : isPlaying ? (
                        <Volume2 className="w-12 h-12 sm:w-16 sm:h-16 lg:w-14 lg:h-14 xl:w-20 xl:h-20 text-gray-400 animate-pulse" />
                      ) : (
                        <Mic className="w-12 h-12 sm:w-16 sm:h-16 lg:w-14 lg:h-14 xl:w-20 xl:h-20 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {callStatus === 'user_turn' ? (
                      "Hold the button while speaking, then release when done"
                    ) : isPlaying ? (
                      "Listen to the AI response"
                    ) : (
                      "Wait for your turn to speak"
                    )}
                  </div>
                </div>

                {/* Call Controls */}
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? "default" : "outline"}
                    size="sm"
                  >
                    {isMuted ? (
                      <><VolumeX className="w-4 h-4 mr-1" />Unmute</>
                    ) : (
                      <><Volume2 className="w-4 h-4 mr-1" />Mute AI</>
                    )}
                  </Button>

                  {isPlaying && (
                    <Button
                      onClick={stopCurrentAudio}
                      variant="outline"
                      size="sm"
                    >
                      <VolumeX className="w-4 h-4 mr-1" />
                      Stop AI
                    </Button>
                  )}

                  <Button
                    onClick={endCall}
                    variant="destructive"
                    size="sm"
                  >
                    <PhoneOff className="w-4 h-4 mr-1" />
                    End Call
                  </Button>
                </div>

                {/* Text fallback */}
                <div className="border-t pt-3">
                  <Label htmlFor="textFallback" className="text-xs text-muted-foreground">
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
                      className="text-sm"
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
                  size="sm"
                >
                  {isLoading ? 'Generating...' : 'Get Performance Feedback'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Live Transcript During Call */}
          <div className="space-y-6">

            {/* Live Call Transcript */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Live Call Transcript</CardTitle>
                <Badge variant="outline">Real-time transcript</Badge>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  <div className="space-y-3">
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
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
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <p>Conversation will appear here...</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Setup Layout - When Not In Call */
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Setup */}
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
                </div>
                
                {/* Reset Button - Only show if there's content to reset */}
                {(messages.length > 0 || feedback || scenario.trim()) && (
                  <Button 
                    onClick={resetScenario}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Reset Scenario
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Conversation History & Feedback */}
          <div className="space-y-6">
            {/* Conversation History (for non-call mode) */}
            {messages.length > 0 && (
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
              {messages.length === 0 && !feedback && (
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
        )}
    </div>
  );
}