"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
} from "lucide-react";
import { UserButton, SignIn, useUser } from "@clerk/nextjs";
import Image from "next/image";
import LiquidOrbButton from "@/components/roleplay/LiquidOrbButton";
import CreditsDisplay from "@/components/roleplay/CreditsDisplay";
import ThemeToggler from "@/components/Header/ThemeToggler";
import RoleplayCommandPalette from "@/components/roleplay/roleplay-command-palette";
import { Scenario, Character, RoleplaySession } from "@/components/roleplay/types";

interface Message {
  role: "user" | "assistant";
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
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    // Set custom attributes on the document body to hide both header and footer
    document.body.setAttribute("data-hide-header", "true");
    document.body.setAttribute("data-hide-footer", "true");

    // Clean up when component unmounts
    return () => {
      document.body.removeAttribute("data-hide-header");
      document.body.removeAttribute("data-hide-footer");
    };
  }, []);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Voice selection state
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState(
    "jqcCZkN6Knx8BJ5TBdYR",
  );
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  // Voice-specific state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<
    | "idle"
    | "connecting"
    | "active"
    | "user_turn"
    | "ai_turn"
    | "speaking"
    | "listening"
  >("idle");
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechDetected, setSpeechDetected] = useState(false);
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);

  // Modal states
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Usage tracking states
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentRoleplaySessionId, setCurrentRoleplaySessionId] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  // Theme state for command palette
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const endCall = useCallback(async () => {
    console.log("📞 endCall() triggered", new Error().stack);
    setIsCallActive(false);
    setIsSessionActive(false);
    setCallStatus("idle");
    setIsRecording(false);
    setIsPlaying(false);
    setCurrentTranscript("");
    isProcessingRef.current = false;

    // Stop any ongoing recording or listening
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
    if (isListening) {
      setIsListening(false);
      setSpeechDetected(false);
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    }
    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    
    // Clean up silence timer
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }

    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // End usage session and deduct credits
    if (currentSessionId) {
      try {
        const response = await fetch("/api/usage/end-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentSessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(
            `Call ended. Session: ${data.durationMinutes}min, Cost: $${data.creditsUsed.toFixed(2)}`
          );
          setUserCredits(data.remainingCredits);
        }
      } catch (error) {
        console.error("Error ending usage session:", error);
      }
      
      setCurrentSessionId(null);
      setSessionStartTime(null);
    } else {
      toast.success("Call ended");
    }

    // End roleplay session in MongoDB
    if (currentRoleplaySessionId) {
      try {
        const response = await fetch(`/api/roleplay/sessions/${currentRoleplaySessionId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'completed',
            conversation_history: messages.map(msg => ({
              role: msg.role,
              text: msg.text,
              timestamp: new Date().toISOString()
            })),
            end_time: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`Update session API error: ${response.status}`);
        }

        console.log("✅ Ended roleplay session:", currentRoleplaySessionId);
        setCurrentRoleplaySessionId(null);
      } catch (error) {
        console.error("❌ Failed to end roleplay session:", error);
      }
    }
  }, [currentRoleplaySessionId, messages, currentSessionId, isListening, isRecording, silenceTimer]);
  // Refs for audio functionality
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);

  // Keep refs to avoid stale closures
  const isCallActiveRef = useRef(isCallActive);
  const currentSessionIdRef = useRef(currentSessionId);
  const isListeningRef = useRef(isListening);
  const callStatusRef = useRef(callStatus);
  const isPlayingRef = useRef(isPlaying);
  
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);
  
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);
  
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  
  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);
  
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Cleanup on unmount - only when component actually unmounts
  useEffect(() => {
    return () => {
      // Only end call if we're still mounted and have an active call
      if (isCallActiveRef.current) {
        console.log("📞 Component unmounting with active call, ending call");
        // Use a simplified cleanup that doesn't depend on state
        const cleanup = async () => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
          if (currentAudioRef.current) {
            currentAudioRef.current.pause();
          }
          if (currentSessionIdRef.current) {
            try {
              await fetch("/api/usage/end-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: currentSessionIdRef.current }),
              });
            } catch (error) {
              console.error("Error ending session on unmount:", error);
            }
          }
        };
        cleanup();
      }
    };
  }, []); // Empty dependency array so this only runs on mount/unmount

 

  // Keyboard shortcuts for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
      
      if (!isInputField) {
        if (e.key === '/' && !showCommandPalette) {
          e.preventDefault();
          setShowCommandPalette(true);
        } else if (e.key === 'Escape' && showCommandPalette) {
          e.preventDefault();
          setShowCommandPalette(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  // Fetch available voices on component mount
  useEffect(() => {
    const fetchVoices = async () => {
      setIsLoadingVoices(true);
      try {
        const response = await fetch("/api/roleplay/voices");
        if (response.ok) {
          const data = await response.json();
          setAvailableVoices(data.voices || []);
          console.log("🎤 Loaded", data.voices?.length, "voices");
        } else {
          console.error("Failed to fetch voices:", response.status);
        }
      } catch (error) {
        console.error("Error fetching voices:", error);
      } finally {
        setIsLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

  const startCall = async () => {
    if (!currentScenario) {
      toast.error("Please select a scenario first");
      return;
    }

    setCallStatus("connecting");

    try {
      // Start usage session and check credits
      const usageResponse = await fetch("/api/usage/start-session", {
        method: "POST",
      });

      if (!usageResponse.ok) {
        const errorData = await usageResponse.json();
        if (usageResponse.status === 402) {
          toast.error("Insufficient credits. Please add credits to continue.");
        } else {
          toast.error(errorData.error || "Failed to start session");
        }
        setCallStatus("idle");
        return;
      }

      const usageData = await usageResponse.json();
      setCurrentSessionId(usageData.sessionId);
      setSessionStartTime(new Date());

      // Create roleplay session in MongoDB
      try {
        console.log("🔄 Creating roleplay session with user ID:", user?.id);
        const response = await fetch('/api/roleplay/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario_id: "68c23a20303cd41e97d36baf", // life-insurance-cold-call scenario ID
            character_id: undefined, // character_id (optional)
            user_id: user?.id || 'anonymous'
          })
        });

        if (!response.ok) {
          throw new Error(`Create session API error: ${response.status}`);
        }

        const data = await response.json();
        const roleplaySession = data.session;
        console.log("✅ Created roleplay session response:", roleplaySession);
        setCurrentRoleplaySessionId(roleplaySession.id);
        console.log("✅ Set roleplay session ID:", roleplaySession.id);
      } catch (error) {
        console.error("❌ Failed to create roleplay session:", error);
        // Continue anyway since this is just for tracking - create a fallback session
        setCurrentRoleplaySessionId(`session_${Date.now()}`);
      }

      // Request microphone permissions with better error handling
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
      } catch (micError) {
        console.error("Microphone access error:", micError);
        if (micError.name === "NotAllowedError") {
          toast.error("Microphone access denied. Please allow microphone access in your browser settings and try again.");
        } else if (micError.name === "NotFoundError") {
          toast.error("No microphone found. Please connect a microphone and try again.");
        } else if (micError.name === "NotSupportedError") {
          toast.error("Microphone access not supported on this browser.");
        } else {
          toast.error("Failed to access microphone. Please check your browser settings and try again.");
        }
        setCallStatus("idle");
        return;
      }

      // Initialize media recorder
      initializeMediaRecorder(stream);

      setIsSessionActive(true);
      setIsCallActive(true);
      setMessages([]);
      setFeedback(null);
      setCallStatus("active");

      toast.success("Call connected! Start speaking naturally.");

      // Start the call with AI greeting
      setTimeout(() => {
        initiateAIGreeting();
      }, 1000);
      
      // Listening will start automatically when callStatus changes to user_turn
    } catch (error) {
      toast.error("Failed to connect. Please allow microphone access.");
      console.error("Error starting call:", error);
      setCallStatus("idle");
    }
  };

  const startContinuousRecording = useCallback(() => {
    console.log("🎤 startContinuousRecording called");
    console.log("🎤 streamRef.current:", !!streamRef.current);
    console.log("🎤 isRecording:", isRecording);
    console.log("🎤 mediaRecorderRef.current:", !!mediaRecorderRef.current);
    console.log("🎤 mediaRecorderRef.current.state:", mediaRecorderRef.current?.state);
    
    if (!streamRef.current || isRecording) {
      console.log("🎤 Exiting early - no stream or already recording");
      return;
    }
    
    // Start with speech detection
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      audioChunksRef.current = [];
      setRecordingStartTime(Date.now());
      console.log("🎤 About to start MediaRecorder...");
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("🎤 Started continuous recording");
      
      // Set up automatic stop after silence
      const timer = setTimeout(() => {
        console.log("🤫 No speech detected, continuing to listen...");
        // Continue listening but reset the recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
        // Don't automatically restart - let the onstop handler do it
      }, 3000); // Wait 3 seconds for speech
      
      setSilenceTimer(timer);
    } else {
      console.log("🎤 Cannot start recording - MediaRecorder not ready or not inactive");
    }
  }, [isRecording]);

  const startListening = useCallback(() => {
    console.log("🎯 startListening called, callStatus:", callStatus, "isCallActive:", isCallActive, "isPlaying:", isPlaying, "isListening:", isListening);
    if (!isCallActive || isPlaying || callStatus !== "user_turn" || isListening) {
      console.log("🎯 startListening conditions not met, aborting");
      return;
    }
    
    console.log("🎯 Starting listening...");
    setIsListening(true);
    setSpeechDetected(false);
    startContinuousRecording();
  }, [isCallActive, isPlaying, callStatus, isListening, startContinuousRecording]);

  const stopListening = useCallback(() => {
    if (!isListening) return;
    
    console.log("🛑 Stopping listening...");
    setIsListening(false);
    setSpeechDetected(false);
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    stopRecording();
  }, [isListening, silenceTimer]);

 
   // Auto-start listening when it becomes user's turn
   useEffect(() => {
    if (callStatus === "user_turn" && isCallActive && !isPlaying && !isListening) {
      console.log("🎯 Auto-starting listening because status changed to user_turn");
      const timer = setTimeout(() => {
        console.log("🎯 Timer executing - checking conditions again...");
        console.log("🎯 Current refs - callStatus:", callStatusRef.current, "isCallActive:", isCallActiveRef.current, "isPlaying:", isPlayingRef.current, "isListening:", isListeningRef.current);
        
        if (callStatusRef.current === "user_turn" && isCallActiveRef.current && !isPlayingRef.current && !isListeningRef.current) {
          console.log("🎯 Conditions met, starting listening...");
          setIsListening(true);
          setSpeechDetected(false);
          startContinuousRecording();
        } else {
          console.log("🎯 Conditions not met, aborting auto-start");
        }
      }, 500); // Small delay to ensure state is settled
      
      return () => clearTimeout(timer);
    }
  }, [callStatus, isCallActive, isPlaying, isListening, startContinuousRecording]);
  const initializeMediaRecorder = (stream: MediaStream) => {
    try {
      // Use webm format which is widely supported
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000,
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (audioChunksRef.current.length > 0 && !isProcessingRef.current) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          audioChunksRef.current = [];

          // Check recording duration
          const recordingDuration = recordingStartTime ? Date.now() - recordingStartTime : 0;
          console.log("🎤 Recording duration:", recordingDuration, "ms");

          // Only process if recording was long enough and has sufficient audio data
          if (audioBlob.size > 1000 && recordingDuration > 500) { // At least 500ms
            await processAudioChunk(audioBlob);
          } else {
            console.log("🎤 Recording too short or small, restarting continuous recording...");
            // Only restart if we're still listening and it's user turn
            setTimeout(() => {
              if (isListening && callStatus === "user_turn" && isCallActive) {
                startContinuousRecording();
              }
            }, 100);
          }
        }
        setRecordingStartTime(null);
      };

      console.log("🎤 MediaRecorder initialized with mimeType:", mimeType);
    } catch (error) {
      console.error("Error initializing MediaRecorder:", error);
    }
  };

  const startRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      audioChunksRef.current = [];
      setRecordingStartTime(Date.now());
      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log("🎤 Started recording");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("🎤 Stopped recording");
    }
  };

  const processAudioChunk = async (audioBlob: Blob) => {
    try {
      console.log("🎤 Processing audio chunk, size:", audioBlob.size);

      // Skip very small audio chunks - likely silence or noise
      if (audioBlob.size < 5000) {
        console.log("🎤 Skipping small audio chunk, likely silence");
        return;
      }

      // Create FormData and append the audio file
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.webm");

      // Send to Groq Whisper API
      const response = await fetch("/api/roleplay/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      console.log("🎤 Raw transcription response:", data);

      // Check for actual meaningful speech with stricter criteria
      if (data.text && data.text.trim().length > 3) {
        const transcript = data.text.trim();
        console.log("🎤 Transcribed:", transcript);
        
        // Ignore common false transcriptions
        const ignoredPhrases = ["thank you", "thanks", ".", "", " "];
        const isIgnored = ignoredPhrases.some(phrase => 
          transcript.toLowerCase() === phrase.toLowerCase()
        );
        
        if (!isIgnored) {
          setCurrentTranscript(transcript);

          // Process the transcribed text
          if (!isProcessingRef.current) {
            await handleUserSpeech(transcript);
          }
        } else {
          console.log("🎤 Ignoring likely false transcription:", transcript);
        }
      } else {
        console.log("🎤 No meaningful speech detected, text:", data.text);
      }
    } catch (error) {
      console.error("Error processing audio chunk:", error);
      setCallStatus("user_turn");
    }
  };
 
  const handleUserSpeech = async (transcript: string) => {
    if (transcript.length < 3 || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setCallStatus("ai_turn");

    console.log("🔍 DEBUG: Current messages before adding user message:", messages);
    console.log("🔍 DEBUG: Messages length:", messages.length);
    
    setCurrentTranscript("");

    // Add user message to conversation
    const userMessage: Message = { role: "user", text: transcript };
    const updatedMessages = [...messages, userMessage];
    console.log("🔍 DEBUG: Updated messages with user message:", updatedMessages);
    
    setMessages(updatedMessages);
    
    // Call API with the updated messages
    await getAIResponseAndUpdateMessages(transcript, updatedMessages);
  };

  const getAIResponseAndUpdateMessages = async (transcript: string, currentMessages: Message[]) => {
    try {
      // Get AI response with the full conversation history
      const response = await getAIResponse(transcript, currentMessages);

      // Add AI message to conversation
      const aiMessage: Message = { role: "assistant", text: response };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

      // Play AI response
      if (!isMuted) {
        await playAIResponse(response);
      } else {
        // If muted, go back to user turn immediately
        setCallStatus("user_turn");
      }
    } catch (error) {
      toast.error("Connection issue - please try again");
      console.error("Error handling user speech:", error);
      setCallStatus("user_turn");
    } finally {
      isProcessingRef.current = false;
    }
  };

  const getAIResponse = async (
    userText: string,
    conversationHistory: Message[],
  ) => {
    console.log("🤖 Getting AI response for:", userText);

    const response = await fetch("/api/roleplay/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history: conversationHistory,
        scenario: currentScenario,
        character: currentCharacter,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Chat API failed:", response.status, errorText);
      throw new Error(`Failed to get AI response: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  };

  const initiateAIGreeting = async () => {
    try {
      console.log("👋 Initiating AI greeting...");
      const greeting = await getAIResponse("", messages);
      const aiMessage: Message = { role: "assistant", text: greeting };
      setMessages([aiMessage]);

      if (!isMuted) {
        await playAIResponse(greeting);
      } else {
        // If muted, go to user turn immediately
        setCallStatus("user_turn");
      }
    } catch (error) {
      console.error("❌ Error with AI greeting:", error);
      setCallStatus("user_turn");
    }
  };

  const playAIResponse = async (text: string) => {
    try {
      console.log("🔊 Starting TTS for text:", text);
      setIsPlaying(true);
      setCallStatus("speaking");

      const ttsResponse = await fetch("/api/roleplay/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice_id: selectedVoiceId,
        }),
      });

      if (!ttsResponse.ok) {
        throw new Error("Failed to generate speech");
      }

      const ttsData = await ttsResponse.json();

      if (ttsData.use_browser_tts) {
        // Use browser's Speech Synthesis API
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(ttsData.text);
          utterance.rate = ttsData.voice_settings.rate;
          utterance.pitch = ttsData.voice_settings.pitch;
          utterance.volume = ttsData.voice_settings.volume;

          utterance.onend = () => {
            setIsPlaying(false);
            setCallStatus("user_turn");
          };

          utterance.onerror = () => {
            setIsPlaying(false);
            setCallStatus("user_turn");
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
          setCallStatus("user_turn");
          URL.revokeObjectURL(audioUrl);
        };

        currentAudioRef.current.onerror = () => {
          setIsPlaying(false);
          setCallStatus("user_turn");
          URL.revokeObjectURL(audioUrl);
        };

        await currentAudioRef.current.play();
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlaying(false);
      setCallStatus("user_turn");
    }
  };

 

  const resetScenario = () => {
    setCurrentScenario(null);
    setCurrentCharacter(null);
    setMessages([]);
    setCurrentMessage("");
    setFeedback(null);
    setIsSessionActive(false);
    setIsCallActive(false);
    setCallStatus("idle");
    setCurrentTranscript("");
    toast.success("Scenario reset");
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

    const userMessage: Message = { role: "user", text: currentMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const response = await getAIResponse(currentMessage, updatedMessages);
      const aiMessage: Message = { role: "assistant", text: response };
      setMessages([...updatedMessages, aiMessage]);

      if (!isMuted && isCallActive) {
        await playAIResponse(response);
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeedback = async () => {
    if (messages.length === 0) {
      toast.error("No conversation to analyze");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/roleplay/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          scenario: currentScenario,
          character: currentCharacter,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get feedback");
      }

      const feedbackData = await response.json();
      setFeedback(feedbackData);
      toast.success("Feedback generated successfully!");
    } catch (error) {
      toast.error("Failed to generate feedback");
      console.error("Error getting feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Command palette handlers
  const handleStartSession = (scenario: Scenario, character?: Character) => {
    setCurrentScenario(scenario);
    setCurrentCharacter(character || null);
    setShowCommandPalette(false);
    toast.success(`Started session: ${scenario.title}${character ? ` with ${character.name}` : ''}`);
    // Automatically start the call after selecting scenario
    setTimeout(() => {
      startCall();
    }, 500);
  };

  const handleResumeSession = (session: RoleplaySession) => {
    // This would need to be implemented to restore session state
    setShowCommandPalette(false);
    toast.success('Resume session functionality to be implemented');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    // You could also integrate with your existing theme system here
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    setIsMuted(!enabled);
  };

  return (
    <div className="h-screen bg-transparent flex flex-col overflow-hidden">
      {/* Header with logo, centered status, and user controls */}
      {!isCallActive && (
        <div className="relative flex items-center justify-between p-4 sm:p-6 flex-shrink-0">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Image
              src="/apple-touch-icon.png"
              alt="Consuelo Logo"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </div>

          {/* Center - Status Badge */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Badge
              variant="white"
              className="px-2 py-1 text-xs"
            >
              {callStatus === "idle" ? (
                <>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Ready to Start
                </>
              ) : callStatus === "connecting" ? (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-4 w-4" />
                  Live Call
                </>
              )}
            </Badge>
          </div>

          {/* Credits and Controls - Right side, inline with status */}
          <div className="absolute right-4 sm:right-6 flex items-center gap-2 sm:gap-3">
            <CreditsDisplay onCreditsUpdate={setUserCredits} />
            <div className="mr-2">
              <ThemeToggler />
            </div>
            <div className="scale-75 sm:scale-100">
              <UserButton />
            </div>
          </div>
        </div>
      )}

      {/* In-call status badges */}
      {isCallActive && (
        <div className="flex justify-center gap-2 p-4 flex-shrink-0">
          <Badge
            variant="white"
            className="text-xs px-2 py-1"
          >
            {callStatus === "idle" ? (
              <>
                <PhoneOff className="mr-1 h-3 w-3" />
                Ready to Start
              </>
            ) : callStatus === "connecting" ? (
              <>
                <Phone className="mr-1 h-3 w-3" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="mr-1 h-3 w-3" />
                Live Call
              </>
            )}
          </Badge>
          {isListening && (
            <Badge variant="default" className="animate-pulse text-xs px-2 py-1 bg-blue-500">
              <Mic className="mr-1 h-3 w-3" />
              Listening
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="white" className="animate-pulse text-xs px-2 py-1">
              <Volume2 className="mr-1 h-3 w-3" />
              Zara Speaking
            </Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      {!isCallActive ? (
        /* Simplified Start Interface */
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6">
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
              Roleplay With Zara
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Sharpen your sales skills with a challenging scenario and remember to review your post-call report
            </p>
          </div>

          {/* Main Liquid Orb Button - always show */}
          <div className="mb-12 sm:mb-16">
            {/* <LiquidOrbButton
              size="xl"
              className="h-48 w-48 sm:h-64 sm:w-64"
              disabled={false}
            >
              <span></span>
            </LiquidOrbButton> */}
          </div>

          {/* Choose Scenario Button - only show when no scenario selected */}
          {!currentScenario && (
            <Button
              onClick={() => setShowCommandPalette(true)}
              size="lg"
              variant="default"
              className="mb-4"
            >
              <Phone className="mr-3 h-6 w-6" />
              Choose Scenario & Start Call
            </Button>
          )}

          {/* Start Call Button - only show when scenario is selected */}
          {currentScenario && (
            <div className="text-center space-x-4 flex justify-center items-center">
              <Button
                onClick={startCall}
                disabled={!currentScenario}
                size="lg"
                variant="default"
              >
                <Phone className="mr-3 h-6 w-6" />
                Start Call: {currentScenario.title}
              </Button>
              <Button
                onClick={() => setShowCommandPalette(true)}
                size="lg"
                variant="default"
              >
                Change Scenario
              </Button>
            </div>
          )}

          {!currentScenario && (
            <p className="mt-4 max-w-sm text-center text-sm text-muted-foreground">
              Use the button above to select a scenario and character before starting a call
            </p>
          )}

          {currentScenario && userCredits < 0.45 && (
            <p className="mt-4 max-w-sm text-center text-sm text-orange-600">
              ⚠️ Low credits detected. Add more credits to ensure uninterrupted sessions.
            </p>
          )}
        </div>
      ) : (
        /* During Call - Unified Layout */
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6 overflow-hidden">
          {/* Status Text */}
          <div className="mb-8 text-center">
            {callStatus === "user_turn" ? (
              <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                {isListening ? "Listening... speak naturally" : "Getting ready to listen..."}
              </p>
            ) : callStatus === "ai_turn" ? (
              <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                Zara is thinking...
              </p>
            ) : isPlaying ? (
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                🔊 Zara is speaking
              </p>
            ) : (
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                📞 Call in progress
              </p>
            )}

            {currentTranscript && (
              <div className="mx-auto mt-4 max-w-md rounded-xl bg-white/20 p-4 backdrop-blur-sm dark:bg-black/20">
                <p className="mb-1 text-sm text-muted-foreground">You said:</p>
                <p className="text-sm font-medium italic">
                  "{currentTranscript}"
                </p>
              </div>
            )}
          </div>

          {/* Visual Indicator Orb */}
          <div className="mb-8">
            <LiquidOrbButton
                disabled={true}
                isPressed={isListening || isRecording}
                size="xl"
                className="h-56 w-56 sm:h-72 sm:w-72 cursor-default"
            >
              <span className="text-sm font-medium">
                {isListening ? "🎤" : isPlaying ? "🔊" : "💬"}
              </span>
            </LiquidOrbButton>
          </div>

          <div className="mb-8 max-w-xs text-center text-sm text-muted-foreground">
            {callStatus === "user_turn"
              ? "Speak naturally - the system is listening automatically"
              : isPlaying
                ? "Listen to Zara's response"
                : "Natural conversation in progress"}
          </div>

          {/* Text Input - Full Width */}
          <div className="mb-8 w-full max-w-2xl">
            <div className="flex gap-3">
              <Input
                placeholder="Type your message if voice isn't working..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && !e.shiftKey && sendTextMessage()
                }
                disabled={isLoading || !isCallActive}
                className="placeholder:text-slate/50 flex-1 border-white/30 bg-white/20 backdrop-blur-sm dark:border-white/20 dark:bg-black/20"
              />
              <Button
                onClick={sendTextMessage}
                disabled={isLoading || !currentMessage.trim() || !isCallActive}
                className=" border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                variant="outline"
              >
                Send
              </Button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="fixed bottom-8 left-1/2 w-full max-w-4xl -translate-x-1/2 transform px-4">
            {/* Call Controls */}
            <div className="mb-4 flex justify-center gap-4">
              <Button
                onClick={toggleMute}
                variant={isMuted ? "default" : "outline"}
                className={
                  isMuted
                    ? ""
                    : "border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                }
              >
                {isMuted ? (
                  <>
                    <VolumeX className="mr-2 h-4 w-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Mute AI
                  </>
                )}
              </Button>

              {isPlaying && (
                <Button
                  onClick={stopCurrentAudio}
                  variant="outline"
                  className="border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                >
                  <VolumeX className="mr-2 h-4 w-4" />
                  Stop AI
                </Button>
              )}

              <Button
                onClick={endCall}
                variant="destructive"
                className="bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80"
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                End Call
              </Button>

              <Button
                onClick={getFeedback}
                variant="outline"
                disabled={isLoading || messages.length === 0}
                className="border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
              >
                {isLoading ? "Generating..." : "Get Feedback"}
              </Button>
            </div>

            {/* Collapsible Transcript */}
            <Collapsible
              open={isTranscriptOpen}
              onOpenChange={setIsTranscriptOpen}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
                >
                  <span className="mr-2">Live Transcript</span>
                  {isTranscriptOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4">
                <div className="max-h-80 overflow-y-auto rounded-xl bg-white/10 p-6 backdrop-blur-sm dark:bg-black/20">
                  <div className="space-y-3">
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={`rounded-lg border-l-4 p-4 ${
                            message.role === "user"
                              ? "border-l-green-500 bg-green-500/20"
                              : "border-l-blue-500 bg-blue-500/20"
                          }`}
                        >
                          <div className="mb-2 text-xs font-medium text-white/70">
                            {message.role === "user"
                              ? "🫅 You"
                              : "🧑‍🦳 Zara"}
                          </div>
                          <div className="text-sm text-white">
                            {message.text}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-white/70">
                        <p>Conversation will appear here...</p>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      )}
      
      {/* Footer - Fixed at bottom */}
      <footer className="py-3 px-6 flex-shrink-0">
        <div className="flex flex-row items-center justify-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <a href="https://consuelohq.com" className="underline  transition-colors">
              Consuelo v0.0.7
            </a>
            <span className=" hidden sm:inline">-</span>
            <span className=" hidden sm:inline">The Modern Workspace for Sales</span>
          </div>
          <div className="h-2.5 w-px bg-slate-400"></div>
          <a href="https://workforce.consuelohq.com/" className="underline transition-colors">
            Employees
          </a>
          <div className="h-2.5 w-px bg-slate-400"></div>
          <a href="https://calls.consuelohq.com/" className="underline transition-colors">
            Calls
          </a>
        </div>
      </footer>

      {/* Sign-in overlay for unauthenticated users */}
      {isLoaded && !isSignedIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-white/95 backdrop-blur-md shadow-2xl border border-white/20",
                }
              }}
              redirectUrl="/roleplay"
            />
          </div>
        </div>
      )}

      {/* Command Palette */}
      <RoleplayCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onStartSession={handleStartSession}
        onResumeSession={handleResumeSession}
        currentUser={user?.id || "anonymous"}
        theme={theme}
        onThemeChange={handleThemeChange}
        voiceEnabled={voiceEnabled}
        onVoiceToggle={handleVoiceToggle}
      />
    </div>
  );
}