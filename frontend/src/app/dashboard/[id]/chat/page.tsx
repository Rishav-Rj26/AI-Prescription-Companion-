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
    <div className="flex flex-col flex-1 w-full bg-background min-h-[calc(100vh-80px)]">
      {/* Header Context Bar */}
      <div className="bg-surface-container-low border-b border-outline-variant/60 py-3.5 px-6 md:px-space-xl shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/${prescriptionId}`)} className="hover:bg-surface-container-highest">
              <ArrowLeft className="h-5 w-5 text-on-surface-variant" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">Prescription Companion Chat</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Prescription #{prescriptionId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Safety Reminder Banner */}
      <aside aria-label="Clinical Notice" className="bg-[#FEF7EA] border-b border-[#F5D59A] px-6 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[#78350F] flex-shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <p className="font-body-md text-body-md text-[#78350F]">
              <strong className="font-semibold">Clinical Disclaimer:</strong> This companion explains your prescription in plain language. It does <strong className="font-semibold underline">NOT</strong> provide medical advice or diagnosis.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#EDF7EE] border border-[#B8E2BE] px-3 py-1 rounded-full shrink-0">
            <ShieldCheck className="text-[#14532D] h-4 w-4" />
            <span className="font-label-sm text-label-sm font-semibold text-[#14532D]">Verified Safe System</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 md:px-space-xl flex flex-col gap-4 bg-surface-container-highest/30">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {activeSession.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex-shrink-0 flex items-center justify-center shadow-sm">
                  <Bot className="h-[20px] w-[20px]" />
                </div>
              )}
              
              <div className={`max-w-[85%] relative ${
                msg.role === 'user' 
                  ? 'bg-primary text-on-primary rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm' 
                  : 'bg-surface-container-lowest border border-outline-variant rounded-2xl rounded-tl-sm px-6 py-5 text-on-surface tier-1-card'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b border-outline-variant/60">
                    <span className="font-label-lg text-label-lg font-bold text-primary flex items-center gap-2">
                      Rx Companion
                      <span className="font-label-sm text-label-sm font-normal text-on-surface-variant">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold bg-[#EDF7EE] text-[#14532D] border border-[#B8E2BE]">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                      <TextToSpeechButton 
                        text={msg.content} 
                        language={user?.preferred_language || "en"} 
                        size="icon" 
                        className="h-8 w-8 rounded-lg text-primary hover:bg-secondary-container hover:text-on-secondary-container" 
                      />
                    </div>
                  </div>
                )}
                <div className="font-body-md text-[15px] leading-relaxed">
                  {renderMessageContent(msg.content, msg.citations)}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex-shrink-0 flex items-center justify-center shadow-sm">
                  <UserIcon className="h-[20px] w-[20px]" />
                </div>
              )}
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="h-[20px] w-[20px]" />
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant tier-1-card rounded-2xl rounded-tl-sm px-6 py-5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2.5 w-2.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2.5 w-2.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-3 relative">
            <div className="flex-1 relative">
              <Input 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask a question about this prescription..."
                className="w-full shadow-sm pr-12 h-14 rounded-xl border-outline font-body-md text-body-md focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary bg-surface-container-lowest"
                disabled={isSending}
              />
              <div className="absolute right-2 top-2">
                <VoiceInputButton 
                  language={user?.preferred_language || "en"}
                  disabled={isSending}
                  onTranscriptComplete={(transcript) => {
                    setInputMessage(prev => (prev ? prev + " " + transcript : transcript));
                  }}
                />
              </div>
            </div>
            <Button type="submit" disabled={!inputMessage.trim() || isSending} className="bg-primary hover:bg-primary-container text-on-primary h-14 px-6 rounded-xl shadow-sm transition-all active:scale-95">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </footer>

      {/* Source Modal */}
      {sourceModalContent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col rounded-2xl overflow-hidden tier-2-card bg-surface-container-lowest border-outline-variant">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-sm text-headline-sm font-bold text-primary flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                {sourceModalContent.title}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSourceModalContent(null)} className="rounded-lg hover:bg-surface-container-highest text-on-surface-variant">Close</Button>
            </div>
            <div className="p-6 overflow-y-auto whitespace-pre-wrap font-body-md text-body-md text-on-surface leading-relaxed">
              {sourceModalContent.text}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
