"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechRecognitionResultLike {
  0: { transcript: string };
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: (lang?: string) => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(
    () => typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening until explicitly stopped
    recognition.interimResults = true; // Get interim results for better UX

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      switch (event.error) {
        case 'not-allowed':
          setError("Microphone access denied. Please enable it in your browser settings.");
          setIsSupported(false); // Essentially unsupported if denied
          break;
        case 'no-speech':
          setError("No speech was detected. Please try again.");
          break;
        case 'network':
          setError("A network error occurred. Speech recognition requires an internet connection on this browser.");
          break;
        default:
          setError(`Speech recognition failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(async (lang: string = "en") => {
    setError(null);
    setTranscript("");
    
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      // Explicitly request mic permission first to catch denial cleanly
      // and explain it if needed, before the recognition API fails cryptically.
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const bcp47Lang = lang === "hi" ? "hi-IN" : "en-US";
      recognitionRef.current.lang = bcp47Lang;
      
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: unknown) {
      console.error("Failed to start listening:", err);
      const name = err instanceof DOMException ? err.name : "";
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setError("Microphone access denied. Please enable it in your browser settings.");
        setIsSupported(false);
      } else {
        setError("Could not access the microphone. It may be in use by another application.");
      }
      setIsListening(false);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
}
