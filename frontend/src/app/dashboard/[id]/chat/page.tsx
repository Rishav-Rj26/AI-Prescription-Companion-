"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrescription } from "@/lib/queries/prescriptions";
import { useChatSessions, useCreateChatSession, useChatSession, useSendMessage } from "@/lib/queries/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, User as UserIcon, Bot, BookOpen, Loader2, Info } from "lucide-react";
import { ChatSession, ChatMessage, Citation } from "@/types/chat";
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
    if (!citations || citations.length === 0) return <p className="whitespace-pre-wrap">{content}</p>;

    let processedContent = content;
    // Basic replacement for demo purposes. In reality, React replacement requires more complex tokenization to inject components
    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap">{content}</p>
        
        {citations.length > 0 && (
          <div className="pt-2 border-t border-indigo-100 flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-indigo-700 font-semibold flex items-center">
              <BookOpen className="h-3 w-3 mr-1" /> Sources:
            </span>
            {citations.map((cite, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="cursor-pointer bg-white text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                onClick={() => openSource(cite.source_id)}
              >
                [{cite.source_id}] {cite.source_title}
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (sessionsLoading || sessionLoading || !activeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b py-3 px-4 shrink-0 shadow-sm flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/${prescriptionId}`)}>
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Assistant</h1>
            <p className="text-xs text-gray-500">Prescription #{prescriptionId}</p>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* Intro Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex gap-3 text-sm text-indigo-900 mb-4 mx-auto max-w-3xl w-full">
          <Info className="h-5 w-5 text-indigo-600 shrink-0" />
          <div>
            <p className="font-semibold">Ask about your prescription</p>
            <p className="text-indigo-700/80 mt-1">
              I can answer questions based on the extracted medicines/tests and our verified medical knowledge base. 
              I cannot provide medical advice.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto w-full space-y-6">
          {activeSession.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-gray-200' : 'bg-indigo-600'
              }`}>
                {msg.role === 'user' ? <UserIcon className="h-4 w-4 text-gray-600" /> : <Bot className="h-4 w-4 text-white" />}
              </div>
              
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-gray-900 text-white rounded-tr-sm' 
                  : 'bg-white border shadow-sm rounded-tl-sm text-gray-800'
              }`}>
                {renderMessageContent(msg.content, msg.citations)}
              </div>
            </div>
          ))}
          
          {isSending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about this prescription..."
              className="flex-1 shadow-sm"
              disabled={isSending}
            />
            <Button type="submit" disabled={!inputMessage.trim() || isSending} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </footer>

      {/* Source Modal */}
      {sourceModalContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                {sourceModalContent.title}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSourceModalContent(null)}>Close</Button>
            </div>
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700">
              {sourceModalContent.text}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
