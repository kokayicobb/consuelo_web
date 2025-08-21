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
import LiquidOrbButton from "@/components/roleplay/LiquidOrbButton";
import RoleplaySettings from "@/components/roleplay/settings";

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
  const [scenario, setScenario] = useState("");
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
  const [isPushToTalkPressed, setIsPushToTalkPressed] = useState(false);

  // Modal states
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const endCall = useCallback(() => {
    setIsCallActive(false);
    setIsSessionActive(false);
    setCallStatus("idle");
    setIsRecording(false);
    setIsPlaying(false);
    setCurrentTranscript("");
    isProcessingRef.current = false;

    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    stopCurrentAudio();

    // Clean up media streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    toast.success("Call ended");
  }, []);
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
  }, [endCall]);

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
    if (!scenario.trim()) {
      toast.error("Please enter a scenario first");
      return;
    }

    setCallStatus("connecting");

    try {
      // Request microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

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
    } catch (error) {
      toast.error("Failed to connect. Please allow microphone access.");
      console.error("Error starting call:", error);
      setCallStatus("idle");
    }
  };

  const handlePushToTalkStart = () => {
    if (!isCallActive || isPlaying || callStatus !== "user_turn") return;

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

          // Process audio if we have any content
          if (audioBlob.size > 1000) {
            await processAudioChunk(audioBlob);
          }
        }
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

      if (data.text && data.text.trim().length > 2) {
        console.log("🎤 Transcribed:", data.text);
        setCurrentTranscript(data.text);

        // Process the transcribed text
        if (!isProcessingRef.current) {
          await handleUserSpeech(data.text.trim());
        }
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

    // Use the current messages state for the API call
    setMessages(prevMessages => {
      const userMessage: Message = { role: "user", text: transcript };
      const updatedMessages = [...prevMessages, userMessage];
      console.log("🔍 DEBUG: Updated messages with user message:", updatedMessages);
      
      // Call API with the updated messages
      getAIResponseAndUpdateMessages(transcript, updatedMessages);
      
      return updatedMessages;
    });
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
        scenario: scenario,
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
    setScenario("");
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
          scenario: scenario,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
      {/* Header with centered status */}
      {!isCallActive && (
        <div className="relative flex items-center justify-center p-4 sm:p-6">
          {/* Centered Status Badge */}
          <Badge
            variant={
              callStatus === "active" ||
              callStatus === "listening" ||
              callStatus === "speaking"
                ? "default"
                : "secondary"
            }
            className="px-4 py-2 text-sm sm:text-base"
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

          {/* Settings Icon - Right side, inline with status */}
          <div className="absolute right-4 sm:right-6">
            <RoleplaySettings
              scenario={scenario}
              setScenario={setScenario}
              availableVoices={availableVoices}
              selectedVoiceId={selectedVoiceId}
              setSelectedVoiceId={setSelectedVoiceId}
              isLoadingVoices={isLoadingVoices}
            />
          </div>
        </div>
      )}

      {/* In-call status badges */}
      {isCallActive && (
        <div className="flex justify-center gap-2 p-4">
          <Badge
            variant={
              callStatus === "active" ||
              callStatus === "listening" ||
              callStatus === "speaking"
                ? "default"
                : "secondary"
            }
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
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Mic className="mr-1 h-3 w-3" />
              Recording
            </Badge>
          )}
          {isPlaying && (
            <Badge variant="default" className="animate-pulse">
              <Volume2 className="mr-1 h-3 w-3" />
              AI Speaking
            </Badge>
          )}
        </div>
      )}

      {/* Main Content */}
      {!isCallActive ? (
        /* Simplified Start Interface */
        <div className="-mt-20 flex min-h-screen flex-col items-center justify-center px-4 sm:-mt-24 sm:px-6">
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
              Roleplay With Zara
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Sharpen your sales skills with a challenging scenario and remember to review your post-call report
            </p>
          </div>

          {/* Main Liquid Orb Button */}
          <div className="mb-12 sm:mb-16">
            <LiquidOrbButton
              size="xl"
              className="h-48 w-48 sm:h-64 sm:w-64"
              disabled={false}
            >
              <span></span>
            </LiquidOrbButton>
          </div>

          {/* Start Call Button */}
          <Button
            onClick={startCall}
            disabled={!scenario.trim()}
            size="lg"
            variant="default"
            // className="text: bg-white bg-gradient-to-r from-purple-600 to-pink-600 px-12 py-6 text-lg font-semibold hover:from-purple-700 hover:to-pink-700"
          >
            <Phone className="mr-3 h-6 w-6" />
            Start Voice Call
          </Button>

          {!scenario.trim() && (
            <p className="mt-4 max-w-sm text-center text-sm text-muted-foreground">
              Please set up your scenario using the settings icon in the top
              right corner before starting a call
            </p>
          )}
        </div>
      ) : (
        /* During Call - Unified Layout */
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6">
          {/* Status Text */}
          <div className="mb-8 text-center">
            {callStatus === "user_turn" ? (
              <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                Your turn - Press and hold to speak
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

          {/* Large Push-to-Talk Button */}
          <div className="mb-8">
            <LiquidOrbButton
                onMouseDown={handlePushToTalkStart}
                onMouseUp={handlePushToTalkEnd}
                onMouseLeave={handlePushToTalkEnd}
                onTouchStart={handlePushToTalkStart}
                onTouchEnd={handlePushToTalkEnd}
                disabled={callStatus !== "user_turn" || isPlaying}
                isPressed={isPushToTalkPressed}
                size="xl"
                className="h-56 w-56 sm:h-72 sm:w-72"
            >
              <span></span>
            </LiquidOrbButton>
          </div>

          <div className="mb-8 max-w-xs text-center text-sm text-muted-foreground">
            {callStatus === "user_turn"
              ? "Hold the button while speaking, then release when done"
              : isPlaying
                ? "Listen to the AI response"
                : "Wait for your turn to speak"}
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
                className="text-slate placeholder:text-slate/50 flex-1 border-white/30 bg-white/20 backdrop-blur-sm dark:border-white/20 dark:bg-black/20"
              />
              <Button
                onClick={sendTextMessage}
                disabled={isLoading || !currentMessage.trim() || !isCallActive}
                className="text-slate border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
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
                    : "text-slate border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
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
                  className="text-slate border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
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
                className="text-slate border-white/30 bg-white/20 backdrop-blur-sm hover:bg-white/30"
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
                  className="text-slate w-full border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20"
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
    </div>
  );
}