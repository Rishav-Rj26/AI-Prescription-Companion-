"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrescription } from "@/lib/queries/prescriptions";
import { useChatSessions, useCreateChatSession, useChatSession, useSendMessage } from "@/lib/queries/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User as UserIcon, Bot, BookOpen, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { ChatSession, ChatMessage, Citation } from "@/types/chat";
import { VoiceInputButton } from "@/components/ui/voice-input-button";
import { TextToSpeechButton } from "@/components/ui/text-to-speech-button";
import { useCurrentUser } from "@/lib/queries/user";
import api from "@/lib/api";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const prescriptionId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const { data: prescription } = usePrescription(prescriptionId);
  const { data: sessions, isLoading: sessionsLoading } = useChatSessions();
  const { mutateAsync: createSession, isPending: isCreating } = useCreateChatSession();
  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage();

  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const { data: activeSession, isLoading: sessionLoading, refetch } = useChatSession(activeSessionId || 0);
  const { data: user } = useCurrentUser();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sourceModalContent, setSourceModalContent] = useState<{title: string, text: string} | null>(null);

  // Initialize session
  useEffect(() => {
    if (sessions && sessions.length >= 0 && !activeSessionId && !sessionsLoading) {
      // Find session for this prescription
      const existingSession = sessions.find(s => s.prescription_id === prescriptionId);
      if (existingSession) {
        setActiveSessionId(existingSession.id);
      } else if (!isCreating) {
        // Create new session
        createSession(prescriptionId).then(newSession => {
          setActiveSessionId(newSession.id);
        });
      }
    }
  }, [sessions, prescriptionId, activeSessionId, sessionsLoading, createSession, isCreating]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeSessionId) return;

    const content = inputMessage;
    setInputMessage(""); // Optimistic clear
    
    // Send to backend
    await sendMessage({ sessionId: activeSessionId, content });
    refetch(); // Refresh session to get assistant response
  };

  const openSource = async (sourceId: number) => {
    try {
      const { data } = await api.get(`/sources/${sourceId}`);
      setSourceModalContent({
        title: data.title,
        text: data.content_text
      });
    } catch (error) {
      console.error("Failed to fetch source", error);
    }
  };

  // Replace [Source: X] in content with interactive pills
  const renderMessageContent = (content: string, citations: Citation[]) => {
    if (!citations || citations.length === 0) return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;

    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        
        {citations.length > 0 && (
          <div className="pt-3 border-t border-[#e6ecf1] flex flex-col gap-2 mt-2">
            <span className="text-[12px] font-semibold text-[#1e4263] flex items-center gap-1.5 tracking-wide">
              <BookOpen className="h-3.5 w-3.5 text-[#2e7977]" /> Verified Sources:
            </span>
            <div className="flex flex-wrap gap-2">
              {citations.map((cite, idx) => (
                <button
                  key={idx} 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f4f8] border border-[#cbd5e1] text-[#1e4263] hover:bg-[#e2eaf1] text-[12px] font-semibold tracking-[0.02em] uppercase transition-colors cursor-pointer"
                  onClick={() => openSource(cite.source_id)}
                >
                  <BookOpen className="h-3 w-3 text-[#2e7977]" />
                  <span>{cite.source_title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (sessionsLoading || sessionLoading || !activeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e4263]" />
          <p className="text-[13px] text-[#4a5866] font-medium">Loading conversation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#f6f8fa]">
      {/* Header */}
      <header className="bg-white border-b border-[#e6ecf1] py-3 px-5 shrink-0 shadow-sm flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/${prescriptionId}`)} className="rounded-xl hover:bg-[#ecf4fe]">
            <ArrowLeft className="h-5 w-5 text-[#4a5866]" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1e4263] text-white flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[#1e4263] tracking-tight">Prescription Companion Chat</h1>
              <p className="text-[12px] text-[#4a5866]">Prescription #{prescriptionId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Clinical Disclaimer Banner */}
      <aside className="bg-[#fff8e6] border-b border-[#f5d59a] px-5 py-2.5 text-[#78350f] shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2.5 text-[12px]">
          <AlertTriangle className="h-4 w-4 text-[#b45309] shrink-0" />
          <p className="leading-relaxed">
            <strong className="font-semibold text-[#5b2500]">Clinical Disclaimer:</strong> This companion explains your prescription in plain language. It does <strong className="font-semibold">NOT</strong> provide medical advice or diagnosis.
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <div className="max-w-3xl mx-auto w-full space-y-5">
          {activeSession.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-[#1e4263] text-white flex-shrink-0 flex items-center justify-center shadow-sm">
                  <Bot className="h-[18px] w-[18px]" />
                </div>
              )}
              
              <div className={`max-w-[85%] relative ${
                msg.role === 'user' 
                  ? 'bg-[#1e4263] text-white rounded-2xl rounded-br-sm px-5 py-3.5 shadow-sm' 
                  : 'bg-white border border-[#e6ecf1] rounded-2xl rounded-tl-sm px-5 py-4 text-[#192128] tier-1-card'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-[#e6ecf1]">
                    <span className="text-[13px] font-bold text-[#1e4263] flex items-center gap-1.5">
                      Rx Companion
                      <span className="font-normal text-[#73777e] text-[11px]">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#edf7ee] text-[#14532d] border border-[#b8e2be]">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                      <TextToSpeechButton 
                        text={msg.content} 
                        language={user?.preferred_language || "en"} 
                        size="icon" 
                        className="h-7 w-7 rounded-lg text-[#1e4263] hover:bg-[#ecf4fe]" 
                      />
                    </div>
                  </div>
                )}
                <div className="text-[15px] leading-relaxed">
                  {renderMessageContent(msg.content, msg.citations)}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-[#ecf4fe] text-[#1e4263] flex-shrink-0 flex items-center justify-center shadow-sm">
                  <UserIcon className="h-[18px] w-[18px]" />
                </div>
              )}
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#1e4263] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="h-[18px] w-[18px]" />
              </div>
              <div className="bg-white border border-[#e6ecf1] tier-1-card rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                <span className="h-2 w-2 bg-[#73777e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-[#73777e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-[#73777e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-[#e6ecf1] p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-3">
            <div className="flex-1 relative">
              <Input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about this prescription..."
                className="w-full shadow-sm pr-12 h-12 rounded-xl border-[#cbd5e1] text-[15px] focus:border-[#1e4263] focus:ring-[#1e4263]"
                disabled={isSending}
              />
              <div className="absolute right-1 top-1">
                <VoiceInputButton 
                  language={user?.preferred_language || "en"}
                  disabled={isSending}
                  onTranscriptComplete={(transcript) => {
                    setInputMessage(prev => (prev ? prev + " " + transcript : transcript));
                  }}
                />
              </div>
            </div>
            <Button type="submit" disabled={!inputMessage.trim() || isSending} className="bg-[#1e4263] hover:bg-[#002c4b] h-12 px-5 rounded-xl shadow-sm">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </footer>

      {/* Source Modal */}
      {sourceModalContent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col tier-2-floating rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#e6ecf1] flex justify-between items-center bg-[#f6f8fa]">
              <h3 className="font-bold text-[17px] text-[#1e4263] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#2e7977]" />
                {sourceModalContent.title}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSourceModalContent(null)} className="rounded-lg hover:bg-white">Close</Button>
            </div>
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-[15px] text-[#4a5866] leading-relaxed">
              {sourceModalContent.text}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
