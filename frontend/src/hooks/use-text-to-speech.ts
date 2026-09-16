"use client";

import { useState, useEffect, useCallback } from "react";

const DISCLAIMER_EN = "Note: This is AI-generated informational content and does not constitute medical advice. ";
const DISCLAIMER_HI = "ध्यान दें: यह एआई द्वारा उत्पन्न सूचनात्मक सामग्री है और यह चिकित्सा सलाह नहीं है। ";

export interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  isSupported: boolean;
  error: string | null;
  speak: (text: string, lang?: string) => void;
  stop: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  const speak = useCallback((text: string, lang: string = "en") => {
    setError(null);
    if (!isSupported) {
      setError("Text to speech is not supported in this browser.");
      return;
    }

    // Stop any ongoing speech
    stop();

    // Prepare text with disclaimer
    const bcp47Lang = lang === "hi" ? "hi-IN" : "en-US";
    const disclaimer = lang === "hi" ? DISCLAIMER_HI : DISCLAIMER_EN;
    const textToSpeak = disclaimer + text;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = bcp47Lang;
    
    // Select best voice
    if (voices.length > 0) {
      // Try to find a voice that matches the exact language tag
      let voice = voices.find(v => v.lang === bcp47Lang);
      
      // Fallback to primary language prefix if exact match not found
      if (!voice) {
        voice = voices.find(v => v.lang.startsWith(lang));
      }
      
      if (voice) {
        utterance.voice = voice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      if (event.error !== "canceled") {
        setError(`Failed to read text: ${event.error}`);
      }
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSupported, stop, voices]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isSpeaking,
    isSupported,
    error,
    speak,
    stop
  };
}
