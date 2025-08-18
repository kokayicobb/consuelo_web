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

export default function RoleplayPage() {
  const [scenario, setScenario] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
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
            } else {
              interimTranscript += transcript;
            }
          }
          
          setCurrentTranscript(interimTranscript || finalTranscript);
          
          // Process final result
          if (finalTranscript.trim() && !isProcessingRef.current) {
            handleUserSpeech(finalTranscript.trim());
            finalTranscript = '';
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'network') {
            // Restart recognition on network error
            setTimeout(() => {
              if (isCallActive) {
                startListening();
              }
            }, 1000);
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
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
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
      // Resume listening after a brief pause
      setTimeout(() => {
        if (isCallActive && !isPlaying) {
          startListening();
        }
      }, 500);
    }
  };

  const getAIResponse = async (userText: string, conversationHistory: Message[]) => {
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
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.response;
  };

  const initiateAIGreeting = async () => {
    try {
      const greeting = await getAIResponse("", []);
      const aiMessage: Message = { role: 'assistant', text: greeting };
      setMessages([aiMessage]);
      
      if (!isMuted) {
        await playAIResponse(greeting);
      }
    } catch (error) {
      console.error('Error with AI greeting:', error);
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
      setIsPlaying(true);
      setCallStatus('speaking');
      
      const ttsResponse = await fetch('/api/roleplay/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!ttsResponse.ok) {
        throw new Error('Failed to generate speech');
      }

      const ttsData = await ttsResponse.json();
      
      // Convert base64 audio to blob and play
      const audioData = atob(ttsData.audio_base64);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: ttsData.mime_type });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      
      currentAudioRef.current = new Audio(audioUrl);
      currentAudioRef.current.onended = () => {
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
      
      await currentAudioRef.current.play();
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