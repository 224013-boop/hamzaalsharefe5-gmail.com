
import React, { useState, useEffect, useRef } from 'react';
import { createChatSession, sendMessage, transcribeAudio } from './services/geminiService';
import { ChatMessage as ChatMessageComponent } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { ChatMessage, LoadingState, LocationCoords } from './types';
import { Chat } from '@google/genai';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "أهلاً وسهلاً في صالون مسودة! 💇‍♂️✨\nأنا هون عشان أجاوب على كل استفساراتك.\n\n⏰ دوامنا: يومياً من 10:30 صباحاً - 9:00 مساءً.\n🚭 ملاحظة: التدخين ممنوع داخل المحل.\n\nكيف بقدر أساعدك اليوم؟",
      timestamp: new Date(),
    }
  ]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Idle);
  const chatSessionRef = useRef<Chat | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | undefined>(undefined);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Chat Session with location if available
  useEffect(() => {
    const initChat = async () => {
      // Try to get location for Maps Grounding
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            setUserLocation(loc);
            chatSessionRef.current = createChatSession(loc);
          },
          (err) => {
            console.warn("Geolocation denied or error, initializing without location", err);
            chatSessionRef.current = createChatSession();
          }
        );
      } else {
        chatSessionRef.current = createChatSession();
      }
    };

    initChat();
  }, []);

  // Re-initialize if location is found later (optional optimization, skipping for simplicity)

  const handleUserMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setLoadingState(LoadingState.Thinking);

    try {
      const response = await sendMessage(chatSessionRef.current, text);
      const responseText = response.text || "عفواً، ما فهمت عليك. ممكن تعيد؟";
      
      // Extract Grounding Metadata
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        groundingChunks: groundingChunks as any, // Using any to bypass strict type mapping for simplicity in demo
      };

      setMessages((prev) => [...prev, botMessage]);
      setLoadingState(LoadingState.Idle);

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "صار في مشكلة صغيرة بالاتصال، جرب كمان مرة لو سمحت.",
        timestamp: new Date(),
      }]);
      setLoadingState(LoadingState.Idle);
    }
  };

  const handleAudioInput = async (base64Audio: string) => {
    setLoadingState(LoadingState.Transcribing);
    try {
      const transcribedText = await transcribeAudio(base64Audio);
      if (transcribedText.trim()) {
        handleUserMessage(transcribedText);
      } else {
        setLoadingState(LoadingState.Idle);
        alert("Didn't catch that. Please try speaking again.");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      setLoadingState(LoadingState.Idle);
      alert("Error transcribing audio.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-900 border-b border-amber-600/30 p-4 shadow-lg z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-amber-900/50 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <h1 className="font-bold text-lg text-slate-100 tracking-wide">Maswadh Salon AI</h1>
                <div className="flex flex-col">
                    <p className="text-xs text-amber-500 font-medium">Hebron's Finest • Virtual Assistant</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Daily 10:30 AM - 9:00 PM
                    </p>
                </div>
            </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 scroll-smooth relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className="max-w-3xl mx-auto pb-4">
          {messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Area */}
      <InputArea 
        onSendMessage={handleUserMessage} 
        onSendAudio={handleAudioInput}
        loadingState={loadingState}
      />
    </div>
  );
};

export default App;
