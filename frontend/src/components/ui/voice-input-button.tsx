"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { MicPermissionDialog } from "./mic-permission-dialog";

interface VoiceInputButtonProps {
  onTranscriptComplete: (transcript: string) => void;
  language?: string;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscriptComplete, language = "en", disabled = false }: VoiceInputButtonProps) {
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [hasSeenPermissionDialog, setHasSeenPermissionDialog] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { 
    isListening, 
    isSupported, 
    error, 
    startListening, 
    stopListening, 
    transcript,
    resetTranscript 
  } = useSpeechRecognition();

  // Load permission state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("mic_permission_seen") === "true";
      setHasSeenPermissionDialog(seen);
    }
  }, []);

  // Handle STT errors
  useEffect(() => {
    if (error) {
      setLocalError(error);
      // Auto-clear error after 5s
      const timer = setTimeout(() => setLocalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // If unsupported by browser, hide completely
  if (!isSupported) {
    return null;
  }

  const handleToggleListen = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onTranscriptComplete(transcript);
        resetTranscript();
      }
    } else {
      if (!hasSeenPermissionDialog) {
        setShowPermissionDialog(true);
      } else {
        startListening(language);
      }
    }
  };

  const handlePermissionConfirm = () => {
    localStorage.setItem("mic_permission_seen", "true");
    setHasSeenPermissionDialog(true);
    startListening(language);
  };

  return (
    <div className="relative flex items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-10 w-10 shrink-0 rounded-full transition-all duration-300 ${
          isListening 
            ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 animate-pulse ring-2 ring-red-200" 
            : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleToggleListen}
        disabled={disabled}
        title={isListening ? "Stop listening" : "Speak to type"}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      {/* Error Tooltip overlay */}
      {localError && !isListening && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-red-600 text-white text-xs p-2 rounded shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {localError}
          <div className="absolute top-full right-4 border-4 border-transparent border-t-red-600" />
        </div>
      )}

      {/* Live transcript preview indicator (optional but good for UX) */}
      {isListening && transcript && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-gray-900 text-white text-sm p-3 rounded shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Listening...
          </div>
          <p className="italic text-gray-200 break-words">{transcript}</p>
          <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900" />
        </div>
      )}

      <MicPermissionDialog 
        open={showPermissionDialog} 
        onOpenChange={setShowPermissionDialog}
        onConfirm={handlePermissionConfirm}
      />
    </div>
  );
}
