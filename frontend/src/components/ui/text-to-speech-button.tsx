"use client";

import { Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";

interface TextToSpeechButtonProps {
  text: string;
  language?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function TextToSpeechButton({ 
  text, 
  language = "en", 
  className = "",
  variant = "ghost",
  size = "icon"
}: TextToSpeechButtonProps) {
  const { isSpeaking, isSupported, speak, stop, error } = useTextToSpeech();

  if (!isSupported) {
    return null;
  }

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text, language);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={`transition-all duration-300 ${
          isSpeaking 
            ? "text-indigo-600 bg-indigo-100 hover:bg-indigo-200" 
            : "text-gray-500 hover:text-indigo-600"
        } ${className}`}
        onClick={handleToggle}
        title={isSpeaking ? "Stop listening" : "Listen aloud"}
      >
        {isSpeaking ? (
          <Square className="h-4 w-4 fill-current" />
        ) : (
          <Volume2 className="h-4 w-4" />
        )}
      </Button>

      {error && !isSpeaking && (
        <div className="absolute bottom-full mb-2 right-0 w-48 bg-red-600 text-white text-xs p-2 rounded shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}
